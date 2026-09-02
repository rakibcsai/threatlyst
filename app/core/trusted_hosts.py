from starlette.middleware.trustedhost import TrustedHostMiddleware

from app.core.config import settings


def configure_trusted_hosts(app) -> None:
    """
    Restrict accepted Host headers.

    Hosts are configured explicitly through the application
    environment while local development defaults remain safe.
    """

    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.trusted_host_list,
    )
