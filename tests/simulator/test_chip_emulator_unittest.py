import time
import unittest

from src.services.simulator.app.chip_emulator import SimulatedChipEmulator


class SimulatedChipEmulatorTests(unittest.TestCase):
    def test_emulator_boots_on_open_wifi(self) -> None:
        emulator = SimulatedChipEmulator()

        interfaces = emulator.network_interfaces()["interfaces"]

        self.assertEqual(interfaces[0]["ssid"], "Robocop-FreeNet")
        self.assertEqual(interfaces[0]["security"], "open")
        self.assertTrue(interfaces[0]["connected"])

    def test_drive_and_camera_power_are_reflected_in_status(self) -> None:
        emulator = SimulatedChipEmulator()

        emulator.drive(0.25, 0.9, 65)
        emulator.set_camera_power(True)
        status = emulator.status()

        self.assertEqual(status["drive"], {"x": 0.25, "y": 0.9, "speed": 65})
        self.assertTrue(status["camera"]["enabled"])
        self.assertGreater(status["pwm"]["driveDuty"], 0)
        self.assertGreater(status["pwm"]["steerDuty"], 0)
        self.assertEqual(status["motion"]["direction"], "forward")
        self.assertEqual(status["debug"]["lastOutcome"]["signal"], "camera_power")

    def test_watchdog_stops_motion_after_timeout(self) -> None:
        emulator = SimulatedChipEmulator()

        emulator.drive(0.4, 1.0, 80)
        time.sleep(0.65)
        status = emulator.status()

        self.assertEqual(status["drive"], {"x": 0.0, "y": 0.0, "speed": 0})
        self.assertTrue(status["timedOut"])
        self.assertEqual(status["debug"]["lastOutcome"]["signal"], "watchdog_stop")

    def test_debug_signals_keep_recent_controller_history(self) -> None:
        emulator = SimulatedChipEmulator()

        emulator.drive(-0.55, -0.8, 72)
        emulator.set_camera_power(True)
        payload = emulator.debug_signals()

        self.assertGreaterEqual(payload["count"], 3)
        self.assertEqual(payload["signals"][0]["signal"], "camera_power")
        self.assertEqual(payload["signals"][1]["signal"], "drive")
        self.assertEqual(payload["signals"][1]["outcome"], "applied")


if __name__ == "__main__":
    unittest.main()
