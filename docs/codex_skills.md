# Skill Codex di supporto

Questo progetto puo' beneficiare di alcune skill Codex gia' disponibili nell'ambiente. Le skill non sono codice runtime del rover: sono strumenti di lavoro per progettazione, documentazione, immagini, integrazioni e futura estensione del progetto.

## Skill consigliate

### openai-docs

Uso nel progetto:

- progettare funzioni AI del rover con API OpenAI;
- scegliere modelli aggiornati per visione, voce, agenti o automazioni;
- verificare documentazione ufficiale OpenAI prima di implementare integrazioni;
- preparare prompt, tool calling o pipeline AI locali/cloud.

Quando attivarla:

- quando si lavora su `src/services/ai_agent/app/ai_pipeline.py`;
- quando si aggiungono funzioni di riconoscimento oggetti, analisi scena, voce o comandi naturali;
- quando serve una scelta aggiornata di modelli/API.

Nota: per policy operativa, usare solo documentazione ufficiale OpenAI quando si cercano dettagli aggiornati.

### imagegen

Uso nel progetto:

- generare mockup visuali del rover;
- produrre immagini per dashboard, documentazione o concept;
- creare asset bitmap per app mobile o pagina dimostrativa;
- preparare illustrazioni realistiche del dispositivo, viste camera o scenari di telepresenza.

Quando attivarla:

- quando servono immagini raster, mockup, texture, sprite o concept;
- non usarla per icone semplici o asset SVG che e' meglio realizzare direttamente nel codice.

### skill-creator

Uso nel progetto:

- creare una skill specifica per Robocop quando il flusso di lavoro diventera' ripetitivo;
- formalizzare procedure come setup Raspberry, provisioning WiFi, rilascio MQTT, test hardware;
- creare istruzioni riutilizzabili per altri agenti Codex che lavoreranno sul progetto.

Quando attivarla:

- quando emergono procedure ricorrenti e fragili;
- quando conviene trasformare documentazione operativa in una skill riutilizzabile;
- quando si decide di creare una skill locale, ad esempio `robocop-rover-setup`.

Skill locali candidate future:

- `robocop-rover-setup`: setup Raspberry, GPIO, servizi systemd, camera e WiFi;
- `robocop-mqtt-protocol`: convenzioni topic, payload, ACL e test broker;
- `robocop-ai-agent`: workflow per AI Agent, video pipeline, telemetria e safety;
- `robocop-mobile-ui`: convenzioni Flutter per joystick, video e provisioning.

### skill-installer

Uso nel progetto:

- installare skill aggiuntive curate o provenienti da repository GitHub;
- preparare l'ambiente Codex se in futuro serviranno skill specializzate non presenti ora.

Quando attivarla:

- quando si decide di aggiungere skill esterne;
- quando serve elencare o installare skill curate.

Nota: non e' una dipendenza del codice Robocop; serve solo per l'ambiente di sviluppo Codex.

## Skill disponibili ma non centrali ora

### plugin-creator

Uso possibile:

- creare plugin Codex se il progetto avra' bisogno di un'integrazione locale dedicata;
- pubblicare strumenti o workflow specifici per Robocop come plugin.

Non usarla per il normale sviluppo del rover. Valutarla solo se serve un plugin Codex separato dalle skill.

## Regole di utilizzo nel progetto

- `feed/` resta solo input documentale: non salvare skill, output o artefatti generati li' dentro.
- Documentare nuove decisioni in `docs/`.
- Mettere eventuali skill locali future fuori da `feed/`, preferibilmente in una directory dedicata come `codex-skills/` o nell'home Codex se devono essere auto-discoverable.
- Non inserire credenziali, token MQTT, password WiFi o chiavi API in skill, documenti o log.
- Per AI e OpenAI, verificare sempre la documentazione aggiornata prima di fissare API o modelli.
