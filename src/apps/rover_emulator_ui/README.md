# Rover Emulator UI

Interfaccia grafica separata dal processo di emulazione. Legge lo stato del chip emulator via HTTP e mostra un rover stilizzato, la telecamera e la rete.

## Avvio rapido

1. avviare l'emulatore FastAPI in `src/services/simulator`
2. servire questa cartella con un semplice server statico, ad esempio:

```bash
python serve.py
```

3. aprire `http://127.0.0.1:8091`

L'emulatore HTTP di riferimento espone per default `http://127.0.0.1:8010`.

## Contratto

La UI non condivide logica con l'emulatore. Consuma solo:

- `GET /status`
- `GET /network/interfaces`
- `GET /camera/status`
