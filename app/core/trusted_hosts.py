from starlette.middleware.trustedhost import TrustedHostMiddleware


def configure_trusted_hosts(app) -> None:
    """
    Restrict accepted Host headers.

    Local development hosts are allowed explicitly.
    Production domains can be added later through
    environment-based configuration.
    """

    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=[
            "127.0.0.1",
            "localhost",
            "testserver",
        ],
    )