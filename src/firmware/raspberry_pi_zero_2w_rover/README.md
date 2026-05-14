# Raspberry Pi Zero 2 W Rover Runtime

Implementazione chip-specifica per `raspberry_pi_zero_2w_rover`.

Questo target e' l'opzione evolutiva rispetto a `esp32_s3_rover` quando servono:

- Linux a bordo
- integrazione camera piu' flessibile
- MJPEG/WebRTC piu' realistici
- maggiore facilita' di debug e osservabilita'

## Contratto API

Espone lo stesso contratto base del simulatore e del firmware ESP32:

- `POST /drive`
- `POST /stop`
- `POST /camera/power`
- `GET /camera/status`
- `GET /network/interfaces`
- `GET /status`

## Avvio locale

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8010
```

## Nota

Questa cartella contiene il runtime specifico del target Raspberry Pi Zero 2 W.
Non deve condividere i sorgenti firmware del target ESP32-S3.
