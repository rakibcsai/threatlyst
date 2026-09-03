# ThreatLyst Isolation Forest training data.
#
# IMPORTANT:
# This dataset represents NORMAL operational activity.
#
# Suspicious patterns such as failed login, brute force,
# and malware detection are intentionally excluded from
# the training baseline.
#
# Feature order must exactly match app/ai/features.py:
#
# 1.  critical severity
# 2.  high severity
# 3.  medium severity
# 4.  source IP present
# 5.  destination IP present
# 6.  username present
# 7.  hostname present
# 8.  failed login
# 9.  brute force
# 10. malware detected
# 11. authentication event
# 12. network event
# 13. message length
# 14. raw-data field count
# 15. source/destination IP combination


TRAINING_DATA = [

    # ---------------------------------------------------------
    # Normal medium-severity events
    # ---------------------------------------------------------

    [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.05, 0.00, 0],

    [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0.08, 0.05, 0],

    [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0.10, 0.05, 0],

    [0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0.12, 0.10, 0],

    [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0.10, 0.10, 1],

    [0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0.15, 0.15, 1],

    [0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0.07, 0.05, 0],

    [0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0.09, 0.10, 0],

    # ---------------------------------------------------------
    # Normal high-severity operational events
    #
    # High severity by itself is not automatically anomalous.
    # ---------------------------------------------------------

    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.06, 0.00, 0],

    [0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0.10, 0.05, 0],

    [0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0.12, 0.05, 0],

    [0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0.15, 0.10, 1],

    [0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0.13, 0.10, 0],

    [0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0.16, 0.15, 1],

    # ---------------------------------------------------------
    # Normal low/unspecified severity operational events
    # ---------------------------------------------------------

    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.03, 0.00, 0],

    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0.07, 0.05, 0],

    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0.09, 0.05, 0],

    [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0.11, 0.10, 1],

    [0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0.08, 0.05, 0],

    # ---------------------------------------------------------
    # Normal authentication activity
    #
    # Authentication itself is normal.
    # Failed-login/brute-force indicators remain zero.
    # ---------------------------------------------------------

    [0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0.08, 0.10, 0],

    [0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0.11, 0.05, 0],

    [0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0.14, 0.10, 0],

    [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0.07, 0.00, 0],

    [0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0.12, 0.15, 1],

    # ---------------------------------------------------------
    # Normal network activity
    # ---------------------------------------------------------

    [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0.10, 0.10, 1],

    [0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0.13, 0.15, 1],

    [0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0.16, 0.10, 1],

    [0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0.09, 0.05, 0],

    [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0.06, 0.05, 0],

    # ---------------------------------------------------------
    # Additional normal baseline observations
    # ---------------------------------------------------------

    [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.04, 0.00, 0],

    [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0.09, 0.05, 0],

    [0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0.11, 0.10, 0],

    [0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0.12, 0.05, 0],

    [0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0.14, 0.10, 1],

    [0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0.15, 0.15, 1],

    [0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0.10, 0.10, 0],

    [0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0.13, 0.15, 1],

    # ---------------------------------------------------------
    # Realistic login_success baseline observations
    #
    # These represent the actual feature patterns generated
    # by normal successful-login API events.
    #
    # A normal login_success event commonly contains:
    # - medium severity
    # - source IP
    # - destination IP
    # - username
    # - hostname
    # - authentication indicator
    # - short login message
    # - two raw-data fields
    # - source/destination IP pair
    #
    # Failed-login, brute-force and malware indicators remain 0.
    # ---------------------------------------------------------

    [0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0.04, 0.10, 1],

    [0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0.05, 0.10, 1],

    [0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0.06, 0.10, 1],

    [0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0.04, 0.05, 1],

    [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0.05, 0.10, 0],

    [0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0.07, 0.15, 1],

    # ---------------------------------------------------------
    # Realistic production-style benign operational events
    #
    # These samples reflect the richer messages and raw_data
    # payloads that are generated by actual ThreatLyst API
    # submissions in the production demo environment.
    # ---------------------------------------------------------

    # Endpoint heartbeat
    [0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0.218, 0.20, 1],

    [0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0.18, 0.20, 1],

    [0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0.20, 0.15, 1],

    # DNS query
    [0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0.20, 0.25, 1],

    [0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0.18, 0.20, 1],

    # Software update
    [0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0.22, 0.25, 1],

    [0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0.24, 0.20, 1],

    # Normal file access
    [0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0.20, 0.25, 1],

    [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0.18, 0.20, 1],

    # Allowed firewall/network connection
    [0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0.21, 0.25, 1],

    [0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0.19, 0.20, 1],
]