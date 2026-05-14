from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    device_id: str = "rover-dev-001"
    mqtt_host: str = "localhost"
    mqtt_port: int = 8883
    mqtt_username: str | None = None
    mqtt_password: str | None = None
    rover_base_url: str = "http://127.0.0.1:8010"
    command_timeout_ms: int = 500


settings = Settings()
