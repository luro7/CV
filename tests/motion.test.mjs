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

test('reveal stays visible at the entrance edge and resets only beyond the exit buffer', async () => {
  const { initMotion } = await import('../public/js/modules/motion.js');
  const element = fakeElement();
  element.classList.add = name => element.classes.add(name);
  element.style = { setProperty() {} };
  const observers = [];
  const original = {};
  for (const key of ['document', 'window', 'matchMedia', 'IntersectionObserver']) original[key] = Object.getOwnPropertyDescriptor(globalThis, key);
  try {
    globalThis.document = { querySelector: () => null, querySelectorAll: () => [element] };
    globalThis.matchMedia = () => ({ matches: false, addEventListener() {} });
    globalThis.IntersectionObserver = class {
      constructor(callback, options) { this.callback = callback; this.options = options; observers.push(this); }
      observe() {}
    };
    globalThis.window = { IntersectionObserver: globalThis.IntersectionObserver };
    initMotion();
    const [entrance, exit] = observers;
    const entry = isIntersecting => [{ target: element, isIntersecting }];
    entrance.callback(entry(true));
    entrance.callback(entry(false));
    assert.equal(element.classes.has('is-visible'), true, 'Crossing the entrance edge must not hide an already visible card');
    assert.equal(exit.options.rootMargin, '48px');
    exit.callback(entry(false));
    assert.equal(element.classes.has('is-visible'), false, 'An offscreen card should reset for the next appearance');
    entrance.callback(entry(true));
    assert.equal(element.classes.has('is-visible'), true);
  } finally {
    for (const key of Object.keys(original)) {
      if (original[key]) Object.defineProperty(globalThis, key, original[key]);
      else delete globalThis[key];
    }
  }
});
