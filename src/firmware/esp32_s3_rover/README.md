# ESP32-S3 Rover Firmware

Firmware base per retrofit Nikko Super Dominator con ESP32-S3-CAM o board ESP32-S3 con camera.

Questa cartella contiene solo l'implementazione specifica per il chip `esp32_s3`.
Ogni altro chip deve vivere in una cartella dedicata con il proprio nome sotto `src/firmware/`.

## Funzioni

- WiFi station;
- HTTP API compatibile con `rover_controller`;
- controllo trazione con H-bridge;
- controllo sterzo con H-bridge;
- PWM progressivo;
- watchdog locale;
- status JSON;
- camera on/off via API;
- endpoint rete e camera compatibili con l'emulatore.

## Endpoint MVP

- `POST /drive`
- `POST /stop`
- `POST /camera/power`
- `GET /camera/status`
- `GET /network/interfaces`
- `GET /status`

## Build

Ambiente previsto: PlatformIO.

```bash
pio run
pio run -t upload
pio device monitor
```

## Configurazione

Copiare:

```text
include/config.example.h -> include/config.h
```

e impostare SSID/password o provisioning futuro.

Se `config.h` non esiste ancora, il firmware usa `config.example.h` come fallback
per partire con la configurazione di sviluppo.

## Sicurezza

- Non collegare motori direttamente ai GPIO.
- Usare buck converter per alimentare la board.
- GND batteria, driver e board devono essere comuni.
- Misurare corrente motori prima di scegliere il driver definitivo.
