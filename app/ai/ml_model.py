import joblib
import numpy as np
from sklearn.ensemble import IsolationForest
from typing import List


class ThreatDetectionModel:
    """
    Isolation Forest based anomaly detection model.

    The model is trained primarily on NORMAL operational
    security events. Events that significantly differ from
    the learned normal baseline are classified as anomalies.

    The persisted model artifact contains both the trained
    estimator and lifecycle metadata so compatibility can
    be validated when the model is loaded.
    """

    def __init__(self):
        self.model = IsolationForest(
            n_estimators=200,
            contamination="auto",
            random_state=42,
        )

        self.is_trained = False
        self.metadata: dict = {}

    # ==========================================================
    # TRAIN
    # ==========================================================

    def train(
        self,
        training_data: List[List[float]],
        metadata: dict | None = None,
    ) -> None:
        """
        Train the Isolation Forest model using normal
        operational security-event feature vectors.
        """

        if len(training_data) == 0:
            raise ValueError(
                "Training data cannot be empty."
            )

        data = np.array(
            training_data,
            dtype=float,
        )

        if data.ndim != 2:
            raise ValueError(
                "Training data must be a 2-dimensional array."
            )

        self.model.fit(data)

        self.is_trained = True

        self.metadata = {
            "training_samples": int(data.shape[0]),
            "feature_count": int(data.shape[1]),
        }

        if metadata:
            self.metadata.update(metadata)

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

        expected_feature_count = self.metadata.get(
            "feature_count"
        )

        if (
            expected_feature_count is not None
            and len(features) != expected_feature_count
        ):
            raise ValueError(
                "Feature count mismatch. "
                f"Expected {expected_feature_count}, "
                f"received {len(features)}."
            )

        data = np.array(
            features,
            dtype=float,
        ).reshape(1, -1)

        prediction = self.model.predict(data)[0]

        anomaly_score = self.model.decision_function(
            data
        )[0]

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
        Save the trained model together with metadata.
        """

        if not self.is_trained:
            raise RuntimeError(
                "Cannot save an untrained model."
            )

        artifact = {
            "model": self.model,
            "metadata": self.metadata,
        }

        joblib.dump(
            artifact,
            path,
        )

    # ==========================================================
    # LOAD
    # ==========================================================

    def load(self, path: str) -> None:
        """
        Load a persisted ThreatLyst model artifact.

        Legacy model files containing only the sklearn
        estimator are also supported for compatibility.
        """

        artifact = joblib.load(path)

        if (
            isinstance(artifact, dict)
            and "model" in artifact
        ):
            self.model = artifact["model"]
            self.metadata = artifact.get(
                "metadata",
                {},
            )

        else:
            self.model = artifact
            self.metadata = {}

        self.is_trained = True

    # ==========================================================
    # METADATA
    # ==========================================================

    def get_metadata(self) -> dict:
        """
        Return metadata stored with the model artifact.
        """

        return dict(self.metadata)


# ==============================================================
# ANOMALY SCORE → CONFIDENCE
# ==============================================================

def anomaly_score_to_confidence(
    anomaly_score: float,
) -> float:
    """
    Convert the Isolation Forest anomaly score into
    a normalized confidence value between 0.0 and 1.0.
    """

    confidence = 0.5 - anomaly_score

    return max(
        0.0,
        min(
            1.0,
            confidence,
        ),
    )