from pydantic import BaseModel, Field

from .rover_adapter import RoverAdapter
from .safety import SafetyManager


class DriveCommand(BaseModel):
    type: str = Field(pattern="^drive$")
    x: float = Field(ge=-1.0, le=1.0)
    y: float = Field(ge=-1.0, le=1.0)
    speed: int = Field(ge=0, le=100)
    seq: int | None = None
    ts: str | None = None


class StopCommand(BaseModel):
    type: str = Field(pattern="^stop$")
    seq: int | None = None
    ts: str | None = None


class CommandRouter:
    def __init__(self, rover: RoverAdapter, safety: SafetyManager) -> None:
        self.rover = rover
        self.safety = safety

    async def route(self, payload: dict) -> None:
        command_type = payload.get("type")
        if command_type == "drive":
            command = DriveCommand.model_validate(payload)
            self.safety.mark_command()
            await self.rover.drive(command.x, command.y, command.speed)
            return

        if command_type == "stop":
            StopCommand.model_validate(payload)
            await self.rover.stop()
            return

        raise ValueError(f"Unsupported command type: {command_type}")
