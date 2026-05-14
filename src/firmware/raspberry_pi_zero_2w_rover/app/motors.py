from __future__ import annotations

from dataclasses import dataclass


MAX_DRIVE_DUTY = 900
MAX_STEER_DUTY = 700


@dataclass
class MotorState:
    x: float = 0.0
    y: float = 0.0
    speed: int = 0


class MotorController:
    def __init__(self) -> None:
        self.last_drive = MotorState()

    def drive(self, x: float, y: float, speed: int) -> None:
        self.last_drive = MotorState(
            x=max(-1.0, min(1.0, x)),
            y=max(-1.0, min(1.0, y)),
            speed=max(0, min(100, speed)),
        )

    def stop(self) -> None:
        self.last_drive = MotorState()

    def pwm_status(self) -> dict:
        return {
            "driveDuty": self._duty_from_command(
                self.last_drive.y,
                self.last_drive.speed,
                MAX_DRIVE_DUTY,
            ),
            "steerDuty": self._duty_from_command(
                self.last_drive.x,
                100,
                MAX_STEER_DUTY,
            ),
        }

    def motion_status(self) -> dict:
        y = self.last_drive.y
        x = self.last_drive.x
        if y > 0.05:
            direction = "forward"
        elif y < -0.05:
            direction = "reverse"
        else:
            direction = "idle"

        if x > 0.08:
            steering = "right"
        elif x < -0.08:
            steering = "left"
        else:
            steering = "straight"

        return {
            "direction": direction,
            "steering": steering,
            "throttlePct": int(round(y * 100)),
            "steerPct": int(round(x * 100)),
            "accelerationPct": int(round(abs(y) * self.last_drive.speed)),
        }

    def _duty_from_command(self, value: float, speed_limit: int, max_duty: int) -> int:
        limited = min(max(abs(value), 0.0), 1.0)
        speed_scale = min(max(speed_limit, 0), 100) / 100.0
        return int(limited * speed_scale * max_duty)
