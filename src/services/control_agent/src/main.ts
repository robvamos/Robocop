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
const watchdogIntervalMs = Math.max(50, Math.min(settings.commandTimeoutMs, 250));

mqtt.connect(async (payload) => {
  const command = parseCommand(payload);
  if (command.type === 'drive') {
    safety.markCommand();
  } else if (command.type === 'stop') {
    safety.acknowledgeStop();
  }
  await rover.send(command);
});

const watchdog = setInterval(async () => {
  if (!safety.needsStop()) {
    return;
  }

  try {
    await rover.stop();
    safety.acknowledgeStop();
  } catch (error) {
    console.error('Safety stop failed', error);
  }
}, watchdogIntervalMs);

const app = buildServer(rover, safety);
app.addHook('onClose', async () => {
  clearInterval(watchdog);
  mqtt.disconnect();
});

await app.listen({ port: settings.port, host: '0.0.0.0' });
