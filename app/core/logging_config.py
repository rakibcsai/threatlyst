import logging
import sys


LOG_FORMAT = (
    "%(asctime)s | "
    "%(levelname)s | "
    "%(name)s | "
    "%(message)s"
)


def configure_logging() -> None:
    """
    Configure application-wide structured console logging.

    This keeps ThreatLyst logs consistent across API,
    services, background operations, and production runtime.
    """

    root_logger = logging.getLogger()

    if root_logger.handlers:
        return

    handler = logging.StreamHandler(sys.stdout)

    formatter = logging.Formatter(
        fmt=LOG_FORMAT,
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    handler.setFormatter(formatter)

    root_logger.setLevel(logging.INFO)
    root_logger.addHandler(handler)

    logging.getLogger("uvicorn.access").setLevel(
        logging.INFO
    )

    logging.getLogger("uvicorn.error").setLevel(
        logging.INFO
    )

    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.WARNING
    )