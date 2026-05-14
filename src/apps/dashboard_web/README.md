# Dashboard Web / Debug Shell

Dashboard di debug predefinita del progetto. Mostra in un'unica pagina:

- una mobile app simulata a sinistra che invia comandi al rover
- l'output grafico separato dell'emulatore rover a destra

Serve per verificare rapidamente il wiring end-to-end tra controller ed emulatore.

## Stack

- TypeScript
- React
- Vite
- MQTT over WebSocket o WebSocket verso AI Agent
- shell di debug combinata per mobile app + rover emulator
- integrazione con emulatore HTTP su `127.0.0.1:8010`
- integrazione con rover UI separata su `127.0.0.1:8091`

## Sezioni previste

- stato connessioni;
- mobile app debug;
- rover output embedded via iframe;
- telemetria wiring;
- log eventi;
- comandi manuali;
- stop prioritario;
- bottone `Info wiring` con architettura grafica dei blocchi e ambiente di esecuzione.

## Flusso default

1. avviare l'emulatore chip
2. avviare la UI rover separata
3. aprire questa dashboard
4. mandare comandi dalla mobile app simulata e osservare il rover a destra
