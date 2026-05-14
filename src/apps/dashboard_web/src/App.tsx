export function App() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <h1>Robocop Dashboard</h1>
      <section>
        <h2>Video</h2>
        <div style={{ border: '1px solid #aaa', aspectRatio: '16 / 9' }}>
          MJPEG/WebRTC player
        </div>
      </section>
      <section>
        <h2>Telemetria</h2>
        <p>Batteria, RSSI, velocita, modalita, ostacoli.</p>
      </section>
      <section>
        <h2>Comandi</h2>
        <button type="button">Stop</button>
      </section>
    </main>
  );
}
