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
    - Save the trained model
    - Explicitly retrain the model when training data changes
    - Expose basic model metadata
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

        self.model.train(TRAINING_DATA)

        MODEL_PATH.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        self.model.save(str(MODEL_PATH))

    def get_metadata(self) -> dict:
        """
        Return metadata describing the current ML model.
        """

        return {
            "model_version": MODEL_VERSION,
            "feature_version": FEATURE_VERSION,
            "algorithm": "IsolationForest",
            "training_samples": len(TRAINING_DATA),
            "feature_count": len(TRAINING_DATA[0])
            if TRAINING_DATA
            else 0,
            "model_path": str(MODEL_PATH),
        }


ml_model_manager = MLModelManager()