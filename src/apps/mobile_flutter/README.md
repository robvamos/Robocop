# Mobile Flutter App

Applicazione mobile per guida remota, telemetria e video live.

## Stack

- Dart
- Flutter
- `mqtt_client` per MQTT over TLS
- `flutter_secure_storage` per credenziali
- player MJPEG iniziale
- plugin WebRTC in fase evolutiva

## Sezioni previste

- autenticazione e scelta device;
- joystick virtuale;
- stato connessione;
- telemetria live;
- video live;
- pulsante stop prioritario.

## Interfaccia abbozzata

La prima UI include:

- riquadro video WebRTC/MJPEG;
- stato rover, cloud, batteria e percorso media diretto/relay;
- pulsante stop prioritario;
- toggle microfono e luci;
- selezione modalita' manuale, patrol e tracking;
- joystick guida con slider velocita';
- controlli tilt camera;
- riquadri telemetria;
- pannello rete con WiFi scan, setup Bluetooth e setup USB.
- modalita telecomando Nikko Super Dominator con leva velocita, leva direzione, trim velocita, trim direzione, ON/OFF, antenna/quartz.

## Template stile

Gli stili sono definiti in `lib/templates/app_templates.dart` e selezionabili dall'utente dal pannello impostazioni.

Template iniziali:

- Mission Control
- Tactical Amber
- Light Ops
- Rescue Field
