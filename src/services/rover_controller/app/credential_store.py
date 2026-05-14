from dataclasses import dataclass


@dataclass(frozen=True)
class WifiCredential:
    ssid: str
    security: str
    password: str | None = None
    priority: int = 0


class CredentialStore:
    """Archivio credenziali WiFi.

    MVP: interfaccia in memoria per test e sviluppo.
    Raspberry: delegare preferibilmente a NetworkManager, oppure cifrare file
    locale con permessi stretti. Le password non devono essere loggate.
    """

    def __init__(self) -> None:
        self._credentials: dict[str, WifiCredential] = {}

    def save(self, credential: WifiCredential) -> None:
        self._credentials[credential.ssid] = credential

    def remove(self, ssid: str) -> None:
        self._credentials.pop(ssid, None)

    def list(self) -> list[WifiCredential]:
        return sorted(
            self._credentials.values(),
            key=lambda item: item.priority,
            reverse=True,
        )

    def get(self, ssid: str) -> WifiCredential | None:
        return self._credentials.get(ssid)
