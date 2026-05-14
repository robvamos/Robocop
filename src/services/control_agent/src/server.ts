import Fastify from 'fastify';
import type { RoverClient } from './roverClient.js';
import type { SafetyManager } from './safety.js';
import { parseCommand } from './commands.js';
import { attachSignalingServer } from './signaling.js';

export function buildServer(rover: RoverClient, safety: SafetyManager) {
  const app = Fastify({ logger: true });

  app.get('/health', async () => ({
    ok: true,
    service: 'control_agent',
  }));

  app.get('/status', async () => ({
    rover: await rover.status(),
    safetyStopRequired: safety.shouldStop(),
  }));

  app.post('/cmd', async (request) => {
    const command = parseCommand(request.body);
    if (command.type === 'drive') {
      safety.markCommand();
    } else if (command.type === 'stop') {
      safety.acknowledgeStop();
    }
    await rover.send(command);
    return { accepted: true };
  });

  app.post('/stop', async () => {
    await rover.stop();
    safety.acknowledgeStop();
    return { stopped: true };
  });

  attachSignalingServer(app);

  return app;
}
