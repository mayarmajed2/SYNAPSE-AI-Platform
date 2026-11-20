"""Pure ASGI security headers and sliding-window in-memory rate limiting middleware."""
import time
from collections import defaultdict, deque
from typing import Deque, Dict

from starlette.responses import JSONResponse
from starlette.types import ASGIApp, Message, Receive, Scope, Send

from app.core.config import settings


class SecurityAndRateLimitMiddleware:
    """Pure ASGI middleware adding security headers and per-IP sliding-window rate limiting."""

    def __init__(self, app: ASGIApp, max_requests_per_minute: int = None):
        self.app = app
        self.max_rpm = max_requests_per_minute or settings.RATE_LIMIT_PER_MINUTE
        self._hits: Dict[str, Deque[float]] = defaultdict(deque)

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        method = scope.get("method", "GET")
        path = scope.get("path", "")

        if method != "OPTIONS" and path not in ("/health", "/api/v1/health", "/"):
            client = scope.get("client")
            client_ip = client[0] if client else "unknown"
            now = time.monotonic()
            window = self._hits[client_ip]
            cutoff = now - 60.0
            while window and window[0] < cutoff:
                window.popleft()
            if len(window) >= self.max_rpm:
                response = JSONResponse(
                    status_code=429,
                    content={"detail": "Rate limit exceeded. Please retry shortly."},
                    headers={"Retry-After": "60"},
                )
                await response(scope, receive, send)
                return
            window.append(now)

        async def send_with_headers(message: Message) -> None:
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))
                existing = {k.lower() for k, _ in headers}
                if b"x-content-type-options" not in existing:
                    headers.append((b"x-content-type-options", b"nosniff"))
                if b"x-frame-options" not in existing:
                    headers.append((b"x-frame-options", b"DENY"))
                if b"referrer-policy" not in existing:
                    headers.append((b"referrer-policy", b"strict-origin-when-cross-origin"))
                message = {**message, "headers": headers}
            await send(message)

        await self.app(scope, receive, send_with_headers)
