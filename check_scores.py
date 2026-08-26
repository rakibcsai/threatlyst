from app.ai.model_manager import ml_model_manager
from app.ai.validation_data import VALIDATION_DATA


print("EXPECTED | PREDICTED | SCORE")
print("-" * 40)

for sample in VALIDATION_DATA:
    result = ml_model_manager.predict(sample["features"])

    print(
        "{} | {} | {:.6f}".format(
            sample["expected"],
            result["prediction"],
            result["anomaly_score"],
        )
    )