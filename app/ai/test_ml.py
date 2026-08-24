from app.models.security_event import SecurityEvent
from app.ai.features import extract_features
from app.ai.ml_model import ThreatDetectionModel
from app.ai.training_data import TRAINING_DATA


model = ThreatDetectionModel()

model.train(TRAINING_DATA)


event = SecurityEvent(
    event_id="ML-TEST-001",
    source="Wazuh",
    event_type="failed_login",
    source_ip="185.10.20.30",
    username="admin",
    severity="high",
    message="Multiple failed login attempts detected",
)

features = extract_features(event)

result = model.predict(features)

print("Features:", features)
print("ML Prediction:", result)