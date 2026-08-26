from app.ai.model_manager import ml_model_manager
from app.ai.validation_data import VALIDATION_DATA


def validate_model() -> dict:
    """
    Evaluate the current ThreatLyst ML model against
    the predefined validation dataset.

    Returns prototype anomaly-detection metrics including
    confusion-matrix values.
    """

    total = len(VALIDATION_DATA)

    correct = 0

    normal_total = 0
    normal_correct = 0

    anomaly_total = 0
    anomaly_correct = 0

    # Confusion matrix
    true_negative = 0
    false_positive = 0
    false_negative = 0
    true_positive = 0

    for sample in VALIDATION_DATA:

        features = sample["features"]
        expected = sample["expected"]

        result = ml_model_manager.predict(features)

        predicted = result["prediction"]

        # -----------------------------------------------------
        # Overall performance
        # -----------------------------------------------------

        if predicted == expected:
            correct += 1

        # -----------------------------------------------------
        # Confusion matrix
        # -----------------------------------------------------

        if expected == "normal" and predicted == "normal":
            true_negative += 1

        elif expected == "normal" and predicted == "anomaly":
            false_positive += 1

        elif expected == "anomaly" and predicted == "normal":
            false_negative += 1

        elif expected == "anomaly" and predicted == "anomaly":
            true_positive += 1

        # -----------------------------------------------------
        # Normal-event performance
        # -----------------------------------------------------

        if expected == "normal":

            normal_total += 1

            if predicted == "normal":
                normal_correct += 1

        # -----------------------------------------------------
        # Anomaly-event performance
        # -----------------------------------------------------

        elif expected == "anomaly":

            anomaly_total += 1

            if predicted == "anomaly":
                anomaly_correct += 1

    # ---------------------------------------------------------
    # Basic metrics
    # ---------------------------------------------------------

    accuracy = (
        correct / total
        if total > 0
        else 0.0
    )

    normal_detection_rate = (
        normal_correct / normal_total
        if normal_total > 0
        else 0.0
    )

    anomaly_detection_rate = (
        anomaly_correct / anomaly_total
        if anomaly_total > 0
        else 0.0
    )

    false_positive_rate = (
        1.0 - normal_detection_rate
    )

    # ---------------------------------------------------------
    # Precision
    # ---------------------------------------------------------

    precision_denominator = (
        true_positive + false_positive
    )

    precision = (
        true_positive / precision_denominator
        if precision_denominator > 0
        else 0.0
    )

    # ---------------------------------------------------------
    # Recall
    # ---------------------------------------------------------

    recall_denominator = (
        true_positive + false_negative
    )

    recall = (
        true_positive / recall_denominator
        if recall_denominator > 0
        else 0.0
    )

    # ---------------------------------------------------------
    # F1 score
    # ---------------------------------------------------------

    f1_denominator = precision + recall

    f1_score = (
        2 * precision * recall / f1_denominator
        if f1_denominator > 0
        else 0.0
    )

    return {
        "total_samples": total,
        "correct_predictions": correct,
        "accuracy": accuracy,

        "normal_samples": normal_total,
        "normal_correct": normal_correct,
        "normal_detection_rate": normal_detection_rate,

        "anomaly_samples": anomaly_total,
        "anomaly_correct": anomaly_correct,
        "anomaly_detection_rate": anomaly_detection_rate,

        "false_positive_rate": false_positive_rate,

        "true_negative": true_negative,
        "false_positive": false_positive,
        "false_negative": false_negative,
        "true_positive": true_positive,

        "precision": precision,
        "recall": recall,
        "f1_score": f1_score,
    }