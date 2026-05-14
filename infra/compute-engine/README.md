# Compute Engine e2-micro deployment

Profilo alternativo per eseguire il `control_agent` su una VM Linux sempre accesa.

## Quando usarlo

- serve una connessione persistente;
- si vuole accesso SSH;
- si vuole eseguire Nginx, PM2, piccoli worker o un broker MQTT leggero;
- si accetta di gestire sistema operativo e aggiornamenti.

## Regione

Per rientrare nell'Always Free di Compute Engine, usare una delle regioni supportate ufficialmente, ad esempio:

- `us-west1`
- `us-central1`
- `us-east1`

Verificare sempre i limiti correnti del free tier prima del deploy.

## Setup indicativo

```bash
sudo apt update
sudo apt install -y nodejs npm nginx

cd /opt/robocop/src/services/control_agent
npm ci
npm run build

sudo cp /opt/robocop/infra/compute-engine/robocop-control-agent.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now robocop-control-agent
```

## Variabili ambiente

Configurare il servizio systemd o un file environment protetto con:

```text
DEVICE_ID=rover-dev-001
PORT=8080
MQTT_URL=mqtts://...
MQTT_USERNAME=...
MQTT_PASSWORD=...
ROVER_BASE_URL=http://...
COMMAND_TIMEOUT_MS=500
```

## Note operative

- usare firewall GCP e UFW per esporre solo porte necessarie;
- mettere Nginx davanti se serve TLS o reverse proxy;
- non salvare credenziali nel repository;
- monitorare disco, RAM e log per restare nei limiti della VM.
