# ThreatLyst ML validation dataset.
#
# These samples are NOT used for training.
# They are used only to evaluate whether the trained
# Isolation Forest can distinguish normal activity
# from suspicious activity.
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


VALIDATION_DATA = [

    # =========================================================
    # NORMAL EVENTS
    # =========================================================

    {
        "features": [
            0, 0, 1, 0, 0, 0, 0,
            0, 0, 0,
            0, 0,
            0.05, 0.00, 0,
        ],
        "expected": "normal",
    },

    {
        "features": [
            0, 0, 1, 1, 0, 0, 0,
            0, 0, 0,
            0, 0,
            0.08, 0.05, 0,
        ],
        "expected": "normal",
    },

    {
        "features": [
            0, 0, 1, 1, 0, 1, 1,
            0, 0, 0,
            1, 0,
            0.12, 0.10, 0,
        ],
        "expected": "normal",
    },

    {
        "features": [
            0, 1, 0, 1, 1, 0, 1,
            0, 0, 0,
            0, 1,
            0.15, 0.10, 1,
        ],
        "expected": "normal",
    },

    # =========================================================
    # SUSPICIOUS: FAILED LOGIN
    # =========================================================

    {
        "features": [
            0, 1, 0, 1, 0, 1, 1,
            1, 0, 0,
            1, 0,
            0.20, 0.10, 0,
        ],
        "expected": "anomaly",
    },

    {
        "features": [
            1, 0, 0, 1, 0, 1, 1,
            1, 0, 0,
            1, 1,
            0.25, 0.15, 0,
        ],
        "expected": "anomaly",
    },

    # =========================================================
    # SUSPICIOUS: BRUTE FORCE
    # =========================================================

    {
        "features": [
            0, 1, 0, 1, 1, 1, 1,
            0, 1, 0,
            1, 1,
            0.30, 0.15, 1,
        ],
        "expected": "anomaly",
    },

    {
        "features": [
            1, 0, 0, 1, 1, 1, 1,
            0, 1, 0,
            1, 1,
            0.35, 0.20, 1,
        ],
        "expected": "anomaly",
    },

    # =========================================================
    # SUSPICIOUS: MALWARE
    # =========================================================

    {
        "features": [
            1, 0, 0, 1, 0, 0, 1,
            0, 0, 1,
            0, 1,
            0.40, 0.20, 0,
        ],
        "expected": "anomaly",
    },

    {
        "features": [
            1, 0, 0, 1, 1, 1, 1,
            0, 0, 1,
            0, 1,
            0.45, 0.25, 1,
        ],
        "expected": "anomaly",
    },

    # =========================================================
    # MIXED SUSPICIOUS ACTIVITY
    # =========================================================

    {
        "features": [
            1, 0, 0, 1, 1, 1, 1,
            1, 1, 1,
            1, 1,
            0.50, 0.30, 1,
        ],
        "expected": "anomaly",
    },
]