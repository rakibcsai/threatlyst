from app.ai.detection_rules import run_detection_rules


def test_failed_login_rule_detects_brute_force():
    event = {
        "event_type": "failed_login",
        "failed_attempts": 7,
    }

    matches = run_detection_rules(event)

    assert len(matches) == 1

    match = matches[0]

    assert match.rule_id == "TL-AUTH-001"
    assert match.rule_name == "Repeated Failed Login Attempts"
    assert match.severity == "high"
    assert match.confidence == 90
    assert match.mitre_technique_id == "T1110"


def test_malware_rule_detects_malware_execution():
    event = {
        "event_type": "malware_execution",
        "malware_detected": True,
    }

    matches = run_detection_rules(event)

    assert len(matches) == 1

    match = matches[0]

    assert match.rule_id == "TL-MAL-001"
    assert match.severity == "critical"
    assert match.confidence == 95
    assert match.mitre_technique_id == "T1204.002"


def test_powershell_rule_detects_encoded_command():
    event = {
        "command_line": (
            "powershell.exe -enc SQBFAFgA"
        ),
    }

    matches = run_detection_rules(event)

    assert len(matches) == 1

    match = matches[0]

    assert match.rule_id == "TL-EXEC-001"
    assert match.severity == "high"
    assert match.confidence == 85
    assert match.mitre_technique_id == "T1059.001"


def test_multiple_rules_can_match_single_event():
    event = {
        "event_type": "malware_execution",
        "malware_detected": True,
        "command_line": (
            "powershell.exe -enc SQBFAFgA"
        ),
    }

    matches = run_detection_rules(event)

    rule_ids = {
        match.rule_id
        for match in matches
    }

    assert "TL-MAL-001" in rule_ids
    assert "TL-EXEC-001" in rule_ids
    assert len(matches) == 2


def test_normal_event_has_no_detection_matches():
    event = {
        "event_type": "login_success",
        "failed_attempts": 0,
        "malware_detected": False,
        "command_line": "",
    }

    matches = run_detection_rules(event)

    assert matches == []