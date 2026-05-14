import test from 'node:test';
import assert from 'node:assert/strict';
import { SafetyManager } from './safety.js';

test('requires stop before the first command arrives', () => {
  const safety = new SafetyManager(500);

  assert.equal(safety.shouldStop(), true);
  assert.equal(safety.needsStop(), true);
});

test('does not require stop right after a drive command', () => {
  const safety = new SafetyManager(500);

  safety.markCommand();

  assert.equal(safety.shouldStop(), false);
  assert.equal(safety.needsStop(), false);
});

test('acknowledged stop is not re-triggered until a new command arrives', () => {
  const safety = new SafetyManager(500);
  const firstCommandAt = Date.now();

  safety.markCommand();

  assert.equal(safety.needsStop(firstCommandAt + 400), false);
  assert.equal(safety.needsStop(firstCommandAt + 1000), true);

  safety.acknowledgeStop();

  assert.equal(safety.shouldStop(firstCommandAt + 1000), true);
  assert.equal(safety.needsStop(firstCommandAt + 1000), false);

  const secondCommandAt = Date.now();
  safety.markCommand();

  assert.equal(safety.needsStop(secondCommandAt + 1000), true);
});
