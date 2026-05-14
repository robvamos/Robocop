class SimulatedRover:
    def __init__(self) -> None:
        self.x = 0.0
        self.y = 0.0
        self.speed = 0
        self.battery = 100

    def drive(self, x: float, y: float, speed: int) -> None:
        self.x = x
        self.y = y
        self.speed = speed

    def stop(self) -> None:
        self.drive(0.0, 0.0, 0)

    def status(self) -> dict:
        return {
            "online": True,
            "mode": "manual",
            "drive": {"x": self.x, "y": self.y, "speed": self.speed},
            "sensors": {
                "battery": self.battery,
                "rssi": -50,
                "obstacle_cm": 120,
                "heading": 0,
            },
        }
