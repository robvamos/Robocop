import time

from .motors import MotorController


class LocalWatchdog:
    def __init__(self, motors: MotorController, timeout_ms: int = 500) -> None:
        self.motors = motors
        self.timeout_ms = timeout_ms
        self.last_command_at = 0.0

    def mark_command(self) -> None:
        self.last_command_at = time.monotonic()

    def enforce(self) -> bool:
        if self.last_command_at == 0:
            self.motors.stop()
            return True
        elapsed_ms = (time.monotonic() - self.last_command_at) * 1000
        if elapsed_ms > self.timeout_ms:
            self.motors.stop()
            return True
        return False
