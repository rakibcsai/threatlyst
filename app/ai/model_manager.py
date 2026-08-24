from pathlib import Path

from app.ai.ml_model import ThreatDetectionModel
from app.ai.training_data import TRAINING_DATA


MODEL_PATH = Path("app/ai/threat_model.joblib")


class MLModelManager:
    def __init__(self):
        self.model = ThreatDetectionModel()

        if MODEL_PATH.exists():
            self.model.load(str(MODEL_PATH))
        else:
            self.model.train(TRAINING_DATA)
            self.model.save(str(MODEL_PATH))

    def predict(self, features: list[float]) -> dict:
        return self.model.predict(features)


ml_model_manager = MLModelManager()