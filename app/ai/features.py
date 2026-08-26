from app.models.security_event import SecurityEvent


def extract_features(event: SecurityEvent) -> list[float]:
    """
    Extract numerical features from a SecurityEvent for the
    ThreatLyst anomaly-detection model.

    Feature order:

    1.  critical severity
    2.  high severity
    3.  medium severity
    4.  source IP present
    5.  destination IP present
    6.  username present
    7.  hostname present
    8.  failed login event
    9.  brute-force event
    10. malware detected event
    11. authentication event
    12. network event
    13. message length
    14. raw-data field count
    15. source/destination IP combination
    """

    severity = event.severity.lower().strip()
    event_type = event.event_type.lower().strip()
    message = event.message or ""

    # ---------------------------------------------------------
    # Severity features
    # ---------------------------------------------------------

    critical = 1.0 if severity == "critical" else 0.0
    high = 1.0 if severity == "high" else 0.0
    medium = 1.0 if severity == "medium" else 0.0

    # ---------------------------------------------------------
    # Entity-presence features
    # ---------------------------------------------------------

    source_ip_present = 1.0 if event.source_ip else 0.0
    destination_ip_present = 1.0 if event.destination_ip else 0.0
    username_present = 1.0 if event.username else 0.0
    hostname_present = 1.0 if event.hostname else 0.0

    # ---------------------------------------------------------
    # Security-event type features
    # ---------------------------------------------------------

    failed_login = (
        1.0
        if event_type in {
            "failed_login",
            "login_failed",
            "authentication_failure",
        }
        else 0.0
    )

    brute_force = (
        1.0
        if event_type in {
            "brute_force",
            "bruteforce",
            "password_spray",
            "credential_attack",
        }
        else 0.0
    )

    malware_detected = (
        1.0
        if event_type in {
            "malware_detected",
            "malware",
            "malware_detection",
        }
        else 0.0
    )

    # ---------------------------------------------------------
    # Broader event categories
    # ---------------------------------------------------------

    authentication_event = (
        1.0
        if any(
            keyword in event_type
            for keyword in (
                "login",
                "authentication",
                "auth",
                "credential",
                "password",
            )
        )
        else 0.0
    )

    network_event = (
        1.0
        if any(
            keyword in event_type
            for keyword in (
                "network",
                "connection",
                "traffic",
                "firewall",
                "port",
                "dns",
                "scan",
            )
        )
        else 0.0
    )

    # ---------------------------------------------------------
    # Message characteristics
    # ---------------------------------------------------------

    # Normalize message length so extremely long messages do not
    # dominate the feature space.
    message_length = min(len(message) / 500.0, 1.0)

    # ---------------------------------------------------------
    # Raw-data characteristics
    # ---------------------------------------------------------

    raw_data_field_count = min(
        len(event.raw_data) / 20.0,
        1.0,
    )

    # ---------------------------------------------------------
    # Network relationship
    # ---------------------------------------------------------

    source_destination_pair = (
        1.0
        if event.source_ip and event.destination_ip
        else 0.0
    )

    return [
        critical,
        high,
        medium,
        source_ip_present,
        destination_ip_present,
        username_present,
        hostname_present,
        failed_login,
        brute_force,
        malware_detected,
        authentication_event,
        network_event,
        message_length,
        raw_data_field_count,
        source_destination_pair,
    ]