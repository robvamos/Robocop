export type Settings = {
  deviceId: string;
  port: number;
  mqttUrl: string;
  mqttUsername?: string;
  mqttPassword?: string;
  roverBaseUrl: string;
  commandTimeoutMs: number;
};

export function loadSettings(env: NodeJS.ProcessEnv = process.env): Settings {
  return {
    deviceId: env.DEVICE_ID ?? 'rover-dev-001',
    port: Number(env.PORT ?? 8080),
    mqttUrl: env.MQTT_URL ?? 'mqtts://localhost:8883',
    mqttUsername: env.MQTT_USERNAME,
    mqttPassword: env.MQTT_PASSWORD,
    roverBaseUrl: env.ROVER_BASE_URL ?? 'http://127.0.0.1:8010',
    commandTimeoutMs: Number(env.COMMAND_TIMEOUT_MS ?? 500),
  };
}
