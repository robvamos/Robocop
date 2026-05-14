# Bozza architettura componenti software

## 1. Visione generale

Il sistema e' pensato come una piattaforma modulare per controllare un rover terrestre da remoto, senza richiedere IP pubblico sulla rete domestica.

La topologia di riferimento e':

```text
App Mobile / Dashboard
        |
        | HTTPS / WebSocket / MQTT over TLS
        v
Cloud Broker / Relay
        |
        | connessione outbound persistente
        v
AI Agent su PC Casa
        |
        | WiFi LAN
        v
Rover Raspberry / ESP32
```

Principio chiave: tutti i componenti dentro casa aprono connessioni verso l'esterno o verso la LAN locale. Nessun servizio domestico deve essere esposto direttamente su Internet.

## 2. Componenti software principali

### 2.1 Mobile App

Responsabilita':

- autenticazione utente;
- selezione rover/dispositivo;
- joystick virtuale per guida remota;
- visualizzazione video live;
- visualizzazione telemetria in tempo reale;
- invio comandi manuali;
- ricezione notifiche di stato, errori e allarmi;
- in futuro: modalita' autonoma, patrol, object tracking.

Stack consigliato:

- Flutter;
- MQTT client per comandi e telemetria;
- WebView o player HTTP per MJPEG nella prima fase;
- WebRTC nella fase evolutiva;
- storage locale sicuro per token e configurazione.

Interfacce:

- pubblica comandi su topic MQTT dedicati;
- riceve stato e telemetria via MQTT;
- recupera configurazioni e sessioni via API HTTPS;
- apre stream video MJPEG/WebRTC tramite endpoint esposto dal cloud relay o dall'AI Agent tramite broker.

### 2.2 Cloud Broker

Responsabilita':

- punto di incontro tra app mobile e rete domestica;
- broker MQTT gestito;
- terminazione TLS;
- autenticazione e autorizzazione dei client;
- ACL per separare utenti, rover e topic;
- buffer minimo per messaggi di stato;
- audit log dei comandi principali.

Scelta MVP consigliata:

- HiveMQ Cloud o EMQX Cloud.

Alternative future:

- relay WebSocket custom;
- Firebase per app, auth e realtime state;
- Cloudflare Tunnel solo per dashboard/API, non come prima scelta per controllo realtime;
- Tailscale per uso tecnico/amministrativo, non come canale principale consumer.

Topic MQTT iniziali:

```text
rover/{deviceId}/cmd
rover/{deviceId}/status
rover/{deviceId}/telemetry
rover/{deviceId}/agent/output
rover/{deviceId}/events
```

Nota: evitare di pubblicare video raw su MQTT. MQTT va bene per comandi, stato ed eventi; il video deve usare MJPEG/WebRTC/RTSP relay.

### 2.3 AI Agent su PC Casa

Responsabilita':

- mantenere connessione outbound persistente con il Cloud Broker;
- ricevere comandi remoti;
- validare, normalizzare e inoltrare i comandi al rover;
- ricevere stream video dal rover;
- esporre o ritrasmettere video verso il client;
- elaborare frame con OpenCV/AI;
- aggregare telemetria;
- gestire logging locale;
- implementare fail-safe e watchdog;
- fornire API locali REST/WebSocket per debug e dashboard in LAN.

Stack consigliato:

- Python 3;
- FastAPI per API locali e diagnostica;
- asyncio per concorrenza;
- paho-mqtt o gmqtt per MQTT;
- OpenCV per elaborazione immagini;
- aiortc per futura evoluzione WebRTC;
- SQLite per log e sessioni locali semplici;
- systemd/NSSM o servizio Windows per esecuzione persistente.

Sottocomponenti interni:

```text
AI Agent
  - Config Manager
  - MQTT Bridge
  - Command Router
  - Rover Adapter
  - Video Ingest
  - Video Relay
  - Telemetry Collector
  - AI Pipeline
  - Safety Manager
  - Local API
  - Logger
```

### 2.4 Rover Controller

Responsabilita':

- controllare motori e attuatori;
- leggere sensori;
- generare telemetria;
- acquisire video;
- accettare comandi dal PC Casa;
- applicare limiti di sicurezza locali;
- fermarsi automaticamente in caso di perdita connessione;
- scansionare reti WiFi disponibili;
- memorizzare piu' profili WiFi;
- fare fallback automatico tra reti note;
- attendere reti conosciute con consumo ridotto quando nessuna e' disponibile;
- ricevere la prima configurazione rete via Bluetooth o USB;
- ricevere configurazioni rete successive anche via WiFi autenticato.

Opzione consigliata:

- Raspberry Pi Zero 2 W o Raspberry Pi 4.

Stack consigliato per Raspberry:

- Python;
- FastAPI o server leggero TCP/WebSocket;
- gpiozero / pigpio per GPIO;
- OpenCV o libcamera per video;
- seriale/I2C/SPI per sensori;
- NetworkManager/nmcli o wpa_supplicant per gestione WiFi;
- BlueZ per setup Bluetooth;
- USB seriale CDC o gadget Ethernet per setup cablato;
- servizio avviato al boot.

Opzione economica:

- ESP32-CAM, piu' limitato per video, AI e affidabilita'.

Interfacce LAN possibili:

- HTTP REST per comandi semplici;
- WebSocket per comandi realtime;
- UDP per controllo a bassa latenza;
- RTSP/MJPEG per video.

Per MVP e' sufficiente:

- endpoint comando `POST /drive`;
- endpoint stop `POST /stop`;
- endpoint stato `GET /status`;
- stream `GET /video.mjpeg`.

### 2.4.1 Network Provisioning

Il rover non puo' assumere di conoscere gia' una rete WiFi. Serve quindi un sottosistema di provisioning locale.

Canali supportati:

- Bluetooth da app mobile o app PC;
- USB seriale o USB gadget Ethernet da app PC;
- WiFi solo dopo che il rover e' gia' connesso a una rete attendibile.

Funzioni:

- scansione SSID visibili;
- inserimento credenziali per reti protette;
- salvataggio di piu' reti note;
- priorita' rete configurabile;
- fallback su reti note in caso di assenza connettivita';
- backoff progressivo delle scansioni quando nessuna rete nota e' visibile;
- modalita' low-power con servizi non essenziali sospesi;
- cancellazione e rotazione credenziali.

Regola di sicurezza: le credenziali WiFi non passano su MQTT e non vengono scritte nei log. Il canale Bluetooth deve usare pairing, mentre USB e' considerato canale locale fisico.

### 2.5 Dashboard Web

Responsabilita':

- controllo e debug da browser;
- visualizzazione stream e telemetria;
- configurazione device;
- log diagnostici;
- base futura per Google Nest Hub e Home Assistant.

Stack possibile:

- frontend leggero con React/Vite oppure pagine FastAPI/Jinja per MVP;
- WebSocket per telemetria live;
- MJPEG/WebRTC player per video.

La dashboard non deve essere il primo client obbligatorio, ma conviene predisporla presto per debug e integrazione domestica.

### 2.6 Home Assistant Bridge

Responsabilita' future:

- pubblicare entita' Home Assistant via MQTT Discovery;
- esporre stato rover, batteria, modalita' e sensori;
- permettere comandi semplici come stop, rientro, patrol;
- integrare automazioni domestiche.

Da prevedere gia' nell'MVP:

- topic MQTT stabili;
- payload JSON coerenti;
- separazione tra comandi manuali realtime e comandi ad alto livello.

## 3. Flussi principali

### 3.1 Guida remota

```text
Mobile App
  -> MQTT rover/{deviceId}/cmd
  -> Cloud Broker
  -> AI Agent
  -> Rover Controller
  -> Driver motori
```

Esempio payload:

```json
{
  "type": "drive",
  "x": 0.4,
  "y": 0.8,
  "speed": 60,
  "seq": 1024,
  "ts": "2026-05-14T10:30:00Z"
}
```

Regole:

- inviare comandi joystick a frequenza controllata, ad esempio 10-20 Hz;
- includere `seq` per scartare comandi vecchi;
- AI Agent e Rover devono fermare i motori se non ricevono comandi entro un timeout configurabile.

### 3.2 Telemetria

```text
Rover Controller
  -> AI Agent
  -> MQTT rover/{deviceId}/telemetry
  -> Mobile App / Dashboard / Home Assistant
```

Esempio payload:

```json
{
  "battery": 82,
  "rssi": -58,
  "speed": 0.32,
  "heading": 142,
  "imu": {
    "pitch": 1.2,
    "roll": -0.7
  },
  "obstacle_cm": 46,
  "mode": "manual"
}
```

### 3.3 Video live

MVP:

```text
Rover Camera
  -> MJPEG locale
  -> AI Agent
  -> HTTP/WebSocket relay o endpoint protetto
  -> Mobile App
```

Evoluzione:

```text
Rover Camera / AI Agent
  -> WebRTC
  -> TURN/STUN o relay cloud
  -> Mobile App / Browser
```

Scelta consigliata:

- MJPEG per prototipo rapido;
- WebRTC quando servono latenza minore, audio bidirezionale e migliore gestione rete.

### 3.4 AI locale

```text
Video Ingest
  -> Frame Sampler
  -> AI Pipeline
  -> Event Detector
  -> MQTT rover/{deviceId}/agent/output
```

Esempi output:

```json
{
  "type": "object_detected",
  "label": "person",
  "confidence": 0.91,
  "bbox": [120, 80, 220, 260]
}
```

## 4. Sicurezza

Requisiti minimi:

- TLS obbligatorio su MQTT e HTTPS;
- credenziali separate per app, agent e rover;
- ACL MQTT per device e topic;
- JWT o token short-lived per API cloud/app;
- device identity stabile;
- rotazione credenziali;
- log dei comandi critici;
- rate limit sui comandi remoti;
- comando `stop` prioritario.

Regole consigliate:

- il rover non si collega direttamente al cloud nella prima fase, passa dall'AI Agent;
- nessuna porta aperta sul router di casa;
- i comandi motore non devono essere eseguiti se il timestamp e' troppo vecchio;
- default state del rover: fermo.

## 5. MVP proposto

### Fase 1 - Simulatore e broker

Obiettivo: validare controllo remoto e messaggistica.

Componenti:

- broker MQTT cloud;
- AI Agent Python;
- rover simulato;
- app Flutter con joystick;
- telemetria fittizia;
- log comandi.

Output atteso:

- da app si inviano comandi;
- AI Agent li riceve;
- rover simulato risponde con stato e telemetria.

### Fase 2 - Rover reale base

Obiettivo: muovere un rover semplice in LAN.

Componenti:

- Raspberry Pi sul rover;
- driver motori;
- endpoint comandi;
- safety timeout;
- telemetria batteria/stato;
- stream MJPEG.

Output atteso:

- guida remota reale;
- stop automatico su perdita connessione;
- video base visibile da app/dashboard.

### Fase 3 - Video e dashboard

Obiettivo: rendere il sistema usabile e diagnosticabile.

Componenti:

- dashboard web;
- video relay piu' robusto;
- storico log locale;
- gestione configurazione device;
- stato connessioni.

### Fase 4 - AI e integrazioni

Obiettivo: aggiungere funzioni evolute.

Componenti:

- object detection;
- eventi AI su MQTT;
- Home Assistant MQTT Discovery;
- comandi alto livello;
- WebRTC;
- audio opzionale.

## 6. Struttura repository suggerita

```text
robocop/
  apps/
    mobile_flutter/
    dashboard_web/
  services/
    ai_agent/
      app/
        main.py
        config.py
        mqtt_bridge.py
        command_router.py
        rover_adapter.py
        telemetry.py
        video.py
        ai_pipeline.py
        safety.py
      tests/
      pyproject.toml
    rover_controller/
      app/
        main.py
        motors.py
        sensors.py
        camera.py
        safety.py
        network_manager.py
        provisioning.py
        credential_store.py
      tests/
      pyproject.toml
    simulator/
      app/
        main.py
        simulated_rover.py
      tests/
  infra/
    mqtt/
      topics.md
      acl.example.conf
    docker/
  docs/
    architecture.md
    protocol.md
    security.md
  feed/
    Progetto_Rover_AI_Remoto_Codex.docx
```

## 7. Contratti API iniziali

### MQTT comandi

Topic:

```text
rover/{deviceId}/cmd
```

Payload:

```json
{
  "type": "drive",
  "x": 0.0,
  "y": 0.0,
  "speed": 0,
  "seq": 1,
  "ts": "2026-05-14T10:30:00Z"
}
```

Tipi comando:

- `drive`;
- `stop`;
- `set_mode`;
- `camera_tilt`;
- `ping`.

### MQTT stato

Topic:

```text
rover/{deviceId}/status
```

Payload:

```json
{
  "online": true,
  "mode": "manual",
  "agent_connected": true,
  "rover_connected": true,
  "video_enabled": true,
  "last_error": null
}
```

### API locali AI Agent

Endpoint MVP:

```text
GET /health
GET /status
GET /telemetry
GET /video.mjpeg
POST /cmd
POST /stop
WS  /ws/telemetry
```

### API locali Rover Controller - reti

Endpoint MVP:

```text
GET    /networks/scan
GET    /networks/known
POST   /networks
DELETE /networks/{ssid}
POST   /networks/connect
```

Esempio aggiunta rete:

```json
{
  "ssid": "Casa",
  "security": "wpa2-psk",
  "password": "secret",
  "priority": 10
}
```

## 8. Decisioni tecniche consigliate

- usare MQTT Cloud per il controllo e la telemetria;
- non usare MQTT per lo streaming video continuo;
- partire con MJPEG per ridurre complessita';
- mettere il fail-safe sia nell'AI Agent sia nel Rover Controller;
- trattare la connettivita' WiFi come componente core del rover, non come configurazione manuale una tantum;
- usare payload JSON versionabili;
- inserire sempre `deviceId`, `seq` e timestamp nei messaggi importanti;
- tenere Home Assistant come integrazione MQTT futura, non come dipendenza dell'MVP;
- progettare il rover come componente sostituibile: simulatore, Raspberry reale, ESP32.

## 9. Rischi principali

- latenza e jitter nella guida remota;
- affidabilita' dello streaming video su reti mobili;
- sicurezza dei comandi motore;
- consumo batteria del rover;
- qualita' WiFi in casa;
- complessita' WebRTC se introdotto troppo presto;
- differenze tra simulatore e hardware reale.

Mitigazioni:

- safety timeout locale;
- comando stop prioritario;
- telemetria di connessione;
- limiti di velocita' configurabili;
- log dei comandi;
- fase iniziale con simulatore;
- video MJPEG prima di WebRTC.

## 10. Prima milestone implementativa

La prima milestone concreta dovrebbe produrre:

- `ai_agent` Python che si collega al broker MQTT;
- `simulator` che riceve comandi e pubblica telemetria;
- topic MQTT documentati;
- app o dashboard minimale con joystick;
- log locale dei comandi;
- test unitari su parsing comandi e safety timeout.

Questa milestone valida l'architettura senza dipendere subito dall'hardware.
