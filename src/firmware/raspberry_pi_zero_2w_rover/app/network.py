from __future__ import annotations

import socket
import subprocess


class NetworkInspector:
    def interfaces(self) -> dict:
        ssid = self._read_command(["iwgetid", "-r"]) or "Robocop-FreeNet"
        signal_text = self._read_command(["bash", "-lc", "iwconfig wlan0 | grep -oE 'Signal level=-?[0-9]+' | cut -d= -f2"])
        ip_address = self._ip_address()

        interface = {
            "name": "wlan0",
            "mode": "station",
            "connected": True,
            "ssid": ssid,
            "security": "open",
            "signal": int(signal_text) if signal_text and signal_text.lstrip("-").isdigit() else -42,
            "ip_address": ip_address,
            "mac_address": self._read_command(["bash", "-lc", "cat /sys/class/net/wlan0/address"]) or "02:42:ac:11:00:2a",
        }

        return {
            "interfaces": [interface],
            "visible_networks": [
                {
                    "ssid": ssid,
                    "security": "open",
                    "signal": interface["signal"],
                    "channel": 6,
                }
            ],
        }

    def _ip_address(self) -> str:
        try:
            return socket.gethostbyname(socket.gethostname())
        except OSError:
            return "192.168.24.52"

    def _read_command(self, command: list[str]) -> str | None:
        try:
            result = subprocess.run(
                command,
                check=False,
                capture_output=True,
                text=True,
                timeout=1,
            )
        except (FileNotFoundError, subprocess.TimeoutExpired):
            return None

        value = result.stdout.strip()
        return value or None
