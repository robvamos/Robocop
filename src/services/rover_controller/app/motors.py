class MotorController:
    """Astrazione motori.

    Implementazione Raspberry prevista: gpiozero/pigpio con driver TB6612FNG
    o L298N. In sviluppo desktop mantiene solo l'ultimo comando.
    """

    def __init__(self) -> None:
        self.last_drive = {"x": 0.0, "y": 0.0, "speed": 0}

    def drive(self, x: float, y: float, speed: int) -> None:
        self.last_drive = {"x": x, "y": y, "speed": speed}

    def stop(self) -> None:
        self.drive(0.0, 0.0, 0)
