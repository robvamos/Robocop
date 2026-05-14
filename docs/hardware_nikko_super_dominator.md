# Nikko Super Dominator

La piattaforma fisica target e' una Nikko Super Dominator. Per la progettazione software viene considerata equivalente alla famiglia Nikko Super Dictator/Super Dominator a 27 MHz, con telecomando proporzionale a 2 canali.

## Controlli originali da replicare nell'app

Il telecomando originale include:

- interruttore marcia/arresto;
- spia alimentazione;
- antenna;
- leva velocita;
- cursore regolazione velocita;
- leva direzione;
- cursore regolazione direzione;
- frequenza 27 MHz con quarzi intercambiabili.

La UI Android deve quindi offrire una modalita' `Telecomando Nikko` che non sia solo joystick generico, ma replichi questi controlli:

- leva sinistra per velocita;
- leva destra per direzione;
- trim velocita;
- trim direzione;
- stato ON/OFF;
- indicazione frequenza/quartz solo come riferimento storico;
- controlli aggiuntivi moderni separati: video, camera, WiFi, WebRTC, TURN, telemetria.

## Implicazioni hardware

La macchina originale usa:

- alimentazione veicolo NiCd 7.2 V nella configurazione storica;
- trasmissione 4x4;
- due motori;
- controllo di velocita elettronico con marcia avanti e retromarcia;
- direzione proporzionale.

Nel retrofit con Raspberry/ESP32 o altro chip scelto:

- preservare la logica di guida proporzionale;
- mappare la leva velocita su `drive.y`;
- mappare la leva direzione su `drive.x`;
- applicare trim software prima di inviare il comando motori;
- mantenere stop fail-safe prioritario;
- evitare che i nuovi controlli camera/rete interferiscano con i controlli guida originali.

## Fonti

- NikkoMania, famiglia Super Dictator/Super Dominator e compatibilita telecomandi: https://www.nikkomania.com/newsuperdictator
- Manuale Nikko Super Dictator, schema trasmettitore: https://www.rcscrapyard.net/manuals/nikko/nikko-super-dictator-manual.htm
