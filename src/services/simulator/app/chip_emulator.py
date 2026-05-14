from __future__ import annotations

import time
from dataclasses import asdict, dataclass
from typing import Any


COMMAND_TIMEOUT_MS = 500
MAX_DRIVE_DUTY = 900
MAX_STEER_DUTY = 700
MAX_SIGNAL_HISTORY = 16


@dataclass(frozen=True)
class VisibleWifiNetwork:
    ssid: str
    security: str
    signal: int
    channel: int


@dataclass
class WifiInterfaceState:
    name: str = "wlan0"
    mode: str = "station"
    connected: bool = True
    ssid: str = "Robocop-FreeNet"
    security: str = "open"
    signal: int = -42
    ip_address: str = "192.168.24.42"
    mac_address: str = "02:42:ac:11:00:2a"


class SimulatedChipEmulator:
    """Emula il firmware del chip ESP32-S3 a un livello vicino alle API firmware.

    L'interfaccia grafica deve restare esterna: questa classe espone solo stato e
    contratti HTTP, come farebbe il codice caricato sulla board.
    """

    def __init__(self, device_id: str = "esp32-s3-cam-dev-001") -> None:
        self.device_id = device_id
        self.x = 0.0
        self.y = 0.0
        self.speed = 0
        self.camera_enabled = False
        self.last_command_at_ms = 0
        self.battery_raw = 2870
        self.heading = 0.0
        self.position_x = 0.0
        self.position_y = 0.0
        self._last_tick_ms = self._now_ms()
        self.signal_history: list[dict[str, Any]] = []
        self.wifi_interface = WifiInterfaceState()
        self.visible_networks = [
            VisibleWifiNetwork(
                ssid="Robocop-FreeNet",
                security="open",
                signal=-42,
                channel=6,
            ),
            VisibleWifiNetwork(
                ssid="Workshop-Guest",
                security="open",
                signal=-64,
                channel=11,
            ),
        ]
        self._record_signal(
            signal="boot",
            payload={"wifi": self.wifi_interface.ssid},
            outcome="connected",
            detail="Chip avviato e collegato alla rete aperta.",
        )

    def _now_ms(self) -> int:
        return int(time.monotonic() * 1000)

    def _duty_from_command(self, value: float, speed_limit: int, max_duty: int) -> int:
        limited = min(max(abs(value), 0.0), 1.0)
        speed_scale = min(max(speed_limit, 0), 100) / 100.0
        return int(limited * speed_scale * max_duty)

    def _record_signal(
        self,
        *,
        signal: str,
        payload: dict[str, Any],
        outcome: str,
        detail: str,
    ) -> None:
        entry = {
            "timestampMs": self._now_ms(),
            "signal": signal,
            "payload": payload,
            "outcome": outcome,
            "detail": detail,
        }
        self.signal_history.insert(0, entry)
        del self.signal_history[MAX_SIGNAL_HISTORY:]

    def _tick(self, now_ms: int | None = None) -> None:
        current_ms = self._now_ms() if now_ms is None else now_ms
        elapsed_ms = max(current_ms - self._last_tick_ms, 0)
        self._last_tick_ms = current_ms

        # Cinematica minimale per l'emulazione visiva.
        self.heading += self.x * (elapsed_ms / 180.0)
        velocity = (self.speed / 100.0) * self.y
        self.position_x += velocity * (elapsed_ms / 1000.0)
        self.position_y += (velocity * 0.6) * (elapsed_ms / 1000.0)

        if self.last_command_at_ms and current_ms - self.last_command_at_ms > COMMAND_TIMEOUT_MS:
            self.x = 0.0
            self.y = 0.0
            self.speed = 0
            self._record_signal(
                signal="watchdog_stop",
                payload={"timeoutMs": COMMAND_TIMEOUT_MS},
                outcome="stopped",
                detail="Timeout comandi: trazione azzerata per sicurezza.",
            )
            self.last_command_at_ms = 0

    def _motion_state(self) -> dict[str, Any]:
        throttle_pct = int(round(self.y * 100))
        steer_pct = int(round(self.x * 100))
        if self.y > 0.05:
            direction = "forward"
        elif self.y < -0.05:
            direction = "reverse"
        else:
            direction = "idle"

        if self.x > 0.08:
            steering = "right"
        elif self.x < -0.08:
            steering = "left"
        else:
            steering = "straight"

        return {
            "direction": direction,
            "steering": steering,
            "throttlePct": throttle_pct,
            "steerPct": steer_pct,
            "accelerationPct": int(round(abs(self.y) * self.speed)),
        }

    def drive(self, x: float, y: float, speed: int) -> None:
        self._tick()
        self.x = min(max(x, -1.0), 1.0)
        self.y = min(max(y, -1.0), 1.0)
        self.speed = min(max(speed, 0), 100)
        self.last_command_at_ms = self._now_ms()
        motion = self._motion_state()
        self._record_signal(
            signal="drive",
            payload={"x": round(self.x, 2), "y": round(self.y, 2), "speed": self.speed},
            outcome="applied",
            detail=(
                f"Direzione {motion['direction']}, sterzo {motion['steering']}, "
                f"accelerazione {motion['accelerationPct']}%"
            ),
        )

    def stop(self, update_command_timestamp: bool = True) -> None:
        if update_command_timestamp:
            self._tick()
        self.x = 0.0
        self.y = 0.0
        self.speed = 0
        if update_command_timestamp:
            self.last_command_at_ms = self._now_ms()
            self._record_signal(
                signal="stop",
                payload={},
                outcome="stopped",
                detail="Arresto richiesto dal controller.",
            )

    def set_camera_power(self, enabled: bool) -> None:
        self._tick()
        self.camera_enabled = enabled
        self._record_signal(
            signal="camera_power",
            payload={"enabled": enabled},
            outcome="applied",
            detail=f"Camera {'accesa' if enabled else 'spenta'} dal controller.",
        )

    def camera_status(self) -> dict:
        return {
            "enabled": self.camera_enabled,
            "streaming": self.camera_enabled,
            "sensor": "esp32-s3-cam",
        }

    def network_interfaces(self) -> dict:
        return {
            "interfaces": [asdict(self.wifi_interface)],
            "visible_networks": [asdict(network) for network in self.visible_networks],
        }

    def status(self) -> dict:
        self._tick()
        timed_out = self.last_command_at_ms == 0 or (
            self._now_ms() - self.last_command_at_ms > COMMAND_TIMEOUT_MS
        )

        return {
            "online": True,
            "deviceId": self.device_id,
            "timedOut": timed_out,
            "drive": {"x": self.x, "y": self.y, "speed": self.speed},
            "batteryRaw": self.battery_raw,
            "batteryPct": 82,
            "camera": self.camera_status(),
            "network": {
                "interface": asdict(self.wifi_interface),
                "visibleNetworks": [asdict(network) for network in self.visible_networks],
            },
            "pwm": {
                "driveDuty": self._duty_from_command(self.y, self.speed, MAX_DRIVE_DUTY),
                "steerDuty": self._duty_from_command(self.x, 100, MAX_STEER_DUTY),
            },
            "motion": self._motion_state(),
            "pose": {
                "heading": round(self.heading, 2),
                "x": round(self.position_x, 3),
                "y": round(self.position_y, 3),
            },
            "debug": {
                "lastSignals": self.signal_history[:8],
                "lastOutcome": self.signal_history[0] if self.signal_history else None,
            },
        }

    def debug_signals(self) -> dict:
        self._tick()
        return {
            "signals": self.signal_history[:12],
            "count": len(self.signal_history),
            "lastOutcome": self.signal_history[0] if self.signal_history else None,
        }
