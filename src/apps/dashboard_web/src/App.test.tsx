import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { App } from './App';

test('dashboard smoke render shows unified mobile and rover debug shell', () => {
  const markup = renderToStaticMarkup(<App />);

  assert.match(markup, /Debug shell app \+ rover emulator/);
  assert.match(markup, /App Mobile Debug/);
  assert.match(markup, /Rover Output/);
  assert.match(markup, /Rover emulator output/);
  assert.match(markup, /Info wiring/);
});
