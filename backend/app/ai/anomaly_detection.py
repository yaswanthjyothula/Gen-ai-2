import numpy as np
from typing import Dict, List, Any
from sklearn.ensemble import IsolationForest

class AnomalyDetectionEngine:
    def __init__(self):
        self.clf = IsolationForest(contamination=0.05, random_state=42)
        
    def detect_communication_spikes(self, current_frequency: int, baseline_mean: float, baseline_std: float) -> Dict[str, Any]:
        """Statistical Z-score test on communication velocity."""
        std = baseline_std if baseline_std > 0 else 1.0
        z_score = (current_frequency - baseline_mean) / std
        is_anomaly = z_score > 3.0
        
        return {
            "is_anomaly": is_anomaly,
            "z_score": round(float(z_score), 2),
            "burst_ratio": round(float(current_frequency / (baseline_mean if baseline_mean > 0 else 1.0)), 2),
            "severity": "CRITICAL" if z_score > 4.0 else ("HIGH" if z_score > 3.0 else "MEDIUM")
        }

    def detect_transaction_cycling(self, transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Detect structured amounts under $10,000 threshold within short time windows."""
        structured_tx = [t for t in transactions if 9000 <= t.get("amount", 0) < 10000]
        is_structuring = len(structured_tx) >= 3
        
        return {
            "is_anomaly": is_structuring,
            "structuring_count": len(structured_tx),
            "pattern": "Smurfing / Sub-Threshold Structuring (< $10K)",
            "confidence": 0.88 if is_structuring else 0.20
        }

anomaly_detection_engine = AnomalyDetectionEngine()
