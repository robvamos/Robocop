import { palette } from './dashboardTheme';
import type { MediaMode, WebRtcFormState } from './dashboardTypes';

export function createPeerId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `dashboard-${crypto.randomUUID().slice(0, 8)}`;
  }

  return `dashboard-${Math.random().toString(36).slice(2, 10)}`;
}

export function deriveSignalingUrl(): string {
  if (typeof window === 'undefined') {
    return 'ws://127.0.0.1:8080/ws/signaling';
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.hostname || '127.0.0.1';
  return `${protocol}//${host}:8080/ws/signaling`;
}

export function createDefaultWebRtcState(): WebRtcFormState {
  return {
    signalingUrl: deriveSignalingUrl(),
    roomId: 'robocop-room',
    localPeerId: createPeerId(),
    remotePeerId: 'rover-001',
    stunUrl: 'stun:stun.l.google.com:19302',
  };
}

export function createTelemetry(mode: MediaMode) {
  return [
    { label: 'Batteria', value: '82%', tone: palette.accent },
    { label: 'RSSI', value: '-58 dBm', tone: palette.ink },
    { label: 'Latenza', value: '42 ms', tone: palette.warning },
    { label: 'Media Path', value: mode === 'mjpeg' ? 'MJPEG' : 'WebRTC', tone: palette.glow },
  ];
}
