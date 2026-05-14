from fastapi import FastAPI
from pydantic import BaseModel, Field

from .simulated_rover import SimulatedRover

app = FastAPI(title="Robocop Rover Simulator")
rover = SimulatedRover()


class DriveRequest(BaseModel):
    x: float = Field(ge=-1.0, le=1.0)
    y: float = Field(ge=-1.0, le=1.0)
    speed: int = Field(ge=0, le=100)


@app.post("/drive")
async def drive(request: DriveRequest) -> dict:
    rover.drive(request.x, request.y, request.speed)
    return {"accepted": True}


@app.post("/stop")
async def stop() -> dict:
    rover.stop()
    return {"stopped": True}


@app.get("/status")
async def status() -> dict:
    return rover.status()
