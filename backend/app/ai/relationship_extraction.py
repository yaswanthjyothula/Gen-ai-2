import re
from typing import List, Dict, Any

class RelationshipExtractor:
    def __init__(self):
        self.patterns = [
            (r"(?P<source>[\w\s\"]+) (?:transferred|wired|sent) \$(?P<amount>[\d,]+) to (?P<target>[\w\s\"]+)", "Financial", "Wired Funds"),
            (r"(?P<source>[\w\s\"]+) (?:called|telephoned|contacted) (?P<target>[\w\s\"]+)", "Communication", "Telephony Contact"),
            (r"(?P<source>[\w\s\"]+) (?:was seen with|met with|rendezvoused with) (?P<target>[\w\s\"]+)", "Association", "Direct Meeting"),
            (r"(?P<source>[\w\s\"]+) (?:operates|drives|was inside) (?P<target>[\w\s\"\-]+)", "Vehicle", "Vehicle Operator"),
            (r"(?P<source>[\w\s\"]+) (?:is director of|controls|registered) (?P<target>[\w\s\"]+)", "Organisation", "Corporate Controller"),
        ]

    def extract_relationships_from_text(self, text: str) -> List[Dict[str, Any]]:
        extracted = []
        for pattern, rel_type, label in self.patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for m in matches:
                d = m.groupdict()
                src = d.get("source", "").strip().strip('"')
                tgt = d.get("target", "").strip().strip('"')
                if src and tgt and src.lower() != tgt.lower():
                    extracted.append({
                        "source_name": src,
                        "target_name": tgt,
                        "relationship_type": rel_type,
                        "label": label,
                        "matched_span": m.group(0),
                        "confidence": 0.88,
                        "model": "NLP Rule-Based Relation Parser v1.0"
                    })
        return extracted

relationship_extractor = RelationshipExtractor()
