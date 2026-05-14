from enum import StrEnum

from pydantic import BaseModel, Field

from .credential_store import WifiCredential
from .network_manager import NetworkManager


class ProvisioningChannel(StrEnum):
    BLUETOOTH = "bluetooth"
    USB = "usb"
    WIFI = "wifi"


class WifiProvisioningRequest(BaseModel):
    ssid: str = Field(min_length=1)
    security: str
    password: str | None = None
    priority: int = 0
    channel: ProvisioningChannel


class ProvisioningService:
    """Riceve credenziali da app mobile/PC e le registra nel rover.

    Prima rete: accettare solo Bluetooth o USB, perche' il rover non puo'
    dipendere da WiFi gia' configurato. Reti successive: anche WiFi, se la
    richiesta arriva da sessione autenticata.
    """

    def __init__(self, network_manager: NetworkManager) -> None:
        self.network_manager = network_manager

    def add_wifi_network(self, request: WifiProvisioningRequest) -> None:
        known_networks = self.network_manager.known_networks()
        first_network = len(known_networks) == 0

        if first_network and request.channel == ProvisioningChannel.WIFI:
            raise ValueError("First WiFi network must be provisioned via USB or Bluetooth")

        credential = WifiCredential(
            ssid=request.ssid,
            security=request.security,
            password=request.password,
            priority=request.priority,
        )
        self.network_manager.add_network(credential)
