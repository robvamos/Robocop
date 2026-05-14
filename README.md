# Robocop

Remote Drone.

Robocop e' una piattaforma modulare per controllare da remoto un rover terrestre con video, telemetria, comandi realtime e futura AI locale.

La cartella `feed/` contiene solo documenti sorgente da analizzare. Gli artefatti prodotti dal progetto vivono in `docs/`, `src/`, `infra/` e `tests/`.

## Project Structure

- `feed/` - documenti originali e input informativi, non output generati
- `docs/` - architettura, moduli, decisioni e pianificazione
- `src/services/ai_agent/` - bridge Python tra cloud broker, rover, video e AI
- `src/services/rover_controller/` - controller Python per Raspberry Pi sul rover
- `src/services/simulator/` - rover simulato compatibile con le API reali
- `src/apps/mobile_flutter/` - app mobile Flutter
- `src/apps/dashboard_web/` - dashboard React/Vite
- `infra/mqtt/` - topic MQTT e ACL di riferimento
- `tests/` - test automatici

## GitHub

This project is intended to be connected to a GitHub repository once GitHub access is available from this environment.

## Documenti principali

- `docs/architecture/component_architecture.md`
- `docs/modules.md`
- `docs/codex_skills.md`
- `infra/mqtt/topics.md`
