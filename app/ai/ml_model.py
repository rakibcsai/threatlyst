import numpy as np
import joblib
from sklearn.ensemble import IsolationForest


class ThreatDetectionModel:
    def __init__(self):
        self.model = IsolationForest(
            n_estimators=100,
            contamination=0.2,
            random_state=42,
        )
        self.is_trained = False

    def train(self, training_data: list[list[float]]) -> None:
        self.model.fit(np.array(training_data))
        self.is_trained = True

    def predict(self, features: list[float]) -> dict:
        if not self.is_trained:
            raise RuntimeError("ML model has not been trained yet.")

        data = np.array(features).reshape(1, -1)

        prediction = self.model.predict(data)[0]
        anomaly_score = self.model.decision_function(data)[0]

        return {
            "prediction": "anomaly" if prediction == -1 else "normal",
            "anomaly_score": float(anomaly_score),
        }

    def save(self, path: str) -> None:
        joblib.dump(self.model, path)

    def load(self, path: str) -> None:
        self.model = joblib.load(path)
        self.is_trained = True


def anomaly_score_to_confidence(anomaly_score: float) -> float:
    """
    Convert the Isolation Forest anomaly score into
    a normalized confidence value between 0.0 and 1.0.
    """

    confidence = 0.5 - anomaly_score

    return max(0.0, min(1.0, confidence))