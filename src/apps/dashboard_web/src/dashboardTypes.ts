export type MediaMode = 'mjpeg' | 'webrtc';

export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'error';

export type SignalingMessage = {
  roomId: string;
  senderId: string;
  targetId?: string;
  type: 'join' | 'offer' | 'answer' | 'ice-candidate' | 'leave';
  payload?: unknown;
};

export type LogTone = 'info' | 'success' | 'warning' | 'error';

export type LogEntry = {
  id: string;
  tone: LogTone;
  text: string;
};

export type WebRtcFormState = {
  signalingUrl: string;
  roomId: string;
  localPeerId: string;
  remotePeerId: string;
  stunUrl: string;
};

export type EmulatorStatus = {
  batteryPct: number;
  camera: {
    enabled: boolean;
  };
  debug: {
    lastOutcome: null | {
      detail: string;
      signal: string;
    };
  };
  deviceId: string;
  drive: {
    speed: number;
    x: number;
    y: number;
  };
  motion: {
    accelerationPct: number;
    direction: string;
    steerPct: number;
    steering: string;
    throttlePct: number;
  };
  network: {
    interface: {
      security: string;
      ssid: string;
    };
  };
  pwm: {
    driveDuty: number;
    steerDuty: number;
  };
  timedOut: boolean;
};

export type ArchitectureBlock = {
  id: string;
  title: string;
  subtitle: string;
  environment: string;
  role: string;
  io: string;
};
