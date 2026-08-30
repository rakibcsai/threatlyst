from fastapi import APIRouter


router = APIRouter()


@router.get("/live")
def liveness_check():
    """
    Lightweight liveness probe.

    This endpoint confirms that the ThreatLyst API process
    is running. It intentionally does not check external
    dependencies such as the database.
    """

    return {
        "status": "alive",
        "service": "ThreatLyst API",
    }