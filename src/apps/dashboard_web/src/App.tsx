import { useEffect, useMemo, useRef, useState } from 'react';
import {
  createDefaultWebRtcState,
  createTelemetry,
} from './dashboardDefaults';
import {
  LabeledField,
  ModeButton,
  StatusPill,
} from './dashboardComponents';
import {
  dashboardShell,
  hintText,
  palette,
  panelStyle,
  primaryButton,
  secondaryButton,
} from './dashboardTheme';
import type {
  ConnectionState,
  LogEntry,
  MediaMode,
  SignalingMessage,
  WebRtcFormState,
} from './dashboardTypes';

export function App() {
  const [mode, setMode] = useState<MediaMode>('mjpeg');
  const [mjpegUrl, setMjpegUrl] = useState('http://127.0.0.1:8010/video.mjpeg');
  const [mjpegLoaded, setMjpegLoaded] = useState(false);
  const [mjpegError, setMjpegError] = useState<string | null>(null);
  const [webrtcState, setWebrtcState] = useState<WebRtcFormState>(
    createDefaultWebRtcState,
  );
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'boot',
      tone: 'info',
      text: 'Player locale pronto. MJPEG usa <img>; WebRTC usa API native del browser.',
    },
  ]);
  const telemetry = useMemo(() => createTelemetry(mode), [mode]);

  const imgKey = useMemo(() => `${mjpegUrl}:${mjpegLoaded}`, [mjpegLoaded, mjpegUrl]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

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

  function cleanupWebRtc() {
    websocketRef.current?.close();
    websocketRef.current = null;

    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    remoteStreamRef.current?.getTracks().forEach((track) => track.stop());
    remoteStreamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  useEffect(() => {
    return () => cleanupWebRtc();
  }, []);

  async function handleStartWebRtc() {
    cleanupWebRtc();
    setConnectionState('connecting');
    appendLog('Avvio sessione WebRTC nativa.', 'info');

    try {
      const stream = new MediaStream();
      remoteStreamRef.current = stream;

      const peer = new RTCPeerConnection({
        iceServers: webrtcState.stunUrl
          ? [{ urls: [webrtcState.stunUrl] }]
          : undefined,
      });

      peerConnectionRef.current = peer;

      peer.addTransceiver('video', { direction: 'recvonly' });
      peer.addTransceiver('audio', { direction: 'recvonly' });

      peer.ontrack = (event) => {
        for (const track of event.streams[0]?.getTracks() ?? [event.track]) {
          stream.addTrack(track);
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setConnectionState('connected');
        appendLog('Stream remoto agganciato al player incorporato.', 'success');
      };

      peer.onicecandidate = (event) => {
        if (!event.candidate || !websocketRef.current) {
          return;
        }

        const message: SignalingMessage = {
          roomId: webrtcState.roomId,
          senderId: webrtcState.localPeerId,
          targetId: webrtcState.remotePeerId,
          type: 'ice-candidate',
          payload: event.candidate,
        };

        websocketRef.current.send(JSON.stringify(message));
      };

      const socket = new WebSocket(webrtcState.signalingUrl);
      websocketRef.current = socket;

      socket.addEventListener('open', async () => {
        const joinMessage: SignalingMessage = {
          roomId: webrtcState.roomId,
          senderId: webrtcState.localPeerId,
          type: 'join',
        };
        socket.send(JSON.stringify(joinMessage));
        appendLog(`Join stanza ${webrtcState.roomId} su signaling.`, 'info');

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        const offerMessage: SignalingMessage = {
          roomId: webrtcState.roomId,
          senderId: webrtcState.localPeerId,
          targetId: webrtcState.remotePeerId,
          type: 'offer',
          payload: offer,
        };

        socket.send(JSON.stringify(offerMessage));
        appendLog(`Offer inviata verso ${webrtcState.remotePeerId}.`, 'info');
      });

      socket.addEventListener('message', async (event) => {
        const message = JSON.parse(event.data as string) as SignalingMessage;

        if (message.roomId !== webrtcState.roomId) {
          return;
        }

        if (message.targetId && message.targetId !== webrtcState.localPeerId) {
          return;
        }

        if (message.type === 'offer' && message.payload) {
          await peer.setRemoteDescription(
            message.payload as RTCSessionDescriptionInit,
          );
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);

          const answerMessage: SignalingMessage = {
            roomId: webrtcState.roomId,
            senderId: webrtcState.localPeerId,
            targetId: message.senderId,
            type: 'answer',
            payload: answer,
          };

          socket.send(JSON.stringify(answerMessage));
          appendLog(`Answer inviata a ${message.senderId}.`, 'success');
        }

        if (message.type === 'answer' && message.payload) {
          await peer.setRemoteDescription(
            message.payload as RTCSessionDescriptionInit,
          );
          appendLog('Answer ricevuta dal peer remoto.', 'success');
        }

        if (message.type === 'ice-candidate' && message.payload) {
          await peer.addIceCandidate(message.payload as RTCIceCandidateInit);
        }
      });

      socket.addEventListener('close', () => {
        appendLog('Canale signaling chiuso.', 'warning');
      });

      socket.addEventListener('error', () => {
        setConnectionState('error');
        appendLog('Errore sul signaling WebRTC.', 'error');
      });
    } catch (error) {
      setConnectionState('error');
      appendLog(
        error instanceof Error
          ? error.message
          : 'Errore sconosciuto durante l’avvio WebRTC.',
        'error',
      );
    }
  }

  function handleStopWebRtc() {
    cleanupWebRtc();
    setConnectionState('idle');
    appendLog('Sessione WebRTC fermata.', 'warning');
  }

  return (
    <main style={dashboardShell}>
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
              Dashboard media inclusa nei sorgenti
            </h1>
            <p style={{ margin: '10px 0 0', color: palette.muted, maxWidth: 780 }}>
              Nessun player esterno richiesto: MJPEG viene renderizzato con un tag
              immagine, WebRTC con API browser native e signaling verso il Control
              Agent.
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
            <ModeButton active={mode === 'mjpeg'} onClick={() => setMode('mjpeg')}>
              MJPEG
            </ModeButton>
            <ModeButton active={mode === 'webrtc'} onClick={() => setMode('webrtc')}>
              WebRTC
            </ModeButton>
          </div>
        </header>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.6fr) minmax(320px, 0.9fr)',
            gap: 20,
          }}
        >
          <article style={{ ...panelStyle, padding: 18 }}>
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
              <strong style={{ fontSize: 18 }}>Live View</strong>
              <StatusPill state={connectionState} mode={mode} />
            </div>

            <div
              style={{
                position: 'relative',
                overflow: 'hidden',
                aspectRatio: '16 / 9',
                borderRadius: 20,
                border: `1px solid ${palette.line}`,
                background:
                  'linear-gradient(135deg, rgba(16,40,59,0.98) 0%, rgba(4,12,18,0.98) 100%)',
              }}
            >
              {mode === 'mjpeg' ? (
                <img
                  key={imgKey}
                  src={mjpegUrl}
                  alt="MJPEG rover stream"
                  onLoad={() => {
                    setMjpegLoaded(true);
                    setMjpegError(null);
                  }}
                  onError={() => {
                    setMjpegLoaded(false);
                    setMjpegError('Stream MJPEG non raggiungibile dal browser.');
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  controls
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    backgroundColor: '#02080d',
                  }}
                />
              )}

              <div
                style={{
                  position: 'absolute',
                  top: 14,
                  left: 14,
                  padding: '8px 12px',
                  borderRadius: 999,
                  backgroundColor: 'rgba(6, 19, 29, 0.82)',
                  border: `1px solid ${palette.line}`,
                  fontSize: 12,
                }}
              >
                {mode === 'mjpeg'
                  ? mjpegError ?? 'MJPEG embedded player'
                  : 'WebRTC embedded player'}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: 10,
                marginTop: 14,
              }}
            >
              {telemetry.map((item) => (
                <div
                  key={item.label}
                  style={{
                    backgroundColor: palette.panelRaised,
                    border: `1px solid ${palette.lineSoft}`,
                    borderRadius: 18,
                    padding: 14,
                  }}
                >
                  <div style={{ color: palette.muted, fontSize: 12 }}>{item.label}</div>
                  <div style={{ color: item.tone, fontSize: 24, marginTop: 6 }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <aside style={{ display: 'grid', gap: 20 }}>
            <section style={{ ...panelStyle, padding: 18 }}>
              <h2 style={{ marginTop: 0, fontSize: 18 }}>Sorgente media</h2>

              {mode === 'mjpeg' ? (
                <div style={{ display: 'grid', gap: 12 }}>
                  <LabeledField
                    label="URL MJPEG"
                    value={mjpegUrl}
                    onChange={setMjpegUrl}
                    placeholder="http://127.0.0.1:8010/video.mjpeg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setMjpegLoaded(false);
                      setMjpegError(null);
                    }}
                    style={primaryButton}
                  >
                    Ricarica stream MJPEG
                  </button>
                  <p style={hintText}>
                    Questo fallback non richiede librerie extra: usa il supporto
                    immagine continuo del browser.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  <LabeledField
                    label="WebSocket signaling"
                    value={webrtcState.signalingUrl}
                    onChange={(value) =>
                      setWebrtcState((current) => ({
                        ...current,
                        signalingUrl: value,
                      }))
                    }
                    placeholder="ws://127.0.0.1:8080/ws/signaling"
                  />
                  <LabeledField
                    label="Room ID"
                    value={webrtcState.roomId}
                    onChange={(value) =>
                      setWebrtcState((current) => ({ ...current, roomId: value }))
                    }
                    placeholder="robocop-room"
                  />
                  <LabeledField
                    label="Local peer ID"
                    value={webrtcState.localPeerId}
                    onChange={(value) =>
                      setWebrtcState((current) => ({
                        ...current,
                        localPeerId: value,
                      }))
                    }
                    placeholder="dashboard-001"
                  />
                  <LabeledField
                    label="Remote peer ID"
                    value={webrtcState.remotePeerId}
                    onChange={(value) =>
                      setWebrtcState((current) => ({
                        ...current,
                        remotePeerId: value,
                      }))
                    }
                    placeholder="rover-001"
                  />
                  <LabeledField
                    label="STUN server"
                    value={webrtcState.stunUrl}
                    onChange={(value) =>
                      setWebrtcState((current) => ({ ...current, stunUrl: value }))
                    }
                    placeholder="stun:stun.l.google.com:19302"
                  />
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={handleStartWebRtc}
                      style={primaryButton}
                    >
                      Avvia WebRTC
                    </button>
                    <button
                      type="button"
                      onClick={handleStopWebRtc}
                      style={secondaryButton}
                    >
                      Ferma
                    </button>
                  </div>
                  <p style={hintText}>
                    Il viewer e il player sono inclusi nei sorgenti. Serve comunque
                    un peer remoto che risponda via signaling e pubblichi la traccia
                    media.
                  </p>
                </div>
              )}
            </section>

            <section style={{ ...panelStyle, padding: 18 }}>
              <h2 style={{ marginTop: 0, fontSize: 18 }}>Log rapido</h2>
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
          </aside>
        </section>
      </section>
    </main>
  );
}
