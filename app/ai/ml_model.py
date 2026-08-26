import numpy as np
import joblib
from sklearn.ensemble import IsolationForest
from typing import List


class ThreatDetectionModel:
    """
    Isolation Forest based anomaly detection model.

    The model is trained primarily on NORMAL operational
    security events. Events that significantly differ from
    the learned normal baseline are classified as anomalies.
    """

    def __init__(self):
        self.model = IsolationForest(
            n_estimators=200,
            contamination="auto",
            random_state=42,
        )

        self.is_trained = False

    # ==========================================================
    # TRAIN
    # ==========================================================

    def train(self, training_data: List[List[float]]) -> None:
        """
        Train the Isolation Forest model using normal
        operational security-event feature vectors.
        """

        data = np.array(
            training_data,
            dtype=float,
        )

        if data.ndim != 2:
            raise ValueError(
                "Training data must be a 2-dimensional array."
            )

        if len(data) == 0:
            raise ValueError(
                "Training data cannot be empty."
            )

        self.model.fit(data)

        self.is_trained = True

    # ==========================================================
    # PREDICT
    # ==========================================================

    def predict(self, features: List[float]) -> dict:
        """
        Predict whether a security-event feature vector
        represents normal or anomalous activity.
        """

        if not self.is_trained:
            raise RuntimeError(
                "ML model has not been trained yet."
            )

        data = np.array(
            features,
            dtype=float,
        ).reshape(1, -1)

        prediction = self.model.predict(data)[0]

        anomaly_score = self.model.decision_function(data)[0]

        return {
            "prediction": (
                "anomaly"
                if prediction == -1
                else "normal"
            ),
            "anomaly_score": float(anomaly_score),
        }

    # ==========================================================
    # SAVE
    # ==========================================================

    def save(self, path: str) -> None:
        """
        Save the trained Isolation Forest model.
        """

        if not self.is_trained:
            raise RuntimeError(
                "Cannot save an untrained model."
            )

        joblib.dump(
            self.model,
            path,
        )

    # ==========================================================
    # LOAD
    # ==========================================================

    def load(self, path: str) -> None:
        """
        Load a previously trained Isolation Forest model.
        """

        self.model = joblib.load(path)

        self.is_trained = True


# ==============================================================
# ANOMALY SCORE → CONFIDENCE
# ==============================================================

def anomaly_score_to_confidence(
    anomaly_score: float,
) -> float:
    """
    Convert the Isolation Forest anomaly score into
    a normalized confidence value between 0.0 and 1.0.

    More negative anomaly scores indicate stronger
    evidence of anomalous behaviour.

    More positive scores indicate stronger evidence
    of normal behaviour.
    """

    confidence = 0.5 - anomaly_score

    return max(
        0.0,
        min(
            1.0,
            confidence,
        ),
    )