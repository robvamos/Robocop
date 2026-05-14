# Simulator

Rover simulato compatibile con le API del `rover_controller`. Serve per validare AI Agent, app mobile e dashboard prima dell'hardware.

## Stack

- Python 3.12+
- FastAPI
- asyncio
- pytest

## Responsabilita'

- ricevere `drive` e `stop`;
- aggiornare uno stato cinematico minimale;
- esporre telemetria fittizia;
- replicare i contratti HTTP del rover reale.
