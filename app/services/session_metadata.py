from dataclasses import dataclass


@dataclass
class SessionMetadata:
    browser: str
    operating_system: str
    device_type: str


def parse_user_agent(
    user_agent: str | None,
) -> SessionMetadata:
    """
    Parse basic browser, operating system, and device
    information from a User-Agent string.

    This intentionally avoids adding a third-party
    dependency for V1.1.
    """

    if not user_agent:
        return SessionMetadata(
            browser="Unknown",
            operating_system="Unknown",
            device_type="Unknown",
        )

    ua = user_agent.lower()

    browser = _detect_browser(ua)
    operating_system = _detect_operating_system(ua)
    device_type = _detect_device_type(ua)

    return SessionMetadata(
        browser=browser,
        operating_system=operating_system,
        device_type=device_type,
    )


def _detect_browser(
    ua: str,
) -> str:
    if "edg/" in ua or "edge/" in ua:
        return "Microsoft Edge"

    if "opr/" in ua or "opera" in ua:
        return "Opera"

    if "firefox/" in ua or "fxios/" in ua:
        return "Firefox"

    if "chrome/" in ua or "crios/" in ua:
        return "Google Chrome"

    if (
        "safari/" in ua
        and "chrome/" not in ua
        and "crios/" not in ua
        and "android" not in ua
    ):
        return "Safari"

    return "Other"


def _detect_operating_system(
    ua: str,
) -> str:
    if "windows nt 10.0" in ua:
        return "Windows"

    if "windows nt" in ua:
        return "Windows"

    if "iphone" in ua or "ipad" in ua or "ipod" in ua:
        return "iOS"

    if "android" in ua:
        return "Android"

    if "macintosh" in ua or "mac os x" in ua:
        return "macOS"

    if "linux" in ua:
        return "Linux"

    if "cros" in ua:
        return "ChromeOS"

    return "Other"


def _detect_device_type(
    ua: str,
) -> str:
    if "ipad" in ua:
        return "Tablet"

    if "tablet" in ua:
        return "Tablet"

    if "android" in ua and "mobile" not in ua:
        return "Tablet"

    if (
        "iphone" in ua
        or "ipod" in ua
        or "mobile" in ua
        or "android" in ua
    ):
        return "Mobile"

    return "Desktop"