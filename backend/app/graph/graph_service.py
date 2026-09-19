import datetime
import networkx as nx
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from app.models.entity import Entity, Community
from app.models.relationship import Relationship

class GraphService:
    def __init__(self):
        self.G = nx.MultiGraph()

    def build_graph_from_db(self, db: Session, case_id: Optional[str] = None):
        """Construct NetworkX graph from database entities and relationships."""
        self.G = nx.MultiGraph()
        
        query_ent = db.query(Entity)
        query_rel = db.query(Relationship)
        
        if case_id:
            query_ent = query_ent.filter_by(case_id=case_id)
            query_rel = query_rel.filter_by(case_id=case_id)
            
        entities = query_ent.all()
        relationships = query_rel.all()
        
        for ent in entities:
            self.G.add_node(
                ent.id,
                label=ent.name,
                name=ent.name,
                entity_type=ent.entity_type,
                category=ent.category,
                confidence=ent.confidence,
                risk_level=ent.risk_level,
                community_id=ent.community_id,
                degree_centrality=ent.degree_centrality or 0.0,
                betweenness_centrality=ent.betweenness_centrality or 0.0,
                attributes=ent.attributes or {}
            )
            
        for rel in relationships:
            self.G.add_edge(
                rel.source_entity_id,
                rel.target_entity_id,
                key=rel.id,
                id=rel.id,
                label=rel.label,
                relationship_type=rel.relationship_type,
                weight=rel.weight or 1.0,
                confidence=rel.confidence,
                verification_status=rel.verification_status,
                first_seen=rel.first_seen.isoformat() if rel.first_seen else None,
                last_seen=rel.last_seen.isoformat() if rel.last_seen else None,
                frequency=rel.frequency or 1,
                attributes=rel.attributes or {}
            )

    def compute_centrality_metrics(self) -> Dict[str, Dict[str, float]]:
        """Compute Degree, Betweenness, and Closeness centrality on simple projected graph."""
        if len(self.G) == 0:
            return {}
        simple_g = nx.Graph(self.G)
        
        deg = nx.degree_centrality(simple_g)
        bet = nx.betweenness_centrality(simple_g, weight="weight")
        try:
            cls_cen = nx.closeness_centrality(simple_g)
        except Exception:
            cls_cen = {n: 0.0 for n in simple_g.nodes()}
            
        return {
            "degree": deg,
            "betweenness": bet,
            "closeness": cls_cen
        }

    def detect_communities(self) -> Dict[str, int]:
        """Detect communities using Louvain modularity optimization."""
        if len(self.G) == 0:
            return {}
        simple_g = nx.Graph(self.G)
        try:
            communities = nx.community.louvain_communities(simple_g, seed=42)
            node_community_map = {}
            for idx, comm in enumerate(communities):
                for node in comm:
                    node_community_map[node] = idx + 1
            return node_community_map
        except Exception:
            return {node: 1 for node in simple_g.nodes()}

    def find_shortest_path(self, source_id: str, target_id: str) -> Optional[List[str]]:
        """Compute shortest path between two suspects."""
        simple_g = nx.Graph(self.G)
        if not simple_g.has_node(source_id) or not simple_g.has_node(target_id):
            return None
        try:
            return nx.shortest_path(simple_g, source=source_id, target=target_id, weight="weight")
        except nx.NetworkXNoPath:
            return None

    def get_ego_subgraph(self, node_id: str, radius: int = 1) -> List[str]:
        """Extract k-hop neighborhood."""
        simple_g = nx.Graph(self.G)
        if not simple_g.has_node(node_id):
            return []
        ego = nx.ego_graph(simple_g, node_id, radius=radius)
        return list(ego.nodes())

    def export_cytoscape_elements(
        self,
        date_from: Optional[datetime.datetime] = None,
        date_to: Optional[datetime.datetime] = None,
        entity_type_filter: Optional[List[str]] = None,
        relationship_type_filter: Optional[List[str]] = None,
        community_id_filter: Optional[str] = None
    ) -> Dict[str, Any]:
        """Export network in standard Cytoscape.js format with optional temporal and type filtering."""
        nodes = []
        edges = []
        
        # Filter nodes
        valid_node_ids = set()
        for node_id, data in self.G.nodes(data=True):
            if entity_type_filter and data.get("entity_type") not in entity_type_filter:
                continue
            if community_id_filter and data.get("community_id") != community_id_filter:
                continue
            valid_node_ids.add(node_id)
            nodes.append({
                "data": {
                    "id": node_id,
                    "label": data.get("label", node_id),
                    "name": data.get("name", node_id),
                    "entity_type": data.get("entity_type", "Unknown"),
                    "category": data.get("category", "General"),
                    "confidence": data.get("confidence", 1.0),
                    "risk_level": data.get("risk_level", "MEDIUM"),
                    "community_id": data.get("community_id", "COMM-01"),
                    "degree_centrality": data.get("degree_centrality", 0.0),
                    "betweenness_centrality": data.get("betweenness_centrality", 0.0),
                    "attributes": data.get("attributes", {})
                }
            })
            
        # Filter edges
        for u, v, k, data in self.G.edges(data=True, keys=True):
            if u not in valid_node_ids or v not in valid_node_ids:
                continue
            if relationship_type_filter and data.get("relationship_type") not in relationship_type_filter:
                continue
                
            # Temporal filtering
            if date_from or date_to:
                first_seen_str = data.get("first_seen")
                if first_seen_str:
                    try:
                        fs_dt = datetime.datetime.fromisoformat(first_seen_str)
                        if date_from and fs_dt < date_from:
                            continue
                        if date_to and fs_dt > date_to:
                            continue
                    except Exception:
                        pass
                        
            edges.append({
                "data": {
                    "id": data.get("id", f"{u}_{v}_{k}"),
                    "source": u,
                    "target": v,
                    "label": data.get("label", ""),
                    "relationship_type": data.get("relationship_type", "Association"),
                    "weight": data.get("weight", 1.0),
                    "confidence": data.get("confidence", 1.0),
                    "verification_status": data.get("verification_status", "VERIFIED"),
                    "first_seen": data.get("first_seen"),
                    "last_seen": data.get("last_seen"),
                    "frequency": data.get("frequency", 1),
                    "attributes": data.get("attributes", {})
                }
            })
            
        return {
            "nodes": nodes,
            "edges": edges,
            "statistics": {
                "total_nodes": len(nodes),
                "total_edges": len(edges),
                "density": round(nx.density(nx.Graph(self.G)), 4) if len(self.G) > 1 else 0.0,
                "connected_components": nx.number_connected_components(nx.Graph(self.G)) if len(self.G) > 0 else 0
            }
        }

graph_service = GraphService()
