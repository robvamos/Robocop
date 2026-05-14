# TURN server

TURN e' un componente opzionale e separato dal Control Agent. Serve solo quando WebRTC non riesce a stabilire un percorso diretto tra rover e app mobile.

## Ruolo architetturale

Percorso normale:

```text
Rover <==== audio/video WebRTC diretto ====> App mobile

Cloud:
  - autenticazione
  - signaling SDP/ICE
  - comandi e telemetria
```

Percorso fallback:

```text
Rover <==== audio/video ====> TURN <==== audio/video ====> App mobile

Cloud:
  - signaling
  - relay media tramite TURN
```

Decisione: TURN non deve essere nello stesso processo del `control_agent`. Deve essere un servizio isolato, misurabile e spegnibile.

## Perche' isolarlo

- Il Control Agent gestisce traffico leggero: API, MQTT, signaling, stato.
- TURN gestisce traffico pesante: audio/video relayed.
- La banda TURN cresce con durata, bitrate e numero di sessioni.
- Un bug o abuso su TURN puo' generare costi molto piu' velocemente di API o MQTT.
- TURN richiede porte UDP/TCP dedicate e hardening specifico.

## Implementazione consigliata

Software:

- coturn.

Funzioni richieste:

- STUN su `3478/udp`;
- TURN su `3478/udp`;
- TURN/TLS su `5349/tcp` se serve attraversare reti restrittive;
- credenziali temporanee via TURN REST API / shared secret;
- realm dedicato;
- quota e rate limit;
- logging e metriche.

## Dove ospitarlo

### Opzione A - Oracle Cloud Always Free

Buona candidata per TURN fallback perche' Oracle dichiara una soglia Always Free di outbound data transfer molto generosa.

Pro:

- VM always-on;
- possibile eseguire coturn;
- outbound free tier alto;
- adatta a sperimentare fallback media.

Contro:

- disponibilita' risorse Always Free non sempre garantita;
- istanze idle possono essere reclamate;
- richiede gestione Linux, firewall e aggiornamenti;
- bisogna monitorare comunque la banda.

Uso consigliato:

- TURN fallback per test e piccolo uso personale;
- non come relay media primario permanente.

### Opzione B - Compute Engine e2-micro

Possibile, ma meno ideale se il TURN inizia a trasportare molto video.

Pro:

- stessa piattaforma GCP del resto;
- VM always-on semplice;
- utile per test controllati.

Contro:

- risorse limitate;
- free tier egress molto piu' basso;
- traffico video puo' uscire rapidamente dai limiti gratuiti.

Uso consigliato:

- STUN/TURN di test;
- non per sessioni video frequenti.

### Opzione C - VPS economica

Pro:

- costi prevedibili;
- banda spesso inclusa in modo chiaro;
- controllo completo del sistema.

Contro:

- non costo zero;
- richiede manutenzione.

Uso consigliato:

- quando il progetto passa da prototipo a uso reale.

### Opzione D - servizio TURN gestito

Pro:

- setup rapido;
- affidabilita' migliore;
- metriche e regioni multiple.

Contro:

- puo' diventare costoso con video;
- vendor lock-in.

Uso consigliato:

- test iniziale;
- produzione se il costo e' accettabile.

## Stima banda

Formula approssimata:

```text
GB per ora = Mbps * 3600 / 8 / 1000
```

Esempi per una singola direzione:

```text
0.5 Mbps  -> ~0.225 GB/ora
1.0 Mbps  -> ~0.45 GB/ora
2.0 Mbps  -> ~0.90 GB/ora
4.0 Mbps  -> ~1.80 GB/ora
```

Per TURN bisogna ragionare sulle uscite dal server:

- video rover -> app: egress server verso app;
- audio app -> rover: egress server verso rover;
- se il video e' bidirezionale, sommare entrambe le direzioni;
- il traffico totale sulla NIC del server e' circa ingresso + uscita, quindi circa il doppio del media relayed.

Esempio telepresenza:

```text
Video rover -> app: 1.5 Mbps
Audio rover -> app: 64 Kbps
Audio app -> rover: 64 Kbps
Totale egress TURN: ~1.63 Mbps
Consumo egress: ~0.73 GB/ora
```

Se 10 sessioni durano 1 ora al giorno:

```text
0.73 GB * 10 * 30 = ~219 GB/mese
```

Questo spiega perche' TURN va tenuto come fallback e non percorso standard.

## Policy di utilizzo

- Usare sempre STUN prima di TURN.
- Abilitare TURN solo se ICE fallisce o se la rete e' nota come restrittiva.
- Mostrare nell'app se la sessione sta usando `direct` o `relay`.
- Limitare bitrate quando `relay=true`.
- Impostare timeout sessione.
- Usare credenziali temporanee.
- Non esporre TURN anonimo.
- Monitorare egress per giorno e mese.

## Configurazione WebRTC

Esempio lato client:

```json
{
  "iceServers": [
    { "urls": ["stun:stun.example.org:3478"] },
    {
      "urls": [
        "turn:turn.example.org:3478?transport=udp",
        "turns:turn.example.org:5349?transport=tcp"
      ],
      "username": "temporary-user",
      "credential": "temporary-password"
    }
  ],
  "iceTransportPolicy": "all"
}
```

Usare `iceTransportPolicy: "relay"` solo per debug o per reti dove si vuole forzare TURN.

## Deployment nel repository

File previsti:

```text
infra/turn/
  README.md
  docker-compose.yml
  turnserver.conf.example
```

Il Control Agent non contiene coturn. Deve solo:

- generare credenziali temporanee TURN;
- consegnarle all'app/rover;
- registrare se la sessione ha usato candidate `relay`.

## Fonti

- coturn: https://github.com/coturn/coturn
- coturn TURN REST API e WebRTC notes: https://github.com/coturn/coturn/wiki/turnserver
- WebRTC peer connection e signaling: https://webrtc.org/getting-started/peer-connections
- MDN WebRTC protocols, STUN e TURN: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Protocols
- Oracle Always Free outbound data transfer: https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm
