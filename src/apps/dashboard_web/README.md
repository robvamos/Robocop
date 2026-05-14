# Dashboard Web

Dashboard per debug, controllo da browser e base futura per Nest Hub/Home Assistant.

## Stack

- TypeScript
- React
- Vite
- MQTT over WebSocket o WebSocket verso AI Agent
- player MJPEG integrato nei sorgenti via tag `img`
- player WebRTC integrato nei sorgenti via `RTCPeerConnection` e `HTMLVideoElement`

## Sezioni previste

- stato connessioni;
- video live;
- telemetria;
- log eventi;
- comandi manuali;
- stop prioritario.

## Note media

La dashboard non richiede plugin browser dedicati per il video:

- MJPEG: rendering diretto tramite `img`
- WebRTC: rendering diretto tramite `RTCPeerConnection`, signaling WebSocket e `video`

Il peer remoto resta comunque necessario per pubblicare il media.
