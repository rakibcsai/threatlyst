from app.main import app


def test_openapi_metadata_is_present():
    schema = app.openapi()

    assert schema["info"]["title"] == "ThreatLyst API"
    assert schema["info"]["version"] == "0.1.0"

    description = schema["info"]["description"]

    assert "Bearer JWT" in description
    assert "X-API-Key" in description
    assert "Role-based access control" in description


def test_required_openapi_tags_are_documented():
    schema = app.openapi()

    documented_tags = {
        tag["name"]
        for tag in schema.get("tags", [])
    }

    required_tags = {
        "Authentication",
        "API Keys",
        "Events",
        "Ingestion",
        "Alerts",
        "Incidents",
        "Threat Intelligence",
        "MITRE Intelligence",
        "Audit Logs",
        "Notifications",
        "Reports",
        "Metrics",
        "Health",
    }

    assert required_tags.issubset(
        documented_tags
    )


def test_core_api_paths_are_in_openapi_schema():
    schema = app.openapi()

    paths = schema["paths"]

    expected_paths = {
        "/",
        "/health",
        "/live",
        "/api/auth/login",
        "/api/auth/me",
        "/api/api-keys",
        "/api/events",
        "/api/metrics",
        "/api/reports/security-summary",
    }

    for path in expected_paths:
        assert path in paths