from pydantic import BaseModel


class Telemetry(BaseModel):
    battery: int | None = None
    rssi: int | None = None
    speed: float = 0.0
    heading: float | None = None
    mode: str = "manual"
    obstacle_cm: float | None = None
