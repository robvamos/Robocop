from fastapi import FastAPI
from pydantic import BaseModel, Field

from .camera import CameraController
from .motors import MotorController
from .network import NetworkInspector
from .safety import LocalWatchdog

app = FastAPI(title="Robocop Raspberry Pi Zero 2 W Rover")

motors = MotorController()
camera = CameraController()
network = NetworkInspector()
watchdog = LocalWatchdog(motors)


class DriveRequest(BaseModel):
    x: float = Field(ge=-1.0, le=1.0)
    y: float = Field(ge=-1.0, le=1.0)
    speed: int = Field(ge=0, le=100)


class CameraPowerRequest(BaseModel):
    enabled: bool


@app.post("/drive")
async def drive(request: DriveRequest) -> dict:
    watchdog.mark_command()
    motors.drive(request.x, request.y, request.speed)
    return {"accepted": True}


@app.post("/stop")
async def stop() -> dict:
    motors.stop()
    return {"stopped": True}


@app.post("/camera/power")
async def camera_power(request: CameraPowerRequest) -> dict:
    camera.set_power(request.enabled)
    return {"accepted": True, "camera": camera.status()}


@app.get("/camera/status")
async def camera_status() -> dict:
    return camera.status()


@app.get("/network/interfaces")
async def network_interfaces() -> dict:
    return network.interfaces()


@app.get("/status")
async def status() -> dict:
    timed_out = watchdog.enforce()
    interfaces = network.interfaces()
    return {
        "online": True,
        "deviceId": "raspberry-pi-zero-2w-dev-001",
        "timedOut": timed_out,
        "drive": {
            "x": motors.last_drive.x,
            "y": motors.last_drive.y,
            "speed": motors.last_drive.speed,
        },
        "batteryRaw": 3020,
        "batteryPct": 86,
        "camera": camera.status(),
        "network": {
            "interface": interfaces["interfaces"][0],
            "visibleNetworks": interfaces["visible_networks"],
        },
        "pwm": motors.pwm_status(),
        "motion": motors.motion_status(),
        "pose": {
            "heading": round(motors.last_drive.x * 20.0, 2),
            "x": round(motors.last_drive.y * 0.3, 3),
            "y": round(motors.last_drive.y * 0.18, 3),
        },
        "debug": {
            "lastOutcome": {
                "signal": "watchdog_stop" if timed_out else "drive_loop",
                "detail": (
                    "Timeout comandi: arresto locale Raspberry Pi."
                    if timed_out
                    else "Comandi applicati al runtime Raspberry Pi."
                ),
            }
        },
    }
