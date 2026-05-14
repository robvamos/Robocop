# Opzioni deploy gratuite o low-cost

Il `control_agent` Node.js deve poter girare sia su PC domestico sia su cloud economico. La scelta consigliata e' una doppia implementazione di deploy:

- Cloud Run come profilo principale serverless;
- Compute Engine e2-micro come profilo always-on.

## Scelta consigliata: Cloud Run + Node.js

Cloud Run e' il default consigliato per il progetto.

Motivi:

- esegue container Node.js senza gestire server;
- puo' scalare a zero quando non riceve traffico;
- ha un free tier mensile;
- consente di partire gratis o quasi gratis con poco traffico;
- rende semplice scalare quando app mobile, dashboard o eventi aumentano;
- si adatta bene al `control_agent` TypeScript gia' containerizzabile.

Uso ideale:

- API HTTP del control agent;
- webhook;
- dashboard leggera;
- broker bridge leggero;
- stato/comandi via Firestore o Cloud Storage;
- wake-up request quando serve riattivare il servizio;
- MQTT cloud esterno per canale realtime persistente.

Attenzione importante:

- Cloud Run scala a zero solo quando non ci sono richieste attive;
- se il design richiede una connessione WebSocket sempre aperta dal PC di casa verso il cloud, la connessione tiene viva l'istanza;
- per mantenere un listener sempre attivo serve `min-instances=1`, che puo' generare costi;
- per restare nel profilo gratuito conviene usare polling leggero, MQTT gestito o richieste wake-up, non una connessione serverless sempre aperta.

Architettura consigliata:

```text
Mobile App / Dashboard
        |
        | HTTPS / WebSocket breve / MQTT
        v
Cloud Run - control_agent
        |
        | Firestore / Cloud Storage / MQTT Cloud
        v
Home Connector su PC o Rover
        |
        | LAN
        v
Rover Controller
```

In questa variante il `control_agent` cloud gestisce API, stato e routing. Il componente in casa mantiene connessioni outbound o polling verso cloud/MQTT, quindi non serve IP pubblico.

## Alternativa always-on: Compute Engine e2-micro

Compute Engine e2-micro e' adatto quando si vuole una piccola macchina Linux sempre accesa.

Motivi:

- piu' semplice per processi persistenti;
- adatta a WebSocket sempre aperti, polling continuo o bot;
- puo' ospitare Node.js, PM2, Nginx e piccoli servizi;
- rientra nell'Always Free solo entro limiti e regioni supportate.

Uso ideale:

- connessione persistente dal PC di casa;
- WebSocket sempre attivo;
- relay leggero;
- MQTT broker leggero per sviluppo;
- prototipo con accesso SSH e controllo completo.

Limiti:

- risorse contenute, circa 1 GB RAM;
- bisogna gestire patch, firewall, servizio, log e backup;
- Always Free e' vincolato a regioni e limiti mensili;
- non e' la scelta migliore se il traffico e' molto discontinuo.

Architettura:

```text
Mobile App / Dashboard
        |
        | HTTPS / WebSocket / MQTT
        v
Compute Engine e2-micro
        |
        | Node.js control_agent + PM2/Nginx
        v
Home Connector / Rover
```

## Alternativa semplice: App Engine Standard

App Engine Standard resta una possibilita' per Node.js con free tier e deploy semplice.

Motivi per non sceglierlo come default:

- meno flessibile di Cloud Run;
- runtime piu' vincolato;
- meno naturale se il progetto usa container;
- Cloud Run copre meglio il caso Node.js portabile PC/cloud.

## Doppia implementazione prevista

Il repository prevede due profili:

```text
infra/cloud-run/
  Dockerfile
  README.md

infra/compute-engine/
  README.md
  robocop-control-agent.service
```

La stessa applicazione `src/services/control_agent` deve funzionare in entrambi i profili usando solo variabili ambiente.

Variabili minime:

```text
PORT=8080
DEVICE_ID=rover-dev-001
MQTT_URL=mqtts://...
MQTT_USERNAME=...
MQTT_PASSWORD=...
ROVER_BASE_URL=http://...
COMMAND_TIMEOUT_MS=500
```

## Decisione progettuale

Per MVP:

- usare Cloud Run per API e dashboard remota;
- usare MQTT cloud per comandi/telemetria realtime;
- usare Firestore o Cloud Storage solo se serve stato persistente semplice;
- mantenere il PC/rover dietro NAT con connessioni outbound.

Per modalita' always-on o sviluppo tecnico:

- usare Compute Engine e2-micro;
- eseguire `control_agent` con PM2 o systemd;
- opzionalmente mettere Nginx davanti.

## Fonti ufficiali

- Cloud Run free tier e scale-to-zero: https://cloud.google.com/run e https://cloud.google.com/run/docs/overview/what-is-cloud-run
- Cloud Run pricing/free tier: https://cloud.google.com/run/pricing
- Google Cloud Free Tier: https://cloud.google.com/free/docs/gcp-free-tier
- Compute Engine e2-micro Always Free: https://cloud.google.com/free/docs/compute-getting-started
- App Engine Standard Node.js: https://cloud.google.com/appengine/docs/nodejs
