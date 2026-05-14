import mqtt, { type MqttClient } from 'mqtt';
import type { Settings } from './config.js';

export class MqttBridge {
  private client?: MqttClient;

  constructor(private readonly settings: Settings) {}

  connect(onCommand: (payload: unknown) => Promise<void>): void {
    this.client = mqtt.connect(this.settings.mqttUrl, {
      username: this.settings.mqttUsername,
      password: this.settings.mqttPassword,
    });

    const commandTopic = `rover/${this.settings.deviceId}/cmd`;
    this.client.on('connect', () => {
      this.client?.subscribe(commandTopic);
    });

    this.client.on('error', (error) => {
      console.error('MQTT client error', error);
    });

    this.client.on('message', async (_topic, message) => {
      try {
        const payload = JSON.parse(message.toString('utf8'));
        await onCommand(payload);
      } catch (error) {
        console.error('MQTT command handling failed', error);
      }
    });
  }

  publishTelemetry(payload: unknown): void {
    this.client?.publish(
      `rover/${this.settings.deviceId}/telemetry`,
      JSON.stringify(payload),
    );
  }

  disconnect(): void {
    this.client?.end(true);
    this.client = undefined;
  }
}
