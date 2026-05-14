from fastapi import FastAPI

from .command_router import CommandRouter
from .config import settings
from .rover_adapter import RoverAdapter
from .safety import SafetyManager

app = FastAPI(title="Robocop AI Agent")

safety = SafetyManager(settings.command_timeout_ms)
rover = RoverAdapter(settings.rover_base_url)
router = CommandRouter(rover, safety)


@app.get("/health")
async def health() -> dict:
    return {"ok": True, "service": "ai_agent", "device_id": settings.device_id}


@app.get("/status")
async def status() -> dict:
    return {
        "agent_connected": True,
        "rover": await rover.status(),
        "safety_stop_required": safety.should_stop(),
    }


@app.post("/cmd")
async def command(payload: dict) -> dict:
    await router.route(payload)
    return {"accepted": True}


@app.post("/stop")
async def stop() -> dict:
    await rover.stop()
    return {"stopped": True}
