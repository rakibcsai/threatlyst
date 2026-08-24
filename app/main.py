from fastapi import FastAPI

from app.api.health import router as health_router

app = FastAPI(
    title="ThreatLyst",
    description="AI-Powered Security Operations and Threat Investigation Platform",
    version="0.1.0",
)

app.include_router(health_router)


@app.get("/")
def root():
    return {
        "name": "ThreatLyst",
        "status": "online",
        "version": "0.1.0",
    }