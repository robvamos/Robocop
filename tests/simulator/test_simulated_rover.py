from src.services.simulator.app.simulated_rover import SimulatedRover


def test_simulated_rover_drive_and_stop() -> None:
    rover = SimulatedRover()

    rover.drive(0.2, 0.8, 40)
    assert rover.status()["drive"] == {"x": 0.2, "y": 0.8, "speed": 40}

    rover.stop()
    assert rover.status()["drive"] == {"x": 0.0, "y": 0.0, "speed": 0}
