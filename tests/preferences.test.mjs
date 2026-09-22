import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../public/js/modules/preferences.js', import.meta.url), 'utf8')
  .replace('export function initPreferences', 'function initPreferences');

function setup({ lang = 'en', stored = {}, blocked = false, hash = '#experience' } = {}) {
  const make = () => ({
    attributes:{}, dataset:{}, events:{}, hidden:true, title:'',
    setAttribute(k,v){this.attributes[k]=v;},
    getAttribute(k){return this.attributes[k] ?? null;},
    addEventListener(k,v){this.events[k]=v;},
    classList:{add(){},remove(){}}
  });

  const root = make();
  root.lang = lang;
  root.dataset.theme = 'light';

  const language = make();
  language.dataset.languageTarget = lang === 'es' ? '/' : '/es/';
  const theme = make();
  const preferences = make();
  const meta = make();
  meta.content = '#153b31';

  const assigned = [];
  const document = {
    documentElement: root,
    querySelector(selector) {
      return {
        '.language-toggle': language,
        '.theme-toggle': theme,
        '.preferences': preferences,
        'meta[name="theme-color"]': meta
      }[selector];
    }
  };

  const context = vm.createContext({
    document,
    location:{hash,assign(value){assigned.push(value);}},
    localStorage:{
      setItem(k,v){if(blocked)throw Error('blocked');stored[k]=v;}
    },
    matchMedia:()=>({matches:true}),
    setTimeout, clearTimeout
  });

  vm.runInContext(source + '\ninitPreferences();', context);
  return {root,language,theme,preferences,stored,assigned};
}

test('language control navigates between indexable locale routes and keeps the hash',()=>{
  const en=setup({lang:'en'});
  en.language.events.click();
  assert.deepEqual(en.assigned,['/es/#experience']);

  const es=setup({lang:'es'});
  es.language.events.click();
  assert.deepEqual(es.assigned,['/#experience']);
});

test('dark mode is reversible and persisted',()=>{
  const app=setup();
  app.theme.events.click();
  assert.equal(app.root.dataset.theme,'dark');
  assert.equal(app.stored['cv-theme'],'dark');
  assert.equal(app.theme.getAttribute('aria-checked'),'true');
  app.theme.events.click();
  assert.equal(app.root.dataset.theme,'light');
});

test('blocked browser storage does not break theme controls',()=>{
  const app=setup({blocked:true});
  app.theme.events.click();
  assert.equal(app.root.dataset.theme,'dark');
});
