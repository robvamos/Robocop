import { useEffect, useMemo, useRef, useState } from 'react';
import {
  LabeledField,
  ModeButton,
} from './dashboardComponents';
import { architectureBlocks, architectureLinks } from './dashboardDebugData';
import {
  ArchitectureOverlay,
  JoystickPad,
  WiringCard,
} from './dashboardDebugComponents';
import {
  dashboardShell,
  hintText,
  palette,
  panelStyle,
  primaryButton,
  secondaryButton,
} from './dashboardTheme';
import type { EmulatorStatus, LogEntry } from './dashboardTypes';

export function App() {
  const [leftTab, setLeftTab] = useState<'mobile' | 'wiring'>('mobile');
  const [baseUrl, setBaseUrl] = useState('http://127.0.0.1:8010');
  const [emulatorUiUrl, setEmulatorUiUrl] = useState('http://127.0.0.1:8091');
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [speed, setSpeed] = useState(68);
  const [throttle, setThrottle] = useState(0);
  const [steering, setSteering] = useState(0);
  const [autoDrive, setAutoDrive] = useState(true);
  const [status, setStatus] = useState<EmulatorStatus | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [showArchitecture, setShowArchitecture] = useState(false);
  const lastPostedDrive = useRef<string>('');
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'boot',
      tone: 'info',
      text: 'Debug shell pronta: mobile app a sinistra, rover emulato a destra.',
    },
  ]);

  const telemetry = useMemo(
    () => [
      ['Batteria', status ? `${status.batteryPct}%` : '--'],
      ['Drive', status ? `${status.motion.direction} ${status.drive.speed}` : '--'],
      ['PWM', status ? `${status.pwm.driveDuty}/${status.pwm.steerDuty}` : '--'],
      ['Accel.', status ? `${status.motion.accelerationPct}%` : '--'],
      ['WiFi', status ? status.network.interface.ssid : '--'],
    ],
    [status],
  );

  function appendLog(text: string, tone: LogEntry['tone'] = 'info') {
    setLogs((current) => [
      {
        id: `${Date.now()}-${current.length}`,
        tone,
        text,
      },
      ...current,
    ].slice(0, 8));
  }

  async function fetchStatus() {
    try {
      const response = await fetch(`${baseUrl}/status`);
      if (!response.ok) {
        throw new Error(`status -> HTTP ${response.status}`);
      }
      const payload = (await response.json()) as EmulatorStatus;
      setStatus(payload);
      setCameraEnabled(payload.camera.enabled);
    } catch (error) {
      appendLog(
        error instanceof Error ? error.message : 'Errore durante il fetch status.',
        'error',
      );
    }
  }

  useEffect(() => {
    void fetchStatus();
    const timer = window.setInterval(() => {
      void fetchStatus();
    }, 600);

    return () => window.clearInterval(timer);
  }, [baseUrl]);

  useEffect(() => {
    if (!autoDrive) {
      return;
    }

    const isNeutral = throttle === 0 && steering === 0;
    const shouldSendStop = isNeutral && lastPostedDrive.current !== 'stop';
    if (shouldSendStop) {
      lastPostedDrive.current = 'stop';
      void postJson('/stop', {}, 'STOP automatico inviato dal joystick.', false, false);
      return;
    }

    if (isNeutral) {
      return;
    }

    const driveKey = `${steering}:${throttle}:${speed}`;
    const sendLoop = () => {
      if (lastPostedDrive.current !== driveKey) {
        appendLog(
          `Joystick attivo: sterzo ${steering}% | trazione ${throttle}% | speed ${speed}`,
          'info',
        );
      }
      lastPostedDrive.current = driveKey;
      void postJson(
        '/drive',
        { x: steering / 100, y: throttle / 100, speed },
        `Drive continuo: sterzo ${steering}% | trazione ${throttle}% | speed ${speed}`,
        false,
        false,
      );
    };

    sendLoop();
    const timer = window.setInterval(sendLoop, 250);
    return () => window.clearInterval(timer);
  }, [autoDrive, baseUrl, speed, steering, throttle]);

  function handleJoystickChange(next: { steering: number; throttle: number }) {
    setSteering(next.steering);
    setThrottle(next.throttle);
  }

  function handleJoystickRelease() {
    setSteering(0);
    setThrottle(0);
  }

  async function postJson(
    path: string,
    body: unknown,
    successMessage: string,
    logSuccess = true,
    refreshAfter = true,
  ) {
    setIsSending(true);
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error(`${path} -> HTTP ${response.status}`);
      }
      if (logSuccess) {
        appendLog(successMessage, 'success');
      }
      if (refreshAfter) {
        await fetchStatus();
        setIframeKey((value) => value + 1);
      }
    } catch (error) {
      appendLog(
        error instanceof Error ? error.message : 'Errore durante l’invio comando.',
        'error',
      );
    } finally {
      setIsSending(false);
    }
  }

  async function sendStop() {
    setThrottle(0);
    setSteering(0);
    lastPostedDrive.current = 'stop';
    await postJson('/stop', {}, 'STOP inviato al rover emulato.');
  }

  async function toggleCamera() {
    await postJson(
      '/camera/power',
      { enabled: !cameraEnabled },
      `Camera ${!cameraEnabled ? 'accesa' : 'spenta'} via mobile app.`,
    );
  }

  async function connectOpenWifi() {
    appendLog('Il chip emulato parte gia` collegato a una WiFi aperta.', 'info');
    await fetchStatus();
  }

  return (
    <main style={dashboardShell}>
      {showArchitecture ? (
        <ArchitectureOverlay
          blocks={architectureBlocks}
          links={architectureLinks}
          onClose={() => setShowArchitecture(false)}
        />
      ) : null}
      <section
        style={{
          ...panelStyle,
          padding: 28,
          display: 'grid',
          gap: 20,
          maxWidth: 1320,
          margin: '0 auto',
        }}
      >
        <header
          style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color: palette.glow,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontSize: 12,
              }}
            >
              Robocop Control Surface
            </p>
            <h1 style={{ margin: '8px 0 0', fontSize: 40 }}>
              Debug shell app + rover emulator
            </h1>
            <p style={{ margin: '10px 0 0', color: palette.muted, maxWidth: 780 }}>
              Vista unica di debug: mobile app simulata a sinistra e output grafico
              dell’emulatore rover a destra, cosi` possiamo verificare il wiring dei
              comandi in tempo reale.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
            >
              <ModeButton active={leftTab === 'mobile'} onClick={() => setLeftTab('mobile')}>
                Mobile App
              </ModeButton>
              <ModeButton active={leftTab === 'wiring'} onClick={() => setLeftTab('wiring')}>
                Wiring
              </ModeButton>
              <button
                type="button"
                onClick={() => setShowArchitecture(true)}
                style={secondaryButton}
              >
                Info wiring
              </button>
            </div>
          </header>

        <section
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 20,
            alignItems: 'flex-start',
          }}
        >
          <article style={{ ...panelStyle, padding: 18, flex: '1 1 760px', minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 14,
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <strong style={{ fontSize: 18 }}>App Mobile Debug</strong>
              <span
                style={{
                  padding: '8px 12px',
                  borderRadius: 999,
                  border: `1px solid ${status?.timedOut ? palette.warning : palette.accent}`,
                  color: status?.timedOut ? palette.warning : palette.glow,
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                }}
              >
                {status ? 'wired to emulator' : 'waiting emulator'}
              </span>
            </div>

            {leftTab === 'mobile' ? (
              <div
                style={{
                  display: 'flex',
                  gap: 20,
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    flex: '0 1 360px',
                    minWidth: 300,
                    margin: '0 auto',
                    width: '100%',
                    maxWidth: 360,
                    borderRadius: 36,
                    padding: 16,
                    border: `1px solid ${palette.line}`,
                    background:
                      'linear-gradient(180deg, rgba(8,20,30,0.92) 0%, rgba(5,13,20,0.98) 100%)',
                    boxShadow: 'inset 0 0 0 4px rgba(255,255,255,0.02)',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gap: 14,
                      borderRadius: 28,
                      padding: 18,
                      background:
                        'radial-gradient(circle at top, rgba(57,198,165,0.2), transparent 24%), rgba(12,31,45,0.82)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 12, color: palette.muted }}>Robocop Mobile</div>
                        <div style={{ fontSize: 20, fontWeight: 700 }}>Controller</div>
                      </div>
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 999,
                          backgroundColor: cameraEnabled ? palette.danger : palette.muted,
                          boxShadow: cameraEnabled
                            ? `0 0 18px ${palette.danger}`
                            : 'none',
                        }}
                      />
                    </div>

                    <div
                      style={{
                        borderRadius: 22,
                        background:
                          'linear-gradient(180deg, rgba(9,25,36,0.96), rgba(5,10,16,0.98))',
                        border: `1px solid ${palette.line}`,
                        display: 'grid',
                        gap: 14,
                        padding: 16,
                      }}
                    >
                      <div
                        style={{
                          padding: 12,
                          borderRadius: 16,
                          backgroundColor: palette.panelRaised,
                        }}
                      >
                        <div style={{ color: palette.muted, fontSize: 12 }}>WiFi</div>
                        <div style={{ marginTop: 6, fontSize: 18 }}>
                          {status?.network.interface.ssid ?? 'Robocop-FreeNet'}
                        </div>
                        <div style={{ marginTop: 6, color: palette.muted, fontSize: 12 }}>
                          Joystick al centro = zero velocita` e zero sterzo
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 10,
                        }}
                      >
                        {telemetry.map(([label, value]) => (
                          <div
                            key={label}
                            style={{
                              borderRadius: 16,
                              padding: 12,
                              backgroundColor: 'rgba(16,40,59,0.74)',
                              border: `1px solid ${palette.lineSoft}`,
                            }}
                          >
                            <div style={{ color: palette.muted, fontSize: 11 }}>{label}</div>
                            <div style={{ marginTop: 6, fontSize: 18 }}>{value}</div>
                          </div>
                        ))}
                      </div>

                      <JoystickPad
                        steering={steering}
                        throttle={throttle}
                        onChange={handleJoystickChange}
                        onRelease={handleJoystickRelease}
                      />

                      <div style={{ display: 'grid', gap: 10 }}>
                        <label style={{ display: 'grid', gap: 8 }}>
                          <span style={{ color: palette.muted, fontSize: 12 }}>
                            Sensibilita` motore {speed}
                          </span>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={speed}
                            onChange={(event) => setSpeed(Number(event.target.value))}
                          />
                        </label>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 10,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => setAutoDrive((value) => !value)}
                            style={secondaryButton}
                          >
                            {autoDrive ? 'Auto drive ON' : 'Auto drive OFF'}
                          </button>
                          <button
                            type="button"
                            onClick={() => void sendStop()}
                            style={{
                              ...drivePadButtonStyle,
                              backgroundColor: palette.danger,
                              borderColor: palette.danger,
                              color: '#250707',
                            }}
                            disabled={isSending}
                          >
                            STOP
                          </button>
                        </div>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 10,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => void toggleCamera()}
                            style={primaryButton}
                            disabled={isSending}
                          >
                            {cameraEnabled ? 'Spegni Cam' : 'Accendi Cam'}
                          </button>
                          <button
                            type="button"
                            onClick={() => void connectOpenWifi()}
                            style={secondaryButton}
                          >
                            Join Open WiFi
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    flex: '1 1 420px',
                    minWidth: 320,
                    display: 'grid',
                    gap: 16,
                  }}
                >
                  <section
                    style={{
                      ...panelStyle,
                      padding: 16,
                      borderRadius: 20,
                    }}
                  >
                    <h2 style={{ marginTop: 0, fontSize: 18 }}>Wiring status</h2>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: 12,
                      }}
                    >
                      <WiringCard
                        label="Chip"
                        value={status?.deviceId ?? 'offline'}
                        accent={palette.glow}
                      />
                      <WiringCard
                        label="Camera"
                        value={cameraEnabled ? 'ON' : 'OFF'}
                        accent={cameraEnabled ? palette.danger : palette.muted}
                      />
                      <WiringCard
                        label="Drive"
                        value={
                          status
                            ? `${status.motion.direction} / ${status.motion.steering}`
                            : '--'
                        }
                        accent={palette.warning}
                      />
                      <WiringCard
                        label="Signal"
                        value={status?.debug.lastOutcome?.signal ?? 'boot'}
                        accent={palette.glow}
                      />
                      <WiringCard
                        label="Network"
                        value={status?.network.interface.security ?? 'open'}
                        accent={palette.accent}
                      />
                    </div>
                  </section>

                  <section style={{ ...panelStyle, padding: 18 }}>
                    <h2 style={{ marginTop: 0, fontSize: 18 }}>Comandi recenti</h2>
                    <div style={{ display: 'grid', gap: 10 }}>
                      {logs.map((entry) => (
                        <div
                          key={entry.id}
                          style={{
                            borderRadius: 16,
                            padding: 12,
                            backgroundColor:
                              entry.tone === 'error'
                                ? 'rgba(255,107,107,0.12)'
                                : entry.tone === 'warning'
                                  ? 'rgba(246,179,61,0.12)'
                                  : entry.tone === 'success'
                                    ? 'rgba(57,198,165,0.14)'
                                    : 'rgba(16,40,59,0.72)',
                            border: `1px solid ${
                              entry.tone === 'error'
                                ? 'rgba(255,107,107,0.5)'
                                : entry.tone === 'warning'
                                  ? 'rgba(246,179,61,0.45)'
                                  : entry.tone === 'success'
                                    ? 'rgba(57,198,165,0.4)'
                                    : palette.lineSoft
                            }`,
                          }}
                        >
                          {entry.text}
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gap: 14,
                }}
              >
                <LabeledField
                  label="Emulator base URL"
                  value={baseUrl}
                  onChange={setBaseUrl}
                  placeholder="http://127.0.0.1:8010"
                />
                <LabeledField
                  label="Rover UI URL"
                  value={emulatorUiUrl}
                  onChange={setEmulatorUiUrl}
                  placeholder="http://127.0.0.1:8091"
                />
                <button
                  type="button"
                  onClick={() => {
                    void fetchStatus();
                    setIframeKey((value) => value + 1);
                    appendLog('Risincronizzazione wiring e rover output.', 'info');
                  }}
                  style={primaryButton}
                >
                  Sync left + right panes
                </button>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 10,
                  }}
                >
                  {architectureBlocks.map((block) => (
                    <div
                      key={block.id}
                      style={{
                        borderRadius: 16,
                        padding: 14,
                        backgroundColor: 'rgba(16,40,59,0.72)',
                        border: `1px solid ${palette.lineSoft}`,
                      }}
                    >
                      <div style={{ color: palette.glow, fontSize: 12 }}>{block.subtitle}</div>
                      <div style={{ marginTop: 6, fontSize: 18 }}>{block.title}</div>
                      <div style={{ marginTop: 8, color: palette.muted, fontSize: 13 }}>
                        {block.environment}
                      </div>
                    </div>
                  ))}
                </div>
                <p style={hintText}>
                  Questa pagina e` ora il punto di avvio predefinito del progetto
                  per il debug del wiring. A sinistra l’app invia comandi al chip
                  emulato, a destra il rover mostra l’effetto dei segnali.
                </p>
              </div>
            )}
          </article>

          <aside style={{ display: 'grid', gap: 20, flex: '1 1 420px', minWidth: 320 }}>
            <section style={{ ...panelStyle, padding: 18, minHeight: 780 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                  marginBottom: 12,
                }}
              >
                <div>
                  <h2 style={{ margin: 0, fontSize: 18 }}>Rover Output</h2>
                  <p style={{ margin: '6px 0 0', color: palette.muted }}>
                    Interfaccia grafica esterna dell’emulatore, caricata qui per il debug.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIframeKey((value) => value + 1)}
                  style={secondaryButton}
                >
                  Reload rover pane
                </button>
              </div>

              <iframe
                key={iframeKey}
                src={emulatorUiUrl}
                title="Rover emulator output"
                style={{
                  width: '100%',
                  minHeight: 690,
                  border: `1px solid ${palette.line}`,
                  borderRadius: 20,
                  backgroundColor: '#061019',
                }}
              />
            </section>

            <section style={{ ...panelStyle, padding: 18 }}>
              <h2 style={{ marginTop: 0, fontSize: 18 }}>Default launch flow</h2>
              <ol style={{ margin: 0, paddingLeft: 20, color: palette.muted, lineHeight: 1.7 }}>
                <li>Avvia emulatore chip su `127.0.0.1:8010`.</li>
                <li>Avvia UI rover separata su `127.0.0.1:8091`.</li>
                <li>Apri questa dashboard come shell di debug principale.</li>
                <li>Manda comandi dal pannello mobile e osserva il rover a destra.</li>
              </ol>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}

const drivePadButtonStyle: React.CSSProperties = {
  padding: '14px 16px',
  borderRadius: 18,
  border: `1px solid ${palette.line}`,
  backgroundColor: 'rgba(13, 38, 53, 0.92)',
  color: palette.ink,
  cursor: 'pointer',
  fontWeight: 700,
};
