import time


class SafetyManager:
    def __init__(self, command_timeout_ms: int) -> None:
        self.command_timeout_ms = command_timeout_ms
        self._last_command_at = 0.0

    def mark_command(self) -> None:
        self._last_command_at = time.monotonic()

    def should_stop(self) -> bool:
        if self._last_command_at == 0:
            return True
        elapsed_ms = (time.monotonic() - self._last_command_at) * 1000
        return elapsed_ms > self.command_timeout_ms
