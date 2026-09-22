import test from 'node:test';
import assert from 'node:assert/strict';
import { setRevealVisibility } from '../public/js/modules/motion.js';

function fakeElement() {
  const classes = new Set();
  return {
    classes,
    classList: {
      toggle(name, enabled) {
        if (enabled) classes.add(name);
        else classes.delete(name);
      }
    }
  };
}

test('reveal visibility can be replayed after leaving and re-entering the viewport', () => {
  const element = fakeElement();

  setRevealVisibility(element, true);
  assert.equal(element.classes.has('is-visible'), true);

  setRevealVisibility(element, false);
  assert.equal(element.classes.has('is-visible'), false);

  setRevealVisibility(element, true);
  assert.equal(element.classes.has('is-visible'), true);
});
