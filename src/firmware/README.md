# Firmware Layout

Le implementazioni firmware reali devono restare separate per chip.

Regola:

- una cartella per chip sotto `src/firmware/`
- nome cartella uguale al chip o alla board principale
- emulatore e firmware reale non si mischiano

Esempio attuale:

- `src/firmware/esp32_s3_rover`

Quando aggiungeremo altri target, usare lo stesso schema:

- `src/firmware/raspberry_pi_zero_2w_rover`
- `src/firmware/esp32_cam_rover`

Ogni cartella chip-specifica dovrebbe contenere almeno:

- sorgenti firmware
- README locale con pinout e note board-specifiche
- configurazione build/upload
