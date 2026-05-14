# Cloud Run deployment

Profilo consigliato per il `control_agent` Node.js quando si vuole partire con costi minimi e scalare in seguito.

## Caratteristiche

- container Node.js;
- HTTP API su porta `8080`;
- configurazione via variabili ambiente;
- `min-instances=0` per restare nel modello scale-to-zero;
- `max-instances` basso per controllo costi.

## Build locale

```powershell
docker build -f infra/cloud-run/Dockerfile -t robocop-control-agent .
```

## Deploy indicativo

```powershell
gcloud run deploy robocop-control-agent `
  --source src/services/control_agent `
  --region europe-west8 `
  --allow-unauthenticated `
  --set-env-vars DEVICE_ID=rover-dev-001 `
  --set-env-vars MQTT_URL=mqtts://example `
  --set-env-vars ROVER_BASE_URL=http://home-connector-or-rover `
  --min-instances 0 `
  --max-instances 2
```

Nota: per dati sensibili usare Secret Manager, non `--set-env-vars` in chiaro.

## Quando usarlo

- traffico basso o discontinuo;
- API e dashboard leggere;
- stato/comandi su MQTT cloud, Firestore o Cloud Storage;
- nessun processo che deve restare vivo 24/7.

## Quando non basta

- WebSocket sempre aperto da casa al cloud;
- loop di polling continuo dentro Cloud Run senza richieste;
- broker MQTT self-hosted sempre acceso.

In questi casi valutare Compute Engine e2-micro oppure `min-instances=1` sapendo che puo' generare costi.
