from datetime import datetime, timezone

from app.db.user import UserDB
from app.services.dashboard_service import get_dashboard_stats


def generate_security_report(
    user: UserDB,
) -> dict:
    """
    Generate a security report summary from persisted
    ThreatLyst dashboard analytics.
    """

    dashboard = get_dashboard_stats()

    return {
        "report": {
            "report_title": "ThreatLyst Security Report",
            "generated_at": datetime.now(timezone.utc),
            "generated_by_user_id": user.id,
            "generated_by_username": user.username,
            "dashboard": dashboard,
        }
    }