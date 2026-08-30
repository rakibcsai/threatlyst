from starlette.responses import JSONResponse
from starlette.types import ASGIApp, Message, Receive, Scope, Send


MAX_REQUEST_SIZE_BYTES = 2 * 1024 * 1024  # 2 MB


class RequestSizeLimitMiddleware:
    """
    Enforce a maximum HTTP request-body size.

    Content-Length is checked early when supplied, but the
    actual streamed request body is also measured so clients
    cannot bypass the limit by omitting or manipulating the
    Content-Length header.
    """

    def __init__(
        self,
        app: ASGIApp,
        max_request_size: int = MAX_REQUEST_SIZE_BYTES,
    ):
        self.app = app
        self.max_request_size = max_request_size

    async def __call__(
        self,
        scope: Scope,
        receive: Receive,
        send: Send,
    ) -> None:
        if scope["type"] != "http":
            await self.app(
                scope,
                receive,
                send,
            )
            return

        headers = dict(scope.get("headers", []))

        content_length_bytes = headers.get(
            b"content-length"
        )

        if content_length_bytes is not None:
            try:
                content_length = int(
                    content_length_bytes.decode(
                        "latin-1"
                    )
                )

            except (
                ValueError,
                UnicodeDecodeError,
            ):
                await self._send_error(
                    scope=scope,
                    receive=receive,
                    send=send,
                    status_code=400,
                    detail=(
                        "Invalid Content-Length header."
                    ),
                )
                return

            if content_length < 0:
                await self._send_error(
                    scope=scope,
                    receive=receive,
                    send=send,
                    status_code=400,
                    detail=(
                        "Invalid Content-Length header."
                    ),
                )
                return

            if (
                content_length
                > self.max_request_size
            ):
                await self._send_too_large(
                    scope,
                    receive,
                    send,
                )
                return

        body_parts: list[bytes] = []
        received_size = 0

        while True:
            message = await receive()

            if message["type"] == "http.disconnect":
                return

            if message["type"] != "http.request":
                continue

            body = message.get(
                "body",
                b"",
            )

            received_size += len(body)

            if (
                received_size
                > self.max_request_size
            ):
                await self._send_too_large(
                    scope,
                    receive,
                    send,
                )
                return

            if body:
                body_parts.append(body)

            if not message.get(
                "more_body",
                False,
            ):
                break

        request_body = b"".join(
            body_parts
        )

        body_delivered = False

        async def replay_receive() -> Message:
            nonlocal body_delivered

            if not body_delivered:
                body_delivered = True

                return {
                    "type": "http.request",
                    "body": request_body,
                    "more_body": False,
                }

            return {
                "type": "http.request",
                "body": b"",
                "more_body": False,
            }

        await self.app(
            scope,
            replay_receive,
            send,
        )

    async def _send_too_large(
        self,
        scope: Scope,
        receive: Receive,
        send: Send,
    ) -> None:
        await self._send_error(
            scope=scope,
            receive=receive,
            send=send,
            status_code=413,
            detail=(
                "Request body exceeds the "
                "maximum allowed size."
            ),
        )

    async def _send_error(
        self,
        *,
        scope: Scope,
        receive: Receive,
        send: Send,
        status_code: int,
        detail: str,
    ) -> None:
        response = JSONResponse(
            status_code=status_code,
            content={
                "detail": detail,
            },
        )

        await response(
            scope,
            receive,
            send,
        )