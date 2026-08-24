from app.ai.ml_model import ThreatDetectionModel
from app.ai.training_data import TRAINING_DATA


model = ThreatDetectionModel()

model.train(TRAINING_DATA)

print("ML model trained successfully.")
print(f"Training samples: {len(TRAINING_DATA)}")