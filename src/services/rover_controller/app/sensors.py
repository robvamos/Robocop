class SensorReader:
    """Lettura sensori rover.

    Implementazioni previste: batteria, RSSI, ultrasuoni, IMU, encoder ruote.
    """

    def read(self) -> dict:
        return {
            "battery": None,
            "rssi": None,
            "obstacle_cm": None,
            "heading": None,
        }
