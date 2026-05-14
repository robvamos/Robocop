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
