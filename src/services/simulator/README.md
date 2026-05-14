# Simulator / Chip Emulator

Rover simulato compatibile con le API del `rover_controller` e del firmware ESP32-S3. Serve per validare AI Agent, app mobile, dashboard e wiring del chip prima dell'hardware.

## Stack

- Python 3.12+
- FastAPI
- asyncio
- pytest

## Responsabilita'

- ricevere `drive` e `stop`;
- ricevere `camera_power`;
- aggiornare uno stato cinematico minimale;
- esporre telemetria fittizia;
- replicare i contratti HTTP del rover reale e del firmware;
- emulare una WiFi aperta gia' disponibile e la connessione di boot del chip.
