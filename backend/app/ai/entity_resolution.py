from typing import Dict, Any, List

def levenshtein_distance(s1: str, s2: str) -> int:
    if len(s1) > len(s2):
        s1, s2 = s2, s1
    distances = range(len(s1) + 1)
    for i2, c2 in enumerate(s2):
        distances_ = [i2 + 1]
        for i1, c1 in enumerate(s1):
            if c1 == c2:
                distances_.append(distances[i1])
            else:
                distances_.append(1 + min((distances[i1], distances[i1 + 1], distances_[-1])))
        distances = distances_
    return distances[-1]

def string_similarity(s1: str, s2: str) -> float:
    s1, s2 = s1.lower().strip(), s2.lower().strip()
    if not s1 or not s2:
        return 0.0
    if s1 == s2:
        return 1.0
    dist = levenshtein_distance(s1, s2)
    max_len = max(len(s1), len(s2))
    return round(1.0 - (dist / max_len), 4)

class EntityResolutionEngine:
    def compare_records(self, rec_a: Dict[str, Any], rec_b: Dict[str, Any]) -> Dict[str, Any]:
        """Multi-signal deterministic + fuzzy match."""
        name_sim = string_similarity(rec_a.get("name", ""), rec_b.get("name", ""))
        
        # DOB match
        dob_a = rec_a.get("dob")
        dob_b = rec_b.get("dob")
        dob_match = 1.0 if (dob_a and dob_b and dob_a == dob_b) else 0.0
        
        # Phone overlap
        phones_a = set(rec_a.get("phones", []))
        phones_b = set(rec_b.get("phones", []))
        phone_overlap = 1.0 if (phones_a and phones_b and len(phones_a.intersection(phones_b)) > 0) else 0.0
        
        # Address similarity
        addr_sim = string_similarity(rec_a.get("address", ""), rec_b.get("address", ""))
        
        # Weighted overall confidence
        weights = {"name": 0.35, "dob": 0.30, "phone": 0.25, "address": 0.10}
        confidence = (
            name_sim * weights["name"] +
            dob_match * weights["dob"] +
            phone_overlap * weights["phone"] +
            addr_sim * weights["address"]
        )
        
        return {
            "match_confidence": round(float(confidence), 3),
            "matching_signals": {
                "Name Similarity": round(name_sim, 2),
                "DOB Match": dob_match,
                "Phone Overlap": phone_overlap,
                "Address Proximity": round(addr_sim, 2)
            },
            "recommendation": "MERGE_CANDIDATE" if confidence >= 0.75 else "DISMISS"
        }

entity_resolution_engine = EntityResolutionEngine()
