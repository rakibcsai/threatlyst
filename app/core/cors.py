from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings


def configure_cors(app) -> None:
    """
    Configure browser cross-origin access for ThreatLyst.

    Origins are configured explicitly through the application
    environment. Wildcard browser origins are not used.
    """

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=[
            "GET",
            "POST",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],
        allow_headers=[
            "Authorization",
            "Content-Type",
            "X-API-Key",
        ],
    )
