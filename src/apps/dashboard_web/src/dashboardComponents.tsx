import type React from 'react';
import { palette } from './dashboardTheme';
import type { ConnectionState, MediaMode } from './dashboardTypes';

export function ModeButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '12px 16px',
        borderRadius: 999,
        border: `1px solid ${active ? palette.accent : palette.line}`,
        background: active ? palette.accentSoft : 'rgba(8, 19, 30, 0.8)',
        color: active ? palette.glow : palette.ink,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

export function getStatusLabel(mode: MediaMode, state: ConnectionState): string {
  if (state === 'connected') {
    return `${mode.toUpperCase()} live`;
  }
  if (state === 'connecting') {
    return `${mode.toUpperCase()} in connessione`;
  }
  if (state === 'error') {
    return `${mode.toUpperCase()} errore`;
  }
  return `${mode.toUpperCase()} idle`;
}

export function StatusPill({
  mode,
  state,
}: {
  mode: MediaMode;
  state: ConnectionState;
}) {
  const text = getStatusLabel(mode, state);
  const color =
    state === 'connected'
      ? palette.accent
      : state === 'connecting'
        ? palette.warning
        : state === 'error'
          ? palette.danger
          : palette.muted;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        borderRadius: 999,
        border: `1px solid ${color}`,
        color,
        backgroundColor: 'rgba(6, 19, 29, 0.85)',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          backgroundColor: color,
          boxShadow: `0 0 16px ${color}`,
        }}
      />
      {text}
    </span>
  );
}

export function LabeledField({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label style={{ display: 'grid', gap: 8 }}>
      <span style={{ color: palette.muted, fontSize: 12 }}>{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: 14,
          border: `1px solid ${palette.line}`,
          backgroundColor: 'rgba(6, 19, 29, 0.72)',
          color: palette.ink,
        }}
      />
    </label>
  );
}
