# Moduli software

Questo documento trasforma la specifica in una prima scomposizione implementativa. La cartella `feed/` resta una sorgente di informazioni e non deve contenere artefatti prodotti dal progetto.

## Mappa componenti

```text
src/
  services/
    ai_agent/          Python, FastAPI, asyncio, MQTT, OpenCV
    rover_controller/  Python su Raspberry Pi, GPIO, camera, sensori, WiFi provisioning
    simulator/         Python, simulazione rover per MVP
  apps/
    mobile_flutter/    Dart/Flutter, joystick, video, telemetria
    dashboard_web/     TypeScript/React, debug e controllo da browser
infra/
  mqtt/                topic, ACL, naming convention
docs/
  architecture/        architettura e decisioni progettuali
tests/
  ai_agent/
  rover_controller/
  simulator/
```

## AI Agent

Percorso: `src/services/ai_agent`

Linguaggio: Python.

Riferimenti principali:

- FastAPI per API locali e diagnostica;
- asyncio per processi concorrenti;
- paho-mqtt o gmqtt per broker MQTT cloud;
- OpenCV per elaborazione immagini;
- aiortc per evoluzione WebRTC;
- SQLite per log locale leggero.

Responsabilita':

- connettersi al broker MQTT con connessione outbound;
- ricevere comandi remoti e validarli;
- inoltrare i comandi al rover reale o simulato;
- raccogliere telemetria e pubblicarla sul broker;
- gestire stream video iniziale MJPEG e futura pipeline WebRTC;
- applicare safety timeout e comando stop prioritario;
- esporre API locali `/health`, `/status`, `/telemetry`, `/stop`.

Sorgenti iniziali:

- `app/main.py`: bootstrap FastAPI e lifecycle agent;
- `app/config.py`: configurazione da variabili ambiente;
- `app/mqtt_bridge.py`: subscribe/publish MQTT;
- `app/command_router.py`: validazione e instradamento comandi;
- `app/rover_adapter.py`: interfaccia verso rover reale o simulato;
- `app/telemetry.py`: modello e pubblicazione telemetria;
- `app/video.py`: ingresso video e relay MJPEG/WebRTC;
- `app/ai_pipeline.py`: elaborazione frame e generazione eventi;
- `app/safety.py`: watchdog, timeout e stop.

## Rover Controller

Percorso: `src/services/rover_controller`

Linguaggio: Python su Raspberry Pi.

Riferimenti principali:

- FastAPI o server HTTP leggero;
- gpiozero o pigpio per motori e GPIO;
- libcamera/OpenCV per camera;
- smbus2/spidev per sensori I2C/SPI;
- NetworkManager/nmcli o wpa_supplicant per WiFi;
- BlueZ per provisioning Bluetooth;
- USB seriale CDC o gadget Ethernet per provisioning cablato;
- keyring, file cifrato o integrazione OS per segreti WiFi;
- systemd per avvio automatico.

Responsabilita':

- ricevere comandi dall'AI Agent sulla LAN;
- controllare motori tramite driver TB6612FNG o L298N;
- leggere sensori come IMU, ultrasuoni, encoder e batteria;
- fornire telemetria locale;
- produrre stream video MJPEG;
- fermare i motori se non arrivano comandi validi entro timeout;
- scansionare reti WiFi disponibili;
- memorizzare piu' reti WiFi conosciute;
- scegliere automaticamente la rete migliore tra quelle registrate;
- fare fallback su altre reti note in assenza di connettivita';
- attendere reti conosciute in modalita' low-power quando nessuna rete e' disponibile;
- ricevere la prima configurazione rete via app mobile o app PC usando Bluetooth o USB;
- ricevere reti successive anche via WiFi, oltre a USB o Bluetooth.

Sorgenti iniziali:

- `app/main.py`: endpoint HTTP locali;
- `app/motors.py`: astrazione motori e driver;
- `app/sensors.py`: lettura sensori;
- `app/camera.py`: stream MJPEG;
- `app/safety.py`: watchdog locale;
- `app/network_manager.py`: scansione WiFi, profili rete, fallback e attesa low-power;
- `app/provisioning.py`: setup credenziali via USB, Bluetooth o WiFi autenticato;
- `app/credential_store.py`: salvataggio sicuro delle credenziali WiFi.

## Provisioning e gestione reti

Percorso: `src/services/rover_controller/app`

Linguaggio: Python su Raspberry Pi, con comandi OS delegati a NetworkManager o wpa_supplicant.

Canali:

- Bluetooth BLE o RFCOMM per setup da app mobile/PC;
- USB seriale CDC per setup cablato;
- USB gadget Ethernet come alternativa per pagina/API locale;
- WiFi gia' connesso per aggiungere reti successive alla prima.

Regole operative:

- la prima rete deve poter essere configurata senza WiFi preesistente, quindi via Bluetooth o USB;
- se la rete richiede autenticazione, l'app invia SSID, tipo sicurezza e credenziale tramite canale cifrato o collegamento fisico USB;
- il rover conserva piu' profili, con priorita', ultimo successo e contatore fallimenti;
- in caso di perdita connettivita', il rover prova fallback ordinato su reti note visibili;
- se nessuna rete nota e' visibile, riduce frequenza di scansione e spegne servizi non essenziali;
- il rover resta in ascolto di provisioning Bluetooth/USB anche in modalita' risparmio, con duty cycle configurabile;
- le credenziali non devono essere pubblicate su MQTT ne' finite nei log.

## Simulator

Percorso: `src/services/simulator`

Linguaggio: Python.

Riferimenti principali:

- FastAPI per replicare le API del Rover Controller;
- asyncio per aggiornare stato e telemetria;
- pytest per testare contratti e safety.

Responsabilita':

- simulare un rover senza hardware;
- accettare gli stessi comandi del rover reale;
- generare telemetria fittizia;
- permettere lo sviluppo di AI Agent e app mobile prima dell'hardware.

Sorgenti iniziali:

- `app/main.py`: API compatibile con rover reale;
- `app/simulated_rover.py`: modello cinematico minimale.

## Mobile App

Percorso: `src/apps/mobile_flutter`

Linguaggio: Dart/Flutter.

Riferimenti principali:

- `mqtt_client` per MQTT over TLS;
- `flutter_secure_storage` per token e credenziali;
- player HTTP/MJPEG iniziale;
- WebRTC plugin nella fase evolutiva.

Responsabilita':

- autenticare l'utente;
- mostrare joystick virtuale;
- inviare comandi `drive` e `stop`;
- visualizzare telemetria e stato;
- mostrare video live;
- gestire perdita connessione e stato sicuro.

Sorgenti iniziali:

- `lib/main.dart`: app minimale con separazione prevista tra MQTT, joystick e stato.

## Dashboard Web

Percorso: `src/apps/dashboard_web`

Linguaggio: TypeScript/React.

Riferimenti principali:

- Vite;
- React;
- MQTT over WebSocket o WebSocket verso AI Agent;
- player MJPEG/WebRTC.

Responsabilita':

- debug e controllo locale/remoto da browser;
- visualizzazione stato, telemetria e log;
- comando stop immediato;
- base futura per Nest Hub e integrazione Home Assistant.

Sorgenti iniziali:

- `src/main.tsx`: shell React;
- `src/App.tsx`: vista controllo rover.

## Infrastruttura MQTT

Percorso: `infra/mqtt`

Responsabilita':

- definire naming topic;
- documentare payload;
- predisporre ACL;
- separare topic per device e ambiente.

File iniziali:

- `topics.md`: convenzioni topic e payload;
- `acl.example.conf`: esempio di permessi broker.
