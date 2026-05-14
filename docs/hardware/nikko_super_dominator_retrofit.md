# Nikko Super Dominator retrofit

## Obiettivo

Montare una scheda moderna sulla Nikko Super Dominator mantenendo il comportamento del telecomando originale:

- motore trazione avanti/indietro con intensita progressiva;
- sterzo destra/sinistra con intensita progressiva;
- stop fail-safe;
- camera a bordo;
- WiFi/Bluetooth per controllo e provisioning.

## Scelta scheda

### Opzione base consigliata: ESP32-S3-CAM / ESP32-S3 con camera

Motivi:

- costo basso;
- WiFi 2.4 GHz integrato;
- Bluetooth LE integrato;
- interfaccia camera supportata dall'ESP32-S3;
- PWM hardware per motore e sterzo;
- consumo contenuto;
- sufficiente per controllo base + MJPEG.

Limiti:

- WebRTC completo e' difficile su microcontrollore;
- AI locale molto limitata;
- video consigliato: MJPEG o frame JPEG periodici;
- TLS e streaming vanno tenuti leggeri.

### Opzione evolutiva: Raspberry Pi Zero 2 W

Motivi:

- Linux;
- camera CSI;
- WiFi/Bluetooth;
- WebRTC piu' realistico;
- migliore integrazione con Python/OpenCV.

Limiti:

- costo e consumo superiori;
- boot piu' lento;
- richiede shutdown/power management migliori.

Decisione per MVP hardware: partire con ESP32-S3-CAM se l'obiettivo e' costo/prestazioni e controllo base. Tenere Raspberry Pi Zero 2 W come upgrade per WebRTC robusto e AI locale.

Fonti:

- Raspberry Pi Zero 2 W: https://www.raspberrypi.com/products/raspberry-pi-zero-2-w
- ESP32-S3: https://www.espressif.com/en/products/socs/esp32-s3

## Ipotesi elettrica auto

Dati forniti:

- batteria auto: 9.6 V;
- motore trazione probabilmente a 2 fili;
- sterzo probabilmente a 2 fili;
- controllo richiesto: verso + potenza progressiva.

Interpretazione:

- trazione = motore DC brushed bidirezionale;
- sterzo = motore DC brushed bidirezionale o attuatore con ritorno meccanico;
- servono due ponti-H separati, uno per trazione e uno per sterzo;
- i GPIO della scheda non devono mai pilotare direttamente motori.

## Driver motori

### Requisito minimo

Usare due driver H-bridge:

- H-bridge A: motore trazione;
- H-bridge B: motore sterzo.

Ogni H-bridge deve supportare:

- tensione motore almeno 9.6 V nominali, meglio 12 V o piu';
- corrente continua superiore alla corrente reale del motore;
- picco superiore alla corrente di stallo;
- PWM;
- protezione termica/sovracorrente.

### Nota corrente

Prima di scegliere il driver definitivo misurare:

- corrente a vuoto del motore trazione;
- corrente sotto carico;
- corrente di stallo breve;
- corrente sterzo a fine corsa.

Se il motore trazione assorbe piu' di 1 A continuo, evitare TB6612FNG per trazione. Per la Super Dominator e' piu' prudente prevedere driver piu' robusti come DRV887x, VNH, BTS7960 o moduli equivalenti dimensionati sulla corrente misurata.

Il TB6612FNG puo' andare bene solo se i motori sono piccoli: Pololu dichiara 4.5-13.5 V, 1 A continuo e 3 A picco per canale.

Fonte TB6612FNG: https://www.pololu.com/product/713/specs

## Alimentazione

```text
Batteria 9.6 V
    |
    +--> fusibile principale
    |
    +--> H-bridge trazione VMOT
    |
    +--> H-bridge sterzo VMOT
    |
    +--> buck converter 9.6 V -> 5 V
             |
             +--> ESP32-S3-CAM 5 V/VIN
             +--> eventuale camera/moduli logici

GND batteria, GND driver e GND ESP32 devono essere comuni.
```

Regole:

- non alimentare ESP32 direttamente da 9.6 V;
- usare buck converter stabile, almeno 1 A, meglio 2 A se camera/WiFi sono attivi;
- mettere fusibile sulla batteria;
- separare il piu' possibile i cavi motore dai cavi camera/antenna;
- aggiungere condensatore elettrolitico vicino ai driver motore;
- usare cavi motore adeguati alla corrente.

## Cablaggio logico proposto

Pinout generico ESP32-S3, da validare sulla board scelta:

```text
ESP32-S3 GPIO        Funzione                 Driver
GPIO 4              DRIVE_IN1                H-bridge trazione IN1
GPIO 5              DRIVE_IN2                H-bridge trazione IN2
GPIO 6              DRIVE_PWM                H-bridge trazione EN/PWM

GPIO 7              STEER_IN1                H-bridge sterzo IN1
GPIO 8              STEER_IN2                H-bridge sterzo IN2
GPIO 9              STEER_PWM                H-bridge sterzo EN/PWM

GPIO 10             STATUS_LED               LED stato opzionale
ADC GPIO 1          BATTERY_SENSE            partitore tensione batteria

5 V buck            VIN/5V ESP32-S3
GND                 GND comune
```

Se il driver scelto usa schema `PHASE/ENABLE` invece di `IN1/IN2/PWM`, adattare la mappa pin nel firmware.

## Batteria sense

Per leggere batteria 9.6 V con ADC ESP32:

```text
Batteria + ---- R1 ----+---- R2 ---- GND
                       |
                    ADC ESP32
```

Esempio:

- R1 = 100k;
- R2 = 33k;
- tensione ADC circa 25% della batteria;
- aggiungere calibrazione software.

## Sterzo progressivo

Se lo sterzo e' un semplice motore a 2 fili senza feedback, la progressivita e' solo sulla potenza PWM, non sulla posizione reale.

Modalita base:

- comando negativo = sterza sinistra;
- comando positivo = sterza destra;
- valore assoluto = PWM;
- comando zero = stop motore sterzo.

Rischio:

- a fine corsa il motore puo' restare alimentato e scaldare.

Mitigazioni:

- timeout breve sui comandi sterzo;
- limitare PWM massimo;
- opzionale: finecorsa sinistra/destra;
- opzionale migliore: potenziometro sterzo per feedback posizione.

## Software base a bordo

Percorso firmware:

```text
src/firmware/esp32_s3_rover
```

Funzioni MVP:

- connessione WiFi;
- endpoint `POST /drive`;
- endpoint `POST /stop`;
- endpoint `GET /status`;
- PWM progressivo trazione;
- PWM progressivo sterzo;
- watchdog: stop se non arrivano comandi;
- predisposizione camera;
- lettura batteria opzionale.

Payload:

```json
{
  "x": 0.4,
  "y": 0.8,
  "speed": 60
}
```

Mapping:

- `y > 0`: avanti;
- `y < 0`: indietro;
- `x > 0`: destra;
- `x < 0`: sinistra;
- `speed`: limite percentuale globale.

## Prossime verifiche fisiche

Prima del cablaggio finale:

- aprire auto e fotografare scheda originale;
- identificare i due fili motore trazione;
- identificare i due fili motore sterzo;
- misurare tensione batteria a piena carica;
- misurare assorbimenti motori;
- capire se conviene sostituire la scheda originale o intercettarne gli ingressi;
- verificare spazio per scheda, driver, buck e camera.
