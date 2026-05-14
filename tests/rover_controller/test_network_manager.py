import asyncio

from src.services.rover_controller.app.credential_store import (
    CredentialStore,
    WifiCredential,
)
from src.services.rover_controller.app.network_manager import (
    NetworkBackend,
    NetworkManager,
    WifiNetwork,
    WifiSecurity,
)


class FakeBackend(NetworkBackend):
    def __init__(self) -> None:
        self.connected_ssid: str | None = None

    async def scan(self) -> list[WifiNetwork]:
        return [
            WifiNetwork("Backup", signal=60, security=WifiSecurity.WPA2_PSK),
            WifiNetwork("Casa", signal=40, security=WifiSecurity.WPA2_PSK),
        ]

    async def connect(self, credential: WifiCredential) -> bool:
        self.connected_ssid = credential.ssid
        return True


def test_connect_best_known_network_prefers_priority() -> None:
    backend = FakeBackend()
    store = CredentialStore()
    manager = NetworkManager(backend, store)
    manager.add_network(WifiCredential("Casa", "wpa2-psk", "secret", priority=10))
    manager.add_network(WifiCredential("Backup", "wpa2-psk", "secret", priority=1))

    connected = asyncio.run(manager.connect_best_known_network())

    assert connected is True
    assert backend.connected_ssid == "Casa"
