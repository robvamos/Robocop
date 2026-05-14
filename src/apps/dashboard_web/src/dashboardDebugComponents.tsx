import { palette, panelStyle, secondaryButton } from './dashboardTheme';
import type { ArchitectureBlock } from './dashboardTypes';

export function WiringCard({
  accent,
  label,
  value,
}: {
  accent: string;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        borderRadius: 18,
        padding: 14,
        backgroundColor: palette.panelRaised,
        border: `1px solid ${palette.lineSoft}`,
      }}
    >
      <div style={{ color: palette.muted, fontSize: 12 }}>{label}</div>
      <div style={{ marginTop: 8, color: accent, fontSize: 22 }}>{value}</div>
    </div>
  );
}

export function ArchitectureOverlay({
  blocks,
  links,
  onClose,
}: {
  blocks: ArchitectureBlock[];
  links: Array<{ id: string; from: string; label: string; to: string }>;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 20,
        backgroundColor: 'rgba(2, 9, 14, 0.74)',
        backdropFilter: 'blur(8px)',
        padding: 24,
        overflowY: 'auto',
      }}
    >
      <section
        style={{
          ...panelStyle,
          maxWidth: 1180,
          margin: '0 auto',
          padding: 24,
          display: 'grid',
          gap: 20,
        }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: palette.glow,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
              }}
            >
              Wiring Info
            </p>
            <h2 style={{ margin: '8px 0 0', fontSize: 34 }}>Architettura di debug attiva</h2>
            <p style={{ margin: '10px 0 0', color: palette.muted, maxWidth: 820 }}>
              Vista grafica dei blocchi principali, dell’ambiente in cui girano e di
              come sono collegati nella sessione di debug corrente.
            </p>
          </div>
          <button type="button" onClick={onClose} style={secondaryButton}>
            Chiudi info
          </button>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 14,
          }}
        >
          {blocks.map((block) => (
            <article
              key={block.id}
              style={{
                borderRadius: 22,
                padding: 18,
                background:
                  'linear-gradient(180deg, rgba(13,34,48,0.96), rgba(8,20,30,0.98))',
                border: `1px solid ${palette.line}`,
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.02)',
              }}
            >
              <div style={{ color: palette.glow, fontSize: 12, letterSpacing: '0.08em' }}>
                {block.subtitle}
              </div>
              <h3 style={{ margin: '8px 0 10px', fontSize: 24 }}>{block.title}</h3>
              <div
                style={{
                  borderRadius: 14,
                  padding: '10px 12px',
                  backgroundColor: 'rgba(57,198,165,0.12)',
                  border: '1px solid rgba(57,198,165,0.22)',
                  color: palette.ink,
                  fontSize: 13,
                }}
              >
                <strong>Ambiente:</strong> {block.environment}
              </div>
              <p style={{ margin: '12px 0 0', color: palette.muted, lineHeight: 1.6 }}>
                {block.role}
              </p>
              <p style={{ margin: '10px 0 0', color: palette.warning, lineHeight: 1.5 }}>
                {block.io}
              </p>
            </article>
          ))}
        </div>

        <section
          style={{
            borderRadius: 22,
            padding: 18,
            backgroundColor: 'rgba(8, 20, 30, 0.82)',
            border: `1px solid ${palette.line}`,
          }}
        >
          <h3 style={{ marginTop: 0, fontSize: 22 }}>Flusso attivo</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {links.map((link) => (
              <div
                key={link.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
                  gap: 12,
                  alignItems: 'center',
                  padding: 14,
                  borderRadius: 16,
                  backgroundColor: 'rgba(16,40,59,0.74)',
                  border: `1px solid ${palette.lineSoft}`,
                }}
              >
                <strong>{link.from}</strong>
                <span
                  style={{
                    color: palette.glow,
                    fontSize: 12,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  {link.label}
                </span>
                <strong style={{ textAlign: 'right' }}>{link.to}</strong>
              </div>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
