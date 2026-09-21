import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../public/js/modules/preferences.js', import.meta.url), 'utf8')
  .replace("import translations from '../translations.js';", '')
  .replace('export function initPreferences', 'function initPreferences');
const translations = JSON.parse(readFileSync(new URL('../Content/locales/es.json', import.meta.url), 'utf8'));

// Small DOM adapter to exercise preference state, completion and storage failures.
function setup({ reduced = true, stored = {}, blocked = false } = {}) {
  const make = () => ({ attributes: {}, style: {}, content:'Original description', textContent:'', dataset:{}, children:[], events:{},
    setAttribute(k,v){this.attributes[k]=v;}, getAttribute(k){return this.attributes[k] ?? null;}, removeAttribute(k){delete this.attributes[k];},
    addEventListener(k,v){this.events[k]=v;}, closest(){return null;}, getBoundingClientRect(){return {height:40};},
    classList:{add(){},remove(){}} });
  const root = make(); root.dataset.theme = 'light';
  const elements = new Map();
  for (const key of ['.language-toggle','.theme-toggle','#preference-status','.preferences','main','meta[name="description"]','meta[property="og:description"]','meta[property="og:title"]','meta[property="og:locale"]','meta[name="theme-color"]']) elements.set(key,make());
  elements.get('.language-toggle').children=[make(),make()];
  const text = Object.keys(translations).map(en=>({textContent:en,parentElement:make()}));
  let index=-1, clock=0;
  const walker={currentNode:null,nextNode(){this.currentNode=text[++index];return !!this.currentNode;}};
  const document={documentElement:root,title:'',createTreeWalker:()=>walker,querySelector:s=>elements.get(s),querySelectorAll:()=>[]};
  const context=vm.createContext({document, translations, NodeFilter:{SHOW_TEXT:4},matchMedia:()=>({matches:reduced}),
    localStorage:{getItem(k){if(blocked)throw Error('blocked');return stored[k];},setItem(k,v){if(blocked)throw Error('blocked');stored[k]=v;}},
    performance:{now:()=>clock},requestAnimationFrame:fn=>setImmediate(()=>fn(clock+=80)),setTimeout,clearTimeout,Event,dispatchEvent(){}});
  vm.runInContext(source+'\ninitPreferences();', context);
  return {root,text,stored,elements,language:()=>elements.get('.language-toggle').events.click(),theme:()=>elements.get('.theme-toggle').events.click()};
}

test('English → Spanish → English updates every translated string without losing originals', async()=>{
  const app=setup(); const original=app.text.map(n=>n.textContent);
  await app.language();
  assert.equal(app.root.lang,'es');
  assert.deepEqual(app.text.map(n=>n.textContent), Object.values(translations));
  await app.language();
  assert.equal(app.root.lang,'en'); assert.deepEqual(app.text.map(n=>n.textContent),original);
});
test('rapid repeated language clicks finish one coherent animated transition',async()=>{
  const app=setup({reduced:false});
  await Promise.all([app.language(),app.language(),app.language()]);
  assert.equal(app.root.lang,'es');
  assert.equal(app.elements.get('main').getAttribute('aria-busy'),null);
  assert.deepEqual(app.text.map(n=>n.textContent),Object.values(translations));
});
test('saved Spanish is restored, dark mode is reversible and persisted',()=>{
  const app=setup({stored:{'cv-language':'es'}});
  assert.equal(app.root.lang,'es');app.theme();
  assert.equal(app.root.dataset.theme,'dark');assert.equal(app.stored['cv-theme'],'dark');
  assert.equal(app.elements.get('.theme-toggle').getAttribute('aria-checked'),'true');
  app.theme();assert.equal(app.root.dataset.theme,'light');
});
test('blocked browser storage does not break the controls',async()=>{
  const app=setup({blocked:true});await app.language();app.theme();
  assert.equal(app.root.lang,'es');assert.equal(app.root.dataset.theme,'dark');
});
