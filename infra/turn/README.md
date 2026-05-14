# TURN deployment

Servizio isolato per fallback WebRTC relay. Non deve essere nel processo `control_agent`.

## Stack

- coturn
- Docker o pacchetto OS
- firewall con porte UDP/TCP esplicite
- metriche banda

## Porte

Minimo:

```text
3478/udp  STUN/TURN
3478/tcp  TURN TCP fallback
5349/tcp  TURN TLS fallback
49160-49200/udp relay ports MVP
```

In produzione ampliare il range relay in base al numero di sessioni contemporanee.

## Avvio locale

```bash
docker compose -f infra/turn/docker-compose.yml up -d
```

## Hosting consigliato

Ordine per prototipo:

1. Oracle Cloud Always Free, se disponibile nella tenancy.
2. Compute Engine e2-micro solo per test limitati.
3. VPS economica con banda inclusa.
4. Servizio TURN gestito se si preferisce pagare affidabilita'.

## Regole

- disabilitare accesso anonimo;
- usare shared secret e credenziali temporanee;
- monitorare egress;
- impostare realm dedicato;
- mantenere TURN come fallback;
- ridurre bitrate quando WebRTC seleziona candidate `relay`.
