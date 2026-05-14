# Cloudflare Workers signaling

Profilo alternativo gratuito per fare solo signaling WebRTC.

## Scopo

Il Worker non deve trasportare audio/video. Deve solo scambiare messaggi:

- `join`
- `offer`
- `answer`
- `ice-candidate`
- `leave`

Il media deve viaggiare direttamente tra rover e app via WebRTC.

## Quando usarlo

- vuoi evitare una VM;
- vuoi un endpoint edge gratuito;
- il backend deve fare solo coordinamento leggero;
- il Control Agent su Cloud Run resta spento o gestisce solo API.

## Quando non usarlo

- devi eseguire un normale processo Node.js persistente;
- vuoi ospitare TURN;
- devi fare relay di stream audio/video.

## Nota implementativa

Per stanze WebSocket multi-peer usare Durable Objects. Per signaling asincrono minimale si puo' usare anche un modello mailbox con KV/D1, ma WebSocket e Durable Objects sono piu' naturali per offer/answer/ICE in tempo reale.
