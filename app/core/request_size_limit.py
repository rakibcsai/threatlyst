from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response


MAX_REQUEST_SIZE_BYTES = 2 * 1024 * 1024  # 2 MB


class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    """
    Reject excessively large request bodies before they
    reach ThreatLyst API endpoints.

    This reduces exposure to oversized payload abuse and
    unnecessary memory consumption.
    """

    async def dispatch(
        self,
        request: Request,
        call_next,
    ) -> Response:

        content_length = request.headers.get(
            "content-length"
        )

        if content_length is not None:
            try:
                request_size = int(content_length)

                if request_size > MAX_REQUEST_SIZE_BYTES:
                    return JSONResponse(
                        status_code=413,
                        content={
                            "detail": (
                                "Request body exceeds the "
                                "maximum allowed size."
                            )
                        },
                    )

            except ValueError:
                return JSONResponse(
                    status_code=400,
                    content={
                        "detail": "Invalid Content-Length header."
                    },
                )

        return await call_next(request)