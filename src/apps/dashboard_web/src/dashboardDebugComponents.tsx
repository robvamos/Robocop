import type React from 'react';
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

export function JoystickPad({
  steering,
  throttle,
  onChange,
  onRelease,
}: {
  steering: number;
  throttle: number;
  onChange: (next: { steering: number; throttle: number }) => void;
  onRelease: () => void;
}) {
  const size = 220;
  const knobSize = 72;
  const limit = (size - knobSize) / 2;
  const knobX = (steering / 100) * limit;
  const knobY = (-throttle / 100) * limit;

  function projectPointer(
    event: React.PointerEvent<HTMLDivElement>,
  ): { steering: number; throttle: number } {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rawX = event.clientX - centerX;
    const rawY = event.clientY - centerY;
    const distance = Math.hypot(rawX, rawY);
    const scale = distance > limit ? limit / distance : 1;
    const limitedX = rawX * scale;
    const limitedY = rawY * scale;

    return {
      steering: Math.round((limitedX / limit) * 100),
      throttle: Math.round((-limitedY / limit) * 100),
    };
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    onChange(projectPointer(event));
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if ((event.buttons & 1) !== 1) {
      return;
    }
    onChange(projectPointer(event));
  }

  return (
    <div style={{ display: 'grid', justifyItems: 'center', gap: 14 }}>
      <div
        role="slider"
        aria-label="Joystick guida rover"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={onRelease}
        onPointerCancel={onRelease}
        style={{
          position: 'relative',
          width: size,
          height: size,
          borderRadius: 28,
          border: `1px solid ${palette.line}`,
          background:
            'radial-gradient(circle at center, rgba(57,198,165,0.16) 0%, rgba(8,19,30,0.96) 52%, rgba(4,11,18,1) 100%)',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.03)',
          touchAction: 'none',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 18,
            borderRadius: 22,
            border: `1px solid ${palette.lineSoft}`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: 1,
            backgroundColor: 'rgba(125,241,215,0.12)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: 'rgba(125,241,215,0.12)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 16,
            height: 16,
            transform: 'translate(-50%, -50%)',
            borderRadius: 999,
            backgroundColor: palette.glow,
            boxShadow: `0 0 18px ${palette.glow}`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: knobSize,
            height: knobSize,
            transform: `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`,
            borderRadius: 24,
            background:
              'linear-gradient(180deg, rgba(74,224,193,0.95) 0%, rgba(22,126,103,0.95) 100%)',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
            transition: 'transform 80ms linear',
          }}
        />
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 10,
          width: '100%',
        }}
      >
        <div
          style={{
            borderRadius: 14,
            padding: '10px 12px',
            backgroundColor: palette.panelRaised,
            border: `1px solid ${palette.lineSoft}`,
          }}
        >
          <div style={{ color: palette.muted, fontSize: 11 }}>Sterzo</div>
          <div style={{ marginTop: 6, fontSize: 20 }}>{steering}%</div>
        </div>
        <div
          style={{
            borderRadius: 14,
            padding: '10px 12px',
            backgroundColor: palette.panelRaised,
            border: `1px solid ${palette.lineSoft}`,
          }}
        >
          <div style={{ color: palette.muted, fontSize: 11 }}>Centro</div>
          <div style={{ marginTop: 6, fontSize: 20 }}>
            {steering === 0 && throttle === 0 ? '0 / 0' : 'attivo'}
          </div>
        </div>
        <div
          style={{
            borderRadius: 14,
            padding: '10px 12px',
            backgroundColor: palette.panelRaised,
            border: `1px solid ${palette.lineSoft}`,
          }}
        >
          <div style={{ color: palette.muted, fontSize: 11 }}>Trazione</div>
          <div style={{ marginTop: 6, fontSize: 20 }}>{throttle}%</div>
        </div>
      </div>
    </div>
  );
}
