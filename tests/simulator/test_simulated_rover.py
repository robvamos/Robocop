import unittest

from src.services.simulator.app.simulated_rover import SimulatedRover


class SimulatedRoverTests(unittest.TestCase):
    def test_simulated_rover_drive_and_stop(self) -> None:
        rover = SimulatedRover()

        rover.drive(0.2, 0.8, 40)
        self.assertEqual(
            rover.status()["drive"],
            {"x": 0.2, "y": 0.8, "speed": 40},
        )

        rover.stop()
        self.assertEqual(
            rover.status()["drive"],
            {"x": 0.0, "y": 0.0, "speed": 0},
        )


if __name__ == "__main__":
    unittest.main()
