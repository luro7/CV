import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {careerScrollDecision,careerAlignmentOffset} from '../public/js/modules/career-wheel-model.js';
const source=readFileSync('public/js/modules/career-timeline.js','utf8').replace(/^import .*;\s*/, '').replace('export function','function');
function setup(width,height) {
 const events={},frames=[];let panels=[];let state;
 const make=()=>({children:[],hidden:false,style:{},attributes:{},classList:{add(){},remove(){}},append(...children){this.children.push(...children);},setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,v){this[k]=v;},animate(){return {cancel(){}};},focus(){}});
 const items=['Accenture','Grupo Aoniken','Iddea Devs'].map(name=>{const item=make();item.querySelector=key=>({textContent:key==='.company'?name:'2021 — 2022'});return item;});
 const section={getBoundingClientRect(){const index=panels.findIndex(p=>!p.hidden);return {top:1000-state.scrollY,bottom:1000-state.scrollY+(index===0?height+500:400)};}};
 const timeline={querySelectorAll:()=>items,closest:()=>section,replaceChildren(shell){panels=shell.children[1].children;}};
 state={scrollY:1000-(width<=800?80:24),innerWidth:width,innerHeight:height,careerScrollDecision,careerAlignmentOffset,matchMedia:()=>({matches:true}),setTimeout:()=>1,clearTimeout(){},requestAnimationFrame:fn=>frames.push(fn),document:{documentElement:{lang:'es',style:{}},querySelector:s=>s.includes('.timeline')?timeline:null,createElement:make}};
 state.window={addEventListener:(name,fn)=>events[name]=fn,scrollTo:({top})=>state.scrollY=top};
 vm.runInNewContext(source+';initCareerTimeline();',state);
 const flush=()=>{while(frames.length) frames.shift()();};
 const index=()=>panels.findIndex(p=>!p.hidden);
 const swipe=delta=>{events.touchstart({touches:[{}]});state.scrollY+=delta;events.scroll();assert.equal(panels.filter(p=>!p.hidden).length,1);events.touchend();flush();};
 return {state,events,flush,index,swipe};
}
for(const [width,height] of [[390,844],[1366,768],[3840,2160]]) test(`touch lifecycle reads long content and changes exactly one company at ${width}px`,()=>{
 const h=setup(width,height);
 h.swipe(3000);assert.equal(h.index(),0,'first gesture reaches the bottom before advancing');
 h.swipe(3000);assert.equal(h.index(),1);
 const held=h.state.scrollY;h.state.scrollY+=2000;h.events.scroll();h.flush();assert.equal(h.index(),1,'momentum cannot skip a company');assert.equal(h.state.scrollY,held);
 h.swipe(3000);assert.equal(h.index(),2);
 h.swipe(-3000);assert.equal(h.index(),1);
 h.swipe(-3000);assert.equal(h.index(),0);
 h.swipe(-3000);assert.equal(h.index(),0,'reading upward reaches the first chapter top');
});
