from fastapi import FastAPI

from app.api.alerts import router as alerts_router
from app.api.api_keys import router as api_keys_router
from app.api.audit_logs import router as audit_logs_router
from app.api.auth import router as auth_router
from app.api.events import router as events_router
from app.api.health import router as health_router
from app.api.incidents import router as incidents_router
from app.api.ingest import router as ingest_router
from app.api.mitre_intelligence import router as mitre_intelligence_router
from app.api.notifications import router as notifications_router
from app.api.threat_intelligence import router as threat_intelligence_router


app = FastAPI(
    title="ThreatLyst",
    description=(
        "AI-Powered Security Operations and "
        "Threat Investigation Platform"
    ),
    version="0.1.0",
)


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
app.include_router(health_router)


@app.get("/")
def root():
    return {
        "name": "ThreatLyst",
        "status": "online",
        "version": "0.1.0",
    }