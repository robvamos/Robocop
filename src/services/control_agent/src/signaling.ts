import type { FastifyInstance } from 'fastify';
import { WebSocket, WebSocketServer } from 'ws';
import { z } from 'zod';

const signalingMessageSchema = z.object({
  roomId: z.string().min(1),
  senderId: z.string().min(1),
  targetId: z.string().min(1).optional(),
  type: z.enum(['join', 'offer', 'answer', 'ice-candidate', 'leave']),
  payload: z.unknown().optional(),
});

type Peer = {
  peerId: string;
  socket: WebSocket;
};

export function attachSignalingServer(app: FastifyInstance): void {
  const rooms = new Map<string, Map<string, Peer>>();
  const wss = new WebSocketServer({ noServer: true });

  app.server.on('upgrade', (request, socket, head) => {
    const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
    if (pathname !== '/ws/signaling') {
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  wss.on('connection', (socket) => {
    socket.on('message', (rawMessage) => {
      const message = signalingMessageSchema.parse(
        JSON.parse(rawMessage.toString('utf8')),
      );

      const room = getRoom(rooms, message.roomId);
      if (message.type === 'join') {
        room.set(message.senderId, { peerId: message.senderId, socket });
      }

      const recipients = message.targetId
        ? [room.get(message.targetId)].filter(Boolean)
        : [...room.values()].filter((peer) => peer.peerId !== message.senderId);

      for (const peer of recipients) {
        if (peer?.socket.readyState === WebSocket.OPEN) {
          peer.socket.send(JSON.stringify(message));
        }
      }
    });

    socket.on('close', () => {
      for (const room of rooms.values()) {
        for (const [peerId, peer] of room.entries()) {
          if (peer.socket === socket) {
            room.delete(peerId);
          }
        }
      }
    });
  });
}

function getRoom(
  rooms: Map<string, Map<string, Peer>>,
  roomId: string,
): Map<string, Peer> {
  const existing = rooms.get(roomId);
  if (existing) {
    return existing;
  }
  const created = new Map<string, Peer>();
  rooms.set(roomId, created);
  return created;
}
