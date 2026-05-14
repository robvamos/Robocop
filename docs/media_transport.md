# Trasporto audio/video

Obiettivo: evitare che il traffico audio/video passi dal cloud quando non e' necessario. Il cloud deve servire soprattutto per autenticazione, discovery e signaling; il media deve andare diretto tra rover e app mobile.

## Scelta consigliata

Usare WebRTC end-to-end tra rover e app:

```text
Mobile App
    |  signaling: offer/answer/ICE
    v
Control Agent / Signaling Server
    ^
    |  signaling: offer/answer/ICE
Rover / Home Connector

Mobile App <==== audio/video WebRTC diretto ====> Rover
```

Il signaling puo' passare da Cloud Run, Cloudflare Workers, Firebase, Supabase o dal `control_agent`. Il traffico media non deve passare dal signaling server nel caso normale.

## Flusso

1. App mobile apre una sessione di controllo.
2. Rover o home connector si registra come peer disponibile.
3. Control Agent crea una stanza di signaling.
4. App e rover scambiano SDP offer/answer.
5. App e rover scambiano ICE candidates.
6. ICE prova prima collegamenti diretti tramite host/server-reflexive candidates.
7. Se la connessione diretta riesce, audio/video fluiscono peer-to-peer.
8. Se fallisce, si usa TURN come fallback consapevole.

## STUN e TURN

STUN:

- aiuta i peer a scoprire indirizzo pubblico e restrizioni NAT;
- non trasporta il media;
- costa poco o nulla;
- e' adatto come default.

TURN:

- rilancia tutto il traffico audio/video;
- aumenta affidabilita' quando ci sono NAT simmetrici, firewall aziendali o reti mobili problematiche;
- puo' generare costi di banda;
- va trattato come fallback, non come percorso principale.

## Impatto sui costi

Percorso desiderato:

```text
Cloud: signaling leggero
Media: diretto rover <-> app
Costo banda cloud audio/video: zero
```

Percorso fallback:

```text
Cloud/VPS: TURN
Media: rover -> TURN -> app
Costo banda cloud audio/video: proporzionale all'uso
```

Decisione: il progetto deve misurare e loggare il tipo di candidate pair selezionato da WebRTC, distinguendo:

- `host`: diretto LAN;
- `srflx`: diretto via NAT traversal/STUN;
- `relay`: traffico via TURN.

## Implicazioni per il rover

Il rover controller o un home connector deve poter produrre uno stream WebRTC. Possibili implementazioni:

- Raspberry Pi con GStreamer/libcamera e WebRTC;
- processo media dedicato sul rover;
- home connector che riceve MJPEG/RTSP dal rover e lo converte in WebRTC;
- fallback MJPEG solo per debug o reti locali.

## Implicazioni per app mobile

La app Flutter deve includere:

- peer connection WebRTC;
- gestione ICE server;
- signaling client;
- riconnessione;
- indicatore percorso media: diretto o relay;
- fallback video disabilitabile per contenere costi.

## Fonti

- WebRTC peer connections e signaling: https://webrtc.org/getting-started/peer-connections
- MDN WebRTC signaling: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Signaling_and_video_calling
- MDN WebRTC protocols, STUN e TURN: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Protocols
