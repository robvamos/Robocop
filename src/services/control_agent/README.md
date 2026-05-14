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
- applicare safety timeout e stop prioritario;
- fare da relay leggero per stream MJPEG o handoff WebRTC;
- essere eseguibile sia su PC sia in cloud a basso costo.

## Non responsabilita'

- controllo GPIO diretto;
- gestione WiFi del rover;
- inferenza AI pesante con OpenCV;
- accesso diretto a camera hardware.

Queste parti restano nel `rover_controller` o in un microservizio AI opzionale.
