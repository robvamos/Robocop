# AI Agent

Servizio Python eseguito sul PC di casa. Fa da ponte tra Cloud Broker MQTT, rover in LAN, video, telemetria e futura AI locale.

## Stack

- Python 3.12+
- FastAPI
- asyncio
- paho-mqtt o gmqtt
- OpenCV
- aiortc in fase WebRTC

## Moduli

- `main.py`: API locali e lifecycle del servizio.
- `config.py`: configurazione da ambiente.
- `mqtt_bridge.py`: connessione MQTT cloud.
- `command_router.py`: validazione e routing comandi.
- `rover_adapter.py`: client verso rover reale o simulato.
- `telemetry.py`: modelli telemetria e pubblicazione.
- `video.py`: ingest e relay video.
- `ai_pipeline.py`: analisi frame e output AI.
- `safety.py`: watchdog e stop prioritario.
