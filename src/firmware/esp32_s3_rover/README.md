# ESP32-S3 Rover Firmware

Firmware base per retrofit Nikko Super Dominator con ESP32-S3-CAM o board ESP32-S3 con camera.

## Funzioni

- WiFi station;
- HTTP API compatibile con `rover_controller`;
- controllo trazione con H-bridge;
- controllo sterzo con H-bridge;
- PWM progressivo;
- watchdog locale;
- status JSON;
- camera predisposta.

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

## Sicurezza

- Non collegare motori direttamente ai GPIO.
- Usare buck converter per alimentare la board.
- GND batteria, driver e board devono essere comuni.
- Misurare corrente motori prima di scegliere il driver definitivo.
