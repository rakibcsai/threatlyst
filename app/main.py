from fastapi import FastAPI

from app.api.alerts import router as alerts_router
from app.api.api_keys import router as api_keys_router
from app.api.audit_logs import router as audit_logs_router
from app.api.auth import router as auth_router
from app.api.events import router as events_router
from app.api.health import router as health_router
from app.api.incidents import router as incidents_router
from app.api.ingest import router as ingest_router
from app.api.liveness import router as liveness_router
from app.api.metrics import router as metrics_router
from app.api.mitre_intelligence import router as mitre_intelligence_router
from app.api.notifications import router as notifications_router
from app.api.reports import router as reports_router
from app.api.threat_intelligence import (
    router as threat_intelligence_router,
)

from app.core.cors import configure_cors
from app.core.logging_config import configure_logging
from app.core.request_logging import RequestLoggingMiddleware
from app.core.request_size_limit import RequestSizeLimitMiddleware
from app.core.security_config import validate_security_configuration
from app.core.security_headers import SecurityHeadersMiddleware
from app.core.trusted_hosts import configure_trusted_hosts


validate_security_configuration()
configure_logging()


app = FastAPI(
    title="ThreatLyst API",
    description=(
        "ThreatLyst is an AI-powered Security Operations "
        "and Threat Investigation Platform.\n\n"
        "The API provides capabilities for security-event "
        "ingestion, automated analysis, alert management, "
        "incident management, threat intelligence, MITRE "
        "ATT&CK intelligence, notifications, reporting, "
        "audit logging, and operational monitoring.\n\n"
        "Authentication methods:\n"
        "- Bearer JWT for authenticated ThreatLyst users.\n"
        "- X-API-Key for external security-event ingestion.\n\n"
        "Role-based access control is enforced for protected "
        "operations."
    ),
    version="0.1.0",
    contact={
        "name": "ThreatLyst",
    },
    license_info={
        "name": "Proprietary",
    },
    openapi_tags=[
        {
            "name": "Authentication",
            "description": (
                "User authentication, account creation, "
                "and current-user profile operations."
            ),
        },
        {
            "name": "API Keys",
            "description": (
                "Administrative management of integration "
                "API keys."
            ),
        },
        {
            "name": "Events",
            "description": (
                "Security-event submission, analysis, "
                "and retrieval."
            ),
        },
        {
            "name": "Ingestion",
            "description": (
                "External security-event ingestion using "
                "X-API-Key authentication."
            ),
        },
        {
            "name": "Alerts",
            "description": (
                "SOC alert creation, assignment, "
                "status management, and investigation."
            ),
        },
        {
            "name": "Incidents",
            "description": (
                "Security incident management and tracking."
            ),
        },
        {
            "name": "Threat Intelligence",
            "description": (
                "Threat-indicator storage and intelligence "
                "management."
            ),
        },
        {
            "name": "MITRE Intelligence",
            "description": (
                "MITRE ATT&CK technique intelligence."
            ),
        },
        {
            "name": "Audit Logs",
            "description": (
                "Administrative security audit-log access."
            ),
        },
        {
            "name": "Notifications",
            "description": (
                "User and global security notifications."
            ),
        },
        {
            "name": "Reports",
            "description": (
                "Security reporting and SOC summary data."
            ),
        },
        {
            "name": "Metrics",
            "description": (
                "Authenticated operational application "
                "metrics."
            ),
        },
        {
            "name": "Health",
            "description": (
                "Application liveness and database "
                "readiness monitoring."
            ),
        },
    ],
)


configure_trusted_hosts(app)
configure_cors(app)

app.add_middleware(RequestSizeLimitMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestLoggingMiddleware)


app.include_router(auth_router)
app.include_router(api_keys_router)
app.include_router(events_router)
app.include_router(ingest_router)
app.include_router(alerts_router)
app.include_router(incidents_router)
app.include_router(threat_intelligence_router)
app.include_router(mitre_intelligence_router)
app.include_router(audit_logs_router)
app.include_router(notifications_router)
app.include_router(reports_router)
app.include_router(metrics_router)
app.include_router(liveness_router)
app.include_router(health_router)


@app.get(
    "/",
    tags=["Health"],
    summary="ThreatLyst API root",
    description=(
        "Return basic ThreatLyst API identification "
        "and availability information."
    ),
)
def root():
    return {
        "name": "ThreatLyst",
        "status": "online",
        "version": "0.1.0",
    }