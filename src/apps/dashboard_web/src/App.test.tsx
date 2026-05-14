import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { App } from './App';

test('dashboard smoke render shows embedded media controls', () => {
  const markup = renderToStaticMarkup(<App />);

  assert.match(markup, /Dashboard media inclusa nei sorgenti/);
  assert.match(markup, /MJPEG embedded player/);
  assert.match(markup, /Ricarica stream MJPEG/);
  assert.match(markup, /Log rapido/);
});
