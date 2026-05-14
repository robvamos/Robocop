import { loadSettings } from './config.js';
import { parseCommand } from './commands.js';
import { MqttBridge } from './mqttBridge.js';
import { RoverClient } from './roverClient.js';
import { SafetyManager } from './safety.js';
import { buildServer } from './server.js';

const settings = loadSettings();
const rover = new RoverClient(settings.roverBaseUrl);
const safety = new SafetyManager(settings.commandTimeoutMs);
const mqtt = new MqttBridge(settings);

mqtt.connect(async (payload) => {
  const command = parseCommand(payload);
  if (command.type === 'drive') {
    safety.markCommand();
  }
  await rover.send(command);
});

const app = buildServer(rover, safety);
await app.listen({ port: settings.port, host: '0.0.0.0' });
