import test from 'node:test';
import assert from 'node:assert/strict';
import { localizeHtml } from '../scripts/localize.mjs';

test('static localization translates visible text and accessibility attributes but not scripts',()=>{
  const source='<html><body><p>Hello</p><button aria-label="Close" title="Close">Close</button><script>const x="Hello";</script></body></html>';
  const result=localizeHtml(source,{Hello:'Hola',Close:'Cerrar'});
  assert.match(result,/<p>Hola<\/p>/);
  assert.match(result,/aria-label="Cerrar"/);
  assert.match(result,/title="Cerrar"/);
  assert.match(result,/>Cerrar<\/button>/);
  assert.match(result,/const x="Hello"/);
});
