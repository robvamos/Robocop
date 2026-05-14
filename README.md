# Robocop

Remote Drone.

Robocop e' una piattaforma modulare per controllare da remoto un rover terrestre con video, telemetria, comandi realtime e futura AI locale.

La cartella `feed/` contiene solo documenti sorgente da analizzare. Gli artefatti prodotti dal progetto vivono in `docs/`, `src/`, `infra/` e `tests/`.

## Project Structure

- `feed/` - documenti originali e input informativi, non output generati
- `docs/` - architettura, moduli, decisioni e pianificazione
- `src/services/control_agent/` - servizio Node.js portabile PC/cloud per broker, comandi, telemetria e API
- `src/services/ai_agent/` - microservizio Python opzionale per AI locale, OpenCV e modelli pesanti
- `src/services/rover_controller/` - controller Python per Raspberry Pi sul rover
- `src/services/simulator/` - rover simulato compatibile con le API reali
- `src/apps/mobile_flutter/` - app mobile Flutter
- `src/apps/dashboard_web/` - dashboard React/Vite
- `infra/mqtt/` - topic MQTT e ACL di riferimento
- `infra/cloud-run/` - profilo deploy Cloud Run per costi minimi e scale-to-zero
- `infra/compute-engine/` - profilo deploy e2-micro always-on
- `infra/cloudflare-workers-signaling/` - profilo signaling WebRTC edge, senza media relay
- `tests/` - test automatici

## GitHub

This project is intended to be connected to a GitHub repository once GitHub access is available from this environment.

## Documenti principali

- `docs/architecture/component_architecture.md`
- `docs/modules.md`
- `docs/codex_skills.md`
- `docs/deployment_options.md`
- `docs/free_deploy_matrix.md`
- `docs/media_transport.md`
- `infra/mqtt/topics.md`
