import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../public/js/modules/preferences.js', import.meta.url), 'utf8')
  .replace("import translations from '../translations.js';", '')
  .replace('export function initPreferences', 'function initPreferences');
const translations = JSON.parse(readFileSync(new URL('../content/locales/es.json', import.meta.url), 'utf8'));

function setup({ lang = 'en', stored = {}, blocked = false, hash = '#experience', reduced = true } = {}) {
  const make = () => ({
    attributes:{}, dataset:{}, events:{}, hidden:true, title:'', style:{minHeight:''},
    setAttribute(k,v){this.attributes[k]=v;},
    getAttribute(k){return this.attributes[k] ?? null;},
    removeAttribute(k){delete this.attributes[k];},
    addEventListener(k,v){this.events[k]=v;},
    getBoundingClientRect(){return {height:40};},
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
  const main = make();

  const phrase = lang === 'es' ? 'Experiencia' : 'Experience';
  const textNode = {
    textContent: phrase,
    parentElement:{closest(){return null;}}
  };

  let walkerUsed = false;
  const walker = {
    currentNode:null,
    nextNode(){
      if (walkerUsed) return false;
      walkerUsed = true;
      this.currentNode = textNode;
      return true;
    }
  };

  const assigned = [];
  let clock = 0;
  const document = {
    documentElement: root,
    body: make(),
    createTreeWalker:()=>walker,
    querySelector(selector) {
      return {
        '.language-toggle': language,
        '.theme-toggle': theme,
        '.preferences': preferences,
        'meta[name="theme-color"]': meta,
        'main': main
      }[selector];
    },
    querySelectorAll(){ return []; }
  };

  const context = vm.createContext({
    document,
    translations,
    NodeFilter:{SHOW_TEXT:4,FILTER_ACCEPT:1,FILTER_REJECT:2},
    location:{hash,assign(value){assigned.push(value);}},
    localStorage:{
      setItem(k,v){if(blocked)throw Error('blocked');stored[k]=v;}
    },
    matchMedia:()=>({matches:reduced}),
    performance:{now:()=>clock},
    requestAnimationFrame:fn=>setImmediate(()=>fn(clock+=80)),
    setTimeout, clearTimeout
  });

  vm.runInContext(source + '\ninitPreferences();', context);
  return {root,language,theme,preferences,main,stored,assigned,textNode};
}

test('reduced-motion language control navigates directly between indexable locale routes',async()=>{
  const en=setup({lang:'en'});
  await en.language.events.click();
  assert.deepEqual(en.assigned,['/es/#experience']);

  const es=setup({lang:'es'});
  await es.language.events.click();
  assert.deepEqual(es.assigned,['/#experience']);
});

test('language change erases and types the target language before route navigation',async()=>{
  const app=setup({lang:'en',reduced:false});
  await app.language.events.click();
  assert.equal(app.textNode.textContent,'Experiencia');
  assert.deepEqual(app.assigned,['/es/#experience']);
  assert.equal(app.main.getAttribute('aria-busy'),null);
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
