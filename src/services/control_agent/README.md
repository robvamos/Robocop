# Control Agent

Servizio principale che gira sul PC vicino al rover o, senza cambiare architettura, su un cloud economico.

## Obiettivo

Tenere separata la logica di controllo, broker, sessioni, telemetria e relay leggero dalla parte hardware/AI pesante. Questo rende il componente portabile tra:

- PC domestico Windows/Linux;
- mini server locale;
- VPS economica;
- container Docker;
- servizi serverless/container low-cost quando la parte realtime lo consente.

## Stack

- Node.js 20+
- TypeScript
- Fastify per HTTP API
- ws per WebSocket
- mqtt per broker MQTT
- undici/fetch per chiamate HTTP al rover
- pino per logging JSON
- zod per validazione payload

## Responsabilita'

- connettersi al Cloud Broker MQTT;
- ricevere comandi da app/dashboard;
- validare e normalizzare comandi;
- inoltrare comandi al rover controller;
- pubblicare telemetria e stato;
- gestire WebSocket realtime per dashboard/app;
- gestire signaling WebRTC per scambio SDP/ICE senza trasportare media;
- applicare safety timeout e stop prioritario;
- fare da relay leggero solo per fallback/debug, non come percorso media normale;
- essere eseguibile sia su PC sia in cloud a basso costo.

## Non responsabilita'

- controllo GPIO diretto;
- gestione WiFi del rover;
- inferenza AI pesante con OpenCV;
- accesso diretto a camera hardware.

Queste parti restano nel `rover_controller` o in un microservizio AI opzionale.

## Signaling WebRTC

Endpoint:

```text
WS /ws/signaling
```

Il Control Agent inoltra solo messaggi di signaling:

- `join`
- `offer`
- `answer`
- `ice-candidate`
- `leave`

Dopo la negoziazione, audio e video devono viaggiare direttamente tra rover e app via WebRTC quando ICE trova una rotta peer-to-peer. Un server TURN va usato solo come fallback quando NAT/firewall impediscono la connessione diretta.
