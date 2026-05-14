from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .simulated_rover import SimulatedRover

app = FastAPI(title="Robocop Rover Simulator")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
rover = SimulatedRover()


class DriveRequest(BaseModel):
    x: float = Field(ge=-1.0, le=1.0)
    y: float = Field(ge=-1.0, le=1.0)
    speed: int = Field(ge=0, le=100)


class CameraPowerRequest(BaseModel):
    enabled: bool


@app.post("/drive")
async def drive(request: DriveRequest) -> dict:
    rover.drive(request.x, request.y, request.speed)
    return {"accepted": True}


@app.post("/stop")
async def stop() -> dict:
    rover.stop()
    return {"stopped": True}


@app.post("/camera/power")
async def camera_power(request: CameraPowerRequest) -> dict:
    rover.set_camera_power(request.enabled)
    return {"accepted": True, "camera": rover.camera_status()}


@app.get("/camera/status")
async def camera_status() -> dict:
    return rover.camera_status()


@app.get("/network/interfaces")
async def network_interfaces() -> dict:
    return rover.network_interfaces()


@app.get("/networks/scan")
async def scan_networks() -> dict:
    return {"networks": rover.network_interfaces()["visible_networks"]}


@app.get("/status")
async def status() -> dict:
    return rover.status()


@app.get("/debug/signals")
async def debug_signals() -> dict:
    return rover.debug_signals()
