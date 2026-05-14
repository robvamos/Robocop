from src.services.ai_agent.app.safety import SafetyManager


def test_safety_requires_stop_before_first_command() -> None:
    safety = SafetyManager(command_timeout_ms=500)

    assert safety.should_stop() is True


def test_safety_allows_recent_command() -> None:
    safety = SafetyManager(command_timeout_ms=500)
    safety.mark_command()

    assert safety.should_stop() is False
