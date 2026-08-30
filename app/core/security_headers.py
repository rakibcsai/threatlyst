from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Add baseline HTTP security headers to ThreatLyst API
    responses.

    These headers reduce exposure to common browser-based
    attacks, information leakage, framing attacks, and
    insecure transport downgrade behavior.
    """

    async def dispatch(
        self,
        request: Request,
        call_next,
    ) -> Response:
        response = await call_next(request)

        response.headers["X-Content-Type-Options"] = (
            "nosniff"
        )

        response.headers["X-Frame-Options"] = (
            "DENY"
        )

        response.headers["Referrer-Policy"] = (
            "no-referrer"
        )

        response.headers["Permissions-Policy"] = (
            "camera=(), microphone=(), geolocation=()"
        )

        response.headers["Cross-Origin-Opener-Policy"] = (
            "same-origin"
        )

        response.headers["Cross-Origin-Resource-Policy"] = (
            "same-origin"
        )

        response.headers[
            "X-Permitted-Cross-Domain-Policies"
        ] = "none"

        response.headers["Cache-Control"] = (
            "no-store"
        )

        # HSTS must only be sent when the request is
        # actually being served over HTTPS.
        if request.url.scheme == "https":
            response.headers[
                "Strict-Transport-Security"
            ] = (
                "max-age=31536000; "
                "includeSubDomains"
            )

        return response