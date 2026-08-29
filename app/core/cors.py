from fastapi.middleware.cors import CORSMiddleware


def configure_cors(app) -> None:
    """
    Configure browser cross-origin access for ThreatLyst.

    During local development, only the known local frontend
    origins are allowed. Production origins can be moved to
    environment-based configuration later.
    """

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ],
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