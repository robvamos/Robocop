from __future__ import annotations

import time

from .motors import MotorController


COMMAND_TIMEOUT_MS = 500


class LocalWatchdog:
    def __init__(self, motors: MotorController) -> None:
        self._motors = motors
        self._last_command_at_ms = 0
        self._timed_out = True

    def mark_command(self) -> None:
        self._last_command_at_ms = self._now_ms()
        self._timed_out = False

    def enforce(self) -> bool:
        if self._last_command_at_ms == 0:
            self._timed_out = True
            return True

        if self._now_ms() - self._last_command_at_ms > COMMAND_TIMEOUT_MS:
            self._motors.stop()
            self._last_command_at_ms = 0
            self._timed_out = True
            return True

        self._timed_out = False
        return False

    def timed_out(self) -> bool:
        return self._timed_out

    def _now_ms(self) -> int:
        return int(time.monotonic() * 1000)
