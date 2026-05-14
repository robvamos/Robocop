# Rover Controller

Servizio Python pensato per Raspberry Pi sul rover. Espone API locali per AI Agent, controlla motori e sensori, produce telemetria e stream video.

## Stack

- Python 3.12+
- FastAPI
- gpiozero o pigpio
- libcamera/OpenCV
- smbus2/spidev per sensori
- NetworkManager/nmcli o wpa_supplicant per WiFi
- BlueZ per provisioning Bluetooth
- USB seriale CDC o gadget Ethernet per provisioning cablato

## Endpoint MVP

- `POST /drive`
- `POST /stop`
- `GET /status`
- `GET /video.mjpeg`
- `GET /networks/scan`
- `GET /networks/known`
- `POST /networks`
- `DELETE /networks/{ssid}`

## Gestione WiFi

Il rover deve supportare:

- scansione reti WiFi;
- salvataggio di piu' profili rete;
- fallback automatico su reti registrate;
- attesa low-power quando nessuna rete conosciuta e' disponibile;
- setup iniziale via Bluetooth o USB;
- aggiunta reti successive via WiFi, Bluetooth o USB.

Le credenziali devono essere trattate come segreti: niente log in chiaro, niente MQTT, storage cifrato o delegato al sistema operativo.
