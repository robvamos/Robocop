from fastapi import FastAPI
from pydantic import BaseModel, Field

from .camera import CameraController
from .credential_store import CredentialStore
from .motors import MotorController
from .network_manager import NetworkBackend, NetworkManager
from .provisioning import ProvisioningService, WifiProvisioningRequest
from .safety import LocalWatchdog
from .sensors import SensorReader

app = FastAPI(title="Robocop Rover Controller")

motors = MotorController()
camera = CameraController()
sensors = SensorReader()
watchdog = LocalWatchdog(motors)
network_store = CredentialStore()
network_manager = NetworkManager(NetworkBackend(), network_store)
provisioning = ProvisioningService(network_manager)


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


@app.get("/status")
async def status() -> dict:
    safety_stop = watchdog.enforce()
    return {
        "online": True,
        "mode": "manual",
        "safety_stop": safety_stop,
        "drive": motors.last_drive,
        "camera": camera.status(),
        "sensors": sensors.read(),
    }


@app.get("/networks/scan")
async def scan_networks() -> dict:
    networks = await network_manager.scan()
    return {"networks": [network.__dict__ for network in networks]}


@app.get("/networks/known")
async def known_networks() -> dict:
    return {"networks": network_manager.known_networks()}


@app.post("/networks")
async def add_network(request: WifiProvisioningRequest) -> dict:
    provisioning.add_wifi_network(request)
    return {"saved": True}


@app.delete("/networks/{ssid}")
async def remove_network(ssid: str) -> dict:
    network_manager.remove_network(ssid)
    return {"removed": True}


@app.post("/networks/connect")
async def connect_network() -> dict:
    connected = await network_manager.connect_best_known_network()
    return {"connected": connected}
