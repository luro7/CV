import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../public/js/modules/preferences.js', import.meta.url), 'utf8')
  .replace("import translations from '../translations.js';", '')
  .replace('export function initPreferences', 'function initPreferences');
const earlySource = readFileSync(new URL('../public/js/preferences-init.js', import.meta.url), 'utf8');
const translations = JSON.parse(readFileSync(new URL('../content/locales/es.json', import.meta.url), 'utf8'));

function setup({ lang = 'en', stored = {}, blocked = false, hash = '#experience', reduced = true, scrollY = 0, currentSection = '#experience' } = {}) {
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
  const session = {};
  let clock = 0;
  const document = {
    documentElement: root,
    body: make(),
    createTreeWalker:()=>walker,
      querySelector(selector) {
        if (selector === '.sidebar nav a[aria-current="location"]') return {hash:currentSection};
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
    window:{scrollX:18,scrollY},
    URL,
    Date:{now:()=>clock},
    sessionStorage:{setItem(k,v){session[k]=v;}},
    translations,
    NodeFilter:{SHOW_TEXT:4,FILTER_ACCEPT:1,FILTER_REJECT:2},
    location:{hash,href:lang === 'es' ? 'https://example.test/es/' : 'https://example.test/',assign(value){assigned.push(value);}},
    localStorage:{
      setItem(k,v){if(blocked)throw Error('blocked');stored[k]=v;}
    },
    matchMedia:()=>({matches:reduced}),
    performance:{now:()=>clock},
    requestAnimationFrame:fn=>setImmediate(()=>fn(clock+=80)),
    setTimeout, clearTimeout
  });

  vm.runInContext(source + '\ninitPreferences();', context);
  return {root,language,theme,preferences,main,stored,session,assigned,textNode};
}

test('reduced-motion language control changes locale without triggering a hash scroll',async()=>{
  const en=setup({lang:'en'});
  await en.language.events.click();
  assert.deepEqual(en.assigned,['/es/']);

  const es=setup({lang:'es'});
  await es.language.events.click();
  assert.deepEqual(es.assigned,['/']);
});

test('language control keeps the visible section and saves the exact scroll position',async()=>{
  const app=setup({lang:'en',hash:'',scrollY:642,currentSection:'#experience'});
  await app.language.events.click();
  assert.deepEqual(app.assigned,['/es/']);
  assert.deepEqual(JSON.parse(app.session['cv-language-scroll']),{path:'/es/',hash:'#experience',x:18,y:642,savedAt:0});
});

test('language route restores saved scroll before revealing the page',()=>{
  const classes=new Set();
  const session={'cv-language-scroll':JSON.stringify({path:'/es/',hash:'#experience',x:18,y:642,savedAt:1000})};
  const events={};
  const calls=[];
  const context=vm.createContext({
    document:{documentElement:{dataset:{},classList:{add:value=>classes.add(value),remove:value=>classes.delete(value)}}},
    localStorage:{getItem:()=>null},
    sessionStorage:{getItem:key=>session[key]||null,removeItem:key=>delete session[key]},
    matchMedia:()=>({matches:false}),
    location:{pathname:'/es/',search:''},
    history:{scrollRestoration:'auto',replaceState(...args){this.replaced=args;}},
    addEventListener:(name,callback)=>{events[name]=callback;},
    requestAnimationFrame:callback=>callback(),
    window:{scrollTo:(x,y)=>calls.push([x,y])},
    Date:{now:()=>1100}
  });
  vm.runInContext(earlySource,context);
  assert(classes.has('language-scroll-restoring'));
  events.pageshow();
  assert.deepEqual(calls,[[18,642]]);
  assert.deepEqual(context.history.replaced,[null,'','/es/#experience']);
  assert(!classes.has('language-scroll-restoring'));
  assert.equal(context.history.scrollRestoration,'auto');
  assert.equal(session['cv-language-scroll'],undefined);
});

test('language change erases and types the target language before route navigation',async()=>{
  const app=setup({lang:'en',reduced:false});
  await app.language.events.click();
  assert.equal(app.textNode.textContent,'Experiencia');
  assert.deepEqual(app.assigned,['/es/']);
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
