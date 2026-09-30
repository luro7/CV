import test from 'node:test';
import assert from 'node:assert/strict';
import { setRevealVisibility } from '../public/js/modules/motion.js';

function fakeElement() {
  const classes = new Set();
  return {
    classes,
    getBoundingClientRect() { return {}; },
    classList: {
      contains: name => classes.has(name),
      add: name => classes.add(name),
      remove: name => classes.delete(name),
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
    const scrollListeners = [];
    globalThis.window = { scrollY: 200, IntersectionObserver: globalThis.IntersectionObserver, addEventListener: (name, callback) => { if (name === 'scroll') scrollListeners.push(callback); } };
    initMotion();
    const [entrance, exit] = observers;
    const entry = isIntersecting => [{ target: element, isIntersecting }];
    entrance.callback(entry(true));
    entrance.callback(entry(false));
    assert.equal(element.classes.has('is-visible'), true, 'Crossing the entrance edge must not hide an already visible card');
    assert.equal(exit.options.rootMargin, '48px');
    exit.callback(entry(false));
    assert.equal(element.classes.has('is-visible'), false, 'An offscreen card should reset for the next appearance');
    window.scrollY = 100;
    scrollListeners.forEach(callback => callback());
    entrance.callback(entry(true));
    assert.equal(element.classes.has('is-visible'), true);
    assert.equal(element.classes.has('reveal-from-top'), true, 'Scrolling up enters from above');
    window.scrollY = 150;
    scrollListeners.forEach(callback => callback());
    entrance.callback(entry(true));
    assert.equal(element.classes.has('reveal-from-top'), true, 'An already visible element must not restart on reversal');
    exit.callback(entry(false));
    entrance.callback(entry(true));
    assert.equal(element.classes.has('reveal-from-top'), false, 'Scrolling down keeps the original entrance');
  } finally {
    for (const key of Object.keys(original)) {
      if (original[key]) Object.defineProperty(globalThis, key, original[key]);
      else delete globalThis[key];
    }
  }
});
