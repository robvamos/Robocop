import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createDefaultWebRtcState,
  createTelemetry,
  deriveSignalingUrl,
} from './dashboardDefaults';
import { getStatusLabel } from './dashboardComponents';

test('default WebRTC state points to local signaling and rover peer defaults', () => {
  const state = createDefaultWebRtcState();

  assert.equal(state.signalingUrl, 'ws://127.0.0.1:8080/ws/signaling');
  assert.equal(state.roomId, 'robocop-room');
  assert.equal(state.remotePeerId, 'rover-001');
  assert.match(state.localPeerId, /^dashboard-/);
});

test('telemetry reflects current media mode', () => {
  const telemetry = createTelemetry('webrtc');
  const mediaPath = telemetry.find((item) => item.label === 'Media Path');

  assert.ok(mediaPath);
  assert.equal(mediaPath.value, 'WebRTC');
});

test('status label exposes friendly smoke-check state text', () => {
  assert.equal(getStatusLabel('mjpeg', 'idle'), 'MJPEG idle');
  assert.equal(getStatusLabel('webrtc', 'connected'), 'WEBRTC live');
});

test('deriveSignalingUrl falls back to local signaling in non-browser environments', () => {
  assert.equal(deriveSignalingUrl(), 'ws://127.0.0.1:8080/ws/signaling');
});
