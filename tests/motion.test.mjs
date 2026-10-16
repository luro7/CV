import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const motionSource = readFileSync(new URL('../public/js/modules/motion.js', import.meta.url), 'utf8');
const labSource = readFileSync(new URL('../public/js/modules/lab.js', import.meta.url), 'utf8');

test('visual motion is not driven by scrolling', () => {
  assert.doesNotMatch(motionSource, /IntersectionObserver/);
  assert.doesNotMatch(motionSource, /addEventListener\(['"]scroll/);
  assert.doesNotMatch(labSource, /initScrollSystems|hero-pipeline-progress|timeline-progress|pipeline-dock/);
});

test('motion enhancement remains pointer-only and respects reduced motion', () => {
  assert.match(motionSource, /pointermove/);
  assert.match(motionSource, /prefers-reduced-motion/);
});
