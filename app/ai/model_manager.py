from datetime import datetime, timezone
from pathlib import Path

from app.ai.ml_model import ThreatDetectionModel
from app.ai.training_data import TRAINING_DATA


MODEL_PATH = Path("app/ai/threat_model.joblib")

MODEL_VERSION = "1.0"
FEATURE_VERSION = 1


class MLModelManager:
    """
    Manages the ThreatLyst machine-learning model lifecycle.

    Responsibilities:
    - Load an existing trained model
    - Train a new model when no persisted model exists
    - Save model metadata with the trained artifact
    - Explicitly retrain the model when training data changes
    - Validate model compatibility
    - Expose model metadata
    """

    def __init__(self):
        self.model = ThreatDetectionModel()

        if MODEL_PATH.exists():
            self.model.load(str(MODEL_PATH))
        else:
            self.retrain()

    def predict(self, features: list[float]) -> dict:
        """
        Run prediction using the currently loaded model.
        """

        return self.model.predict(features)

    def retrain(self) -> None:
        """
        Train the model using the current training dataset
        and persist the trained model to disk.
        """

        self.model = ThreatDetectionModel()

        metadata = {
            "model_version": MODEL_VERSION,
            "feature_version": FEATURE_VERSION,
            "algorithm": "IsolationForest",
            "trained_at": datetime.now(
                timezone.utc
            ).isoformat(),
        }

        self.model.train(
            TRAINING_DATA,
            metadata=metadata,
        )

        MODEL_PATH.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        self.model.save(str(MODEL_PATH))

    def validate_model(self) -> dict:
        """
        Validate that the loaded model is compatible with
        the current ThreatLyst feature configuration.
        """

        metadata = self.model.get_metadata()

        expected_feature_count = (
            len(TRAINING_DATA[0])
            if TRAINING_DATA
            else 0
        )

        stored_feature_count = metadata.get(
            "feature_count"
        )

        stored_feature_version = metadata.get(
            "feature_version"
        )

        issues: list[str] = []

        if (
            stored_feature_count is not None
            and stored_feature_count
            != expected_feature_count
        ):
            issues.append(
                "Stored model feature count does not match "
                "the current training feature count."
            )

        if (
            stored_feature_version is not None
            and stored_feature_version
            != FEATURE_VERSION
        ):
            issues.append(
                "Stored model feature version does not match "
                "the current feature version."
            )

        return {
            "valid": len(issues) == 0,
            "issues": issues,
            "expected_feature_count": expected_feature_count,
            "stored_feature_count": stored_feature_count,
            "expected_feature_version": FEATURE_VERSION,
            "stored_feature_version": stored_feature_version,
        }

    def get_metadata(self) -> dict:
        """
        Return metadata describing the current ML model.
        """

        metadata = self.model.get_metadata()

        return {
            "model_version": metadata.get(
                "model_version",
                MODEL_VERSION,
            ),
            "feature_version": metadata.get(
                "feature_version",
                FEATURE_VERSION,
            ),
            "algorithm": metadata.get(
                "algorithm",
                "IsolationForest",
            ),
            "training_samples": metadata.get(
                "training_samples",
                len(TRAINING_DATA),
            ),
            "feature_count": metadata.get(
                "feature_count",
                (
                    len(TRAINING_DATA[0])
                    if TRAINING_DATA
                    else 0
                ),
            ),
            "trained_at": metadata.get(
                "trained_at"
            ),
            "model_path": str(MODEL_PATH),
        }


ml_model_manager = MLModelManager()