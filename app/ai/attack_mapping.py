ATTACK_MAPPING = {
    "failed_login": {
        "attack_category": "Credential Access",
        "mitre_techniques": ["T1110"],
        "default_actions": [
            "Investigate the source IP",
            "Review authentication logs",
            "Check the affected user account",
        ],
    },

    "brute_force": {
        "attack_category": "Credential Access",
        "mitre_techniques": ["T1110"],
        "default_actions": [
            "Investigate the source IP",
            "Review authentication logs",
            "Consider temporarily blocking the source IP",
            "Check for account compromise",
        ],
    },

    "malware_detected": {
        "attack_category": "Malware",
        "mitre_techniques": ["T1204.002"],
        "default_actions": [
            "Isolate the affected endpoint",
            "Investigate the detected malware",
            "Collect endpoint evidence",
            "Run an endpoint security scan",
        ],
    },

    "login": {
        "attack_category": "Authentication Activity",
        "mitre_techniques": [],
        "default_actions": [
            "Continue monitoring the authentication activity",
        ],
    },

    "login_success": {
        "attack_category": "Authentication Activity",
        "mitre_techniques": [],
        "default_actions": [
            "Continue monitoring the authentication activity",
        ],
    },
}


DEFAULT_ATTACK_MAPPING = {
    "attack_category": "Suspicious Activity",
    "mitre_techniques": [],
    "default_actions": [
        "Investigate the event",
        "Review related security logs",
        "Continue monitoring the affected source",
    ],
}