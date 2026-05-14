import httpx


class RoverAdapter:
    def __init__(self, base_url: str) -> None:
        self.base_url = base_url.rstrip("/")

    async def drive(self, x: float, y: float, speed: int) -> None:
        async with httpx.AsyncClient(timeout=1.0) as client:
            await client.post(
                f"{self.base_url}/drive",
                json={"x": x, "y": y, "speed": speed},
            )

    async def stop(self) -> None:
        async with httpx.AsyncClient(timeout=1.0) as client:
            await client.post(f"{self.base_url}/stop")

    async def status(self) -> dict:
        async with httpx.AsyncClient(timeout=1.0) as client:
            response = await client.get(f"{self.base_url}/status")
            response.raise_for_status()
            return response.json()
