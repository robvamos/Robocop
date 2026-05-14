class MqttBridge:
    """Placeholder per la connessione MQTT cloud.

    Implementazione prevista: paho-mqtt o gmqtt, TLS obbligatorio, subscribe su
    rover/{deviceId}/cmd e publish su status/telemetry/events.
    """

    def __init__(self, device_id: str) -> None:
        self.device_id = device_id

    async def start(self) -> None:
        pass

    async def publish_telemetry(self, payload: dict) -> None:
        pass
