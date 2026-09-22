import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { build, output } from '../scripts/build.mjs';

test('build starts from a clean dist and regenerates deployment files', () => {
  mkdirSync(output, { recursive: true });
  writeFileSync(resolve(output, 'stale-file.txt'), 'stale');
  build();
  assert.equal(existsSync(resolve(output, 'stale-file.txt')), false);
  assert.equal(existsSync(resolve(output, 'index.html')), true);
  assert.match(readFileSync(resolve(output, 'robots.txt'), 'utf8'), /lucasrosat\.pages\.dev\/sitemap\.xml/);
  assert.match(readFileSync(resolve(output, 'sitemap.xml'), 'utf8'), /lucasrosat\.pages\.dev/);
});
