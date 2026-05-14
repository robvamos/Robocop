class CameraController:
    def __init__(self) -> None:
        self.enabled = False

    def set_power(self, enabled: bool) -> None:
        self.enabled = enabled

    def status(self) -> dict:
        return {
            "enabled": self.enabled,
            "streaming": self.enabled,
            "sensor": "rpi-camera",
        }
