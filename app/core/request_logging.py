import logging
import time
import uuid

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.metrics import metrics_registry


logger = logging.getLogger("threatlyst.request")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Log incoming HTTP requests and responses.

    Each request receives a unique request ID for
    correlation across application logs.

    Request counts, status codes, errors, and latency
    are also recorded for operational monitoring.
    """

    async def dispatch(
        self,
        request: Request,
        call_next,
    ):
        request_id = str(uuid.uuid4())
        start_time = time.perf_counter()

        logger.info(
            (
                "request_started request_id=%s "
                "method=%s path=%s client=%s"
            ),
            request_id,
            request.method,
            request.url.path,
            (
                request.client.host
                if request.client
                else "unknown"
            ),
        )

        try:
            response = await call_next(request)

        except Exception:
            duration_ms = (
                time.perf_counter() - start_time
            ) * 1000

            metrics_registry.record_request(
                path=request.url.path,
                status_code=500,
                duration_ms=duration_ms,
            )

            logger.exception(
                (
                    "request_failed request_id=%s "
                    "method=%s path=%s "
                    "status=500 duration_ms=%.2f"
                ),
                request_id,
                request.method,
                request.url.path,
                duration_ms,
            )

            raise

        duration_ms = (
            time.perf_counter() - start_time
        ) * 1000

        metrics_registry.record_request(
            path=request.url.path,
            status_code=response.status_code,
            duration_ms=duration_ms,
        )

        response.headers["X-Request-ID"] = request_id

        logger.info(
            (
                "request_completed request_id=%s "
                "method=%s path=%s "
                "status=%s duration_ms=%.2f"
            ),
            request_id,
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
        )

        return response