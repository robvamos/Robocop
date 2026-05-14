import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCommand } from './commands.js';

test('parses camera power commands for rover camera wiring', () => {
  const command = parseCommand({
    type: 'camera_power',
    enabled: true,
    seq: 7,
  });

  assert.equal(command.type, 'camera_power');
  assert.equal(command.enabled, true);
  assert.equal(command.seq, 7);
});
