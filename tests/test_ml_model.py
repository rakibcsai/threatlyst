import pytest

from app.ai.ml_model import ThreatDetectionModel


def test_model_rejects_prediction_before_training():
    model = ThreatDetectionModel()

    with pytest.raises(
        RuntimeError,
        match="ML model has not been trained yet.",
    ):
        model.predict([0.0, 0.0])


def test_model_rejects_empty_training_data():
    model = ThreatDetectionModel()

    with pytest.raises(
        ValueError,
        match="Training data cannot be empty.",
    ):
        model.train([])


def test_model_rejects_wrong_feature_count():
    model = ThreatDetectionModel()

    training_data = [
        [0.0, 0.0, 0.0],
        [0.1, 0.0, 0.0],
        [0.0, 0.1, 0.0],
        [0.0, 0.0, 0.1],
    ]

    model.train(
        training_data,
        metadata={
            "feature_version": 1,
        },
    )

    with pytest.raises(
        ValueError,
        match=(
            "Feature count mismatch. "
            "Expected 3, received 2."
        ),
    ):
        model.predict([0.0, 0.0])


def test_model_returns_prediction_after_training():
    model = ThreatDetectionModel()

    training_data = [
        [0.0, 0.0, 0.0],
        [0.1, 0.0, 0.0],
        [0.0, 0.1, 0.0],
        [0.0, 0.0, 0.1],
    ]

    model.train(
        training_data,
        metadata={
            "model_version": "test",
            "feature_version": 1,
        },
    )

    result = model.predict(
        [0.0, 0.0, 0.0]
    )

    assert result["prediction"] in {
        "normal",
        "anomaly",
    }

    assert isinstance(
        result["anomaly_score"],
        float,
    )


def test_training_metadata_is_stored():
    model = ThreatDetectionModel()

    training_data = [
        [0.0, 0.0],
        [0.1, 0.0],
        [0.0, 0.1],
    ]

    model.train(
        training_data,
        metadata={
            "model_version": "test-1.0",
            "feature_version": 99,
        },
    )

    metadata = model.get_metadata()

    assert metadata["training_samples"] == 3
    assert metadata["feature_count"] == 2
    assert metadata["model_version"] == "test-1.0"
    assert metadata["feature_version"] == 99