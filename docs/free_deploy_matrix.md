# Matrice deploy a costo zero

Questa matrice valuta opzioni gratuite o quasi gratuite per backend, signaling e dashboard. Il principio resta: usare il cloud per traffico leggero, non per rilanciare audio/video.

## Classifica consigliata

### 1. Cloud Run

Ruolo:

- Control Agent containerizzato;
- API;
- signaling WebRTC leggero;
- dashboard backend;
- webhook.

Pro:

- scale-to-zero;
- free tier mensile;
- container portabile;
- ottimo per Node.js.

Contro:

- una connessione WebSocket sempre aperta puo' tenere viva l'istanza;
- non ideale per worker continuo senza traffico;
- TURN su Cloud Run non e' la scelta naturale.

Verdetto: default per MVP cloud.

### 2. Cloudflare Workers / Pages

Ruolo:

- signaling leggero edge;
- dashboard statica;
- API piccole;
- WebSocket signaling con Durable Objects se serve coordinare stanze.

Pro:

- free plan con limiti alti per richieste leggere;
- edge globale;
- ottimo per signaling e static hosting;
- non serve gestire server.

Contro:

- non adatto a eseguire un normale processo Node.js persistente;
- Durable Objects e limiti vanno progettati con attenzione;
- non deve trasportare media audio/video.

Verdetto: ottima alternativa gratuita per signaling-only e dashboard.

### 3. Firebase / Firestore Spark

Ruolo:

- stato sessione;
- mailbox signaling offer/answer/ICE;
- auth;
- hosting dashboard.

Pro:

- Firestore ha quota gratuita giornaliera;
- ottimo per prototipi mobile;
- integrazione naturale con app Flutter.

Contro:

- signaling via documenti e listener e' meno diretto di WebSocket;
- attenzione a letture/scritture generate da ICE candidates;
- non adatto a media relay.

Verdetto: buono se la app mobile Flutter usa gia' Firebase.

### 4. Supabase Free

Ruolo:

- autenticazione;
- database stato;
- realtime signaling leggero;
- storage piccolo.

Pro:

- piano free utile per prototipi;
- Postgres comodo;
- Realtime puo' funzionare come bus di signaling.

Contro:

- progetti free possono essere pausati dopo inattivita';
- Edge Functions hanno limiti di durata;
- non adatto a media relay.

Verdetto: buono per prototipo con Postgres e realtime, meno ideale per always-on.

### 5. Oracle Cloud Always Free

Ruolo:

- VM always-on alternativa;
- control agent persistente;
- eventuale TURN/coturn di fallback;
- Nginx/PM2.

Pro:

- risorse Always Free piu' generose di molte VM gratuite;
- possibile eseguire servizi persistenti;
- utile per TURN di fallback, sapendo che il media consuma banda.

Contro:

- disponibilita' risorse non sempre garantita;
- le istanze idle possono essere reclamate;
- piu' operativita' sistemistica.

Verdetto: interessante per sperimentare un nodo always-on o TURN fallback.

### 6. GitHub Pages / Cloudflare Pages / Netlify / Vercel

Ruolo:

- dashboard statica;
- documentazione;
- frontend web.

Pro:

- ottimi per asset statici;
- deploy semplice;
- costo zero per prototipi.

Contro:

- non sostituiscono un backend realtime completo;
- Vercel Functions non sono adatte come WebSocket server;
- attenzione a limiti di piano e repository privati.

Verdetto: usare per dashboard statica, non per media o controllo persistente.

## Architettura gratuita consigliata

Profilo A - massimo risparmio:

```text
Dashboard statica: Cloudflare Pages o GitHub Pages
Signaling: Cloudflare Worker o Cloud Run scale-to-zero
Stato: Firestore free quota o Supabase free
Controllo: MQTT cloud free/dev tier
Media: WebRTC diretto rover <-> app
TURN: assente o manuale solo per test
```

Profilo B - maggiore affidabilita':

```text
Control Agent: Cloud Run
Signaling: Control Agent /ws/signaling
Stato: Firestore
Media: WebRTC diretto
TURN fallback: e2-micro/OCI/coturn o servizio TURN esterno
```

Profilo C - always-on gratuito/low-cost:

```text
VM: Compute Engine e2-micro o Oracle Always Free
Processi: Node.js + PM2/systemd + Nginx
Signaling: WebSocket persistente
Media: WebRTC diretto
TURN fallback: coturn sulla stessa VM solo se banda e limiti lo consentono
```

## Decisione

Implementare nel progetto:

- `control_agent` con `/ws/signaling`;
- Cloud Run come deploy principale;
- Cloudflare Worker come deploy alternativo signaling-only;
- Firestore/Supabase come opzioni di stato/signaling asincrono;
- TURN come fallback opzionale, non come percorso standard.

## Fonti

- Cloudflare Workers pricing/limits: https://developers.cloudflare.com/workers/platform/pricing/ e https://developers.cloudflare.com/workers/platform/limits/
- Firebase Firestore free quota: https://firebase.google.com/docs/firestore/pricing
- Supabase pricing/free plan: https://supabase.com/pricing
- Oracle Always Free: https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm
- GitHub Pages limits: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- Vercel Hobby and limits: https://vercel.com/docs/plans/hobby e https://vercel.com/docs/limits/overview
- Netlify pricing: https://www.netlify.com/pricing/
