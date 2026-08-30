from fastapi import APIRouter
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.core.database import SessionLocal


router = APIRouter()


@router.get("/health")
def health_check():
    """
    Check ThreatLyst API and database readiness.

    Returns HTTP 200 when the application and database
    are healthy. Returns HTTP 503 when the database
    cannot be reached.
    """

    database_status = "healthy"

    db = SessionLocal()

    try:
        db.execute(
            text("SELECT 1")
        )

    except Exception:
        database_status = "unhealthy"

        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "service": "ThreatLyst API",
                "database": database_status,
            },
        )

    finally:
        db.close()

    return {
        "status": "healthy",
        "service": "ThreatLyst API",
        "database": database_status,
    }