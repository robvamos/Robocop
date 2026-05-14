import type { RoverCommand } from './commands.js';

export class RoverClient {
  constructor(private readonly baseUrl: string) {}

  async send(command: RoverCommand): Promise<void> {
    if (command.type === 'drive') {
      await this.post('/drive', {
        x: command.x,
        y: command.y,
        speed: command.speed,
      });
      return;
    }

    if (command.type === 'camera_power') {
      await this.post('/camera/power', {
        enabled: command.enabled,
      });
      return;
    }

    await this.stop();
  }

  async stop(): Promise<void> {
    await this.post('/stop', {});
  }

  async status(): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/status`);
    if (!response.ok) {
      throw new Error(`Rover status failed: ${response.status}`);
    }
    return response.json();
  }

  private async post(path: string, body: unknown): Promise<void> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Rover request failed: ${response.status}`);
    }
  }
}
