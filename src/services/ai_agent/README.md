# AI Agent opzionale

Microservizio Python opzionale per elaborazioni AI locali. La logica applicativa principale vive nel `control_agent` Node.js, piu' portabile su PC, container e cloud economico.

## Stack

- Python 3.12+
- FastAPI
- asyncio
- paho-mqtt o gmqtt
- OpenCV
- aiortc in fase WebRTC

## Responsabilita'

- elaborare frame con OpenCV;
- eseguire modelli AI locali;
- pubblicare eventi AI verso MQTT o Control Agent;
- isolare dipendenze native Python dal servizio principale.

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
