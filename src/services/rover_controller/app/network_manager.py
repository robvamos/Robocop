import asyncio
from dataclasses import dataclass
from enum import StrEnum

from .credential_store import CredentialStore, WifiCredential


class WifiSecurity(StrEnum):
    OPEN = "open"
    WPA2_PSK = "wpa2-psk"
    WPA3_SAE = "wpa3-sae"
    ENTERPRISE = "enterprise"


@dataclass(frozen=True)
class WifiNetwork:
    ssid: str
    signal: int
    security: WifiSecurity
    known: bool = False


class NetworkBackend:
    """Adattatore OS per WiFi.

    Implementazione Raspberry prevista:
    - NetworkManager via nmcli/dbus, oppure
    - wpa_supplicant via wpa_cli.
    """

    async def scan(self) -> list[WifiNetwork]:
        return []

    async def connect(self, credential: WifiCredential) -> bool:
        return False

    async def is_online(self) -> bool:
        return False


class NetworkManager:
    def __init__(self, backend: NetworkBackend, store: CredentialStore) -> None:
        self.backend = backend
        self.store = store
        self.scan_interval_seconds = 15
        self.max_scan_interval_seconds = 300

    async def scan(self) -> list[WifiNetwork]:
        known_ssids = {credential.ssid for credential in self.store.list()}
        networks = await self.backend.scan()
        return [
            WifiNetwork(
                ssid=network.ssid,
                signal=network.signal,
                security=network.security,
                known=network.ssid in known_ssids,
            )
            for network in networks
        ]

    def add_network(self, credential: WifiCredential) -> None:
        self.store.save(credential)

    def remove_network(self, ssid: str) -> None:
        self.store.remove(ssid)

    def known_networks(self) -> list[dict]:
        return [
            {
                "ssid": credential.ssid,
                "security": credential.security,
                "priority": credential.priority,
            }
            for credential in self.store.list()
        ]

    async def connect_best_known_network(self) -> bool:
        visible = await self.scan()
        visible_by_ssid = {network.ssid: network for network in visible}

        candidates = [
            credential
            for credential in self.store.list()
            if credential.ssid in visible_by_ssid
        ]

        candidates.sort(
            key=lambda credential: (
                credential.priority,
                visible_by_ssid[credential.ssid].signal,
            ),
            reverse=True,
        )

        for credential in candidates:
            if await self.backend.connect(credential):
                self.scan_interval_seconds = 15
                return True

        return False

    async def maintain_connectivity(self) -> None:
        while True:
            if await self.backend.is_online():
                self.scan_interval_seconds = 15
                await asyncio.sleep(self.scan_interval_seconds)
                continue

            connected = await self.connect_best_known_network()
            if connected:
                continue

            await self._low_power_wait()

    async def _low_power_wait(self) -> None:
        await asyncio.sleep(self.scan_interval_seconds)
        self.scan_interval_seconds = min(
            self.scan_interval_seconds * 2,
            self.max_scan_interval_seconds,
        )
