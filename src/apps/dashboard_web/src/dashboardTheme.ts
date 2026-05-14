import type React from 'react';

export const palette = {
  ink: '#e8edf3',
  muted: '#8a97a6',
  line: '#29435a',
  lineSoft: '#1e3142',
  canvas: '#06131d',
  panel: '#0b1e2d',
  panelRaised: '#10283b',
  accent: '#39c6a5',
  accentSoft: '#123b39',
  warning: '#f6b33d',
  danger: '#ff6b6b',
  glow: '#7df1d7',
};

export const dashboardShell: React.CSSProperties = {
  minHeight: '100vh',
  padding: 24,
  color: palette.ink,
  background:
    'radial-gradient(circle at top, rgba(57,198,165,0.16), transparent 24%), linear-gradient(180deg, #08131e 0%, #061019 100%)',
  fontFamily: '"Segoe UI Variable Text", "Aptos", "Trebuchet MS", sans-serif',
};

export const panelStyle: React.CSSProperties = {
  background: 'rgba(11, 30, 45, 0.82)',
  border: `1px solid ${palette.line}`,
  borderRadius: 24,
  boxShadow: '0 22px 60px rgba(0, 0, 0, 0.32)',
  backdropFilter: 'blur(12px)',
};

export const primaryButton: React.CSSProperties = {
  padding: '12px 16px',
  borderRadius: 14,
  border: `1px solid ${palette.accent}`,
  backgroundColor: palette.accent,
  color: '#06251d',
  fontWeight: 700,
  cursor: 'pointer',
};

export const secondaryButton: React.CSSProperties = {
  padding: '12px 16px',
  borderRadius: 14,
  border: `1px solid ${palette.line}`,
  backgroundColor: 'transparent',
  color: palette.ink,
  cursor: 'pointer',
};

export const hintText: React.CSSProperties = {
  margin: 0,
  color: palette.muted,
  fontSize: 13,
  lineHeight: 1.5,
};
