from fastapi import APIRouter, Depends

from app.core.auth_dependencies import get_current_user
from app.core.metrics import metrics_registry
from app.db.user import UserDB


router = APIRouter(
    prefix="/api/metrics",
    tags=["Metrics"],
)


@router.get("")
def get_metrics(
    current_user: UserDB = Depends(
        get_current_user
    ),
):
    """
    Return current in-memory operational metrics.

    Authentication is required because these metrics
    expose internal application activity.
    """

    return metrics_registry.snapshot()