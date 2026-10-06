import { careerScrollDecision, careerAlignmentOffset } from './career-wheel-model.js';

export function initCareerTimeline() {
  const timeline = document.querySelector('#experience .timeline');
  if (!timeline) return;
  const es = document.documentElement.lang === 'es';
  const groups = new Map();
  for (const item of timeline.querySelectorAll('.experience-item')) {
    const name = item.querySelector('.company').textContent.trim();
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push(item);
  }
  const shell = document.createElement('div'); shell.className = 'career-editorial';
  const tabs = document.createElement('div'); tabs.className = 'career-years';
  tabs.setAttribute('role','tablist'); tabs.setAttribute('aria-label',es?'Empresas de mi trayectoria':'Career companies');
  const stage = document.createElement('div'); stage.className = 'career-stage';
  const panels = [], buttons = [];
  [...groups].forEach(([name,items],index) => {
    const panel = document.createElement('article'); panel.className = 'career-chapter';
    panel.id = 'career-chapter-' + index; panel.setAttribute('role','tabpanel');
    panel.setAttribute('aria-labelledby','career-tab-' + index);
    const masthead = document.createElement('header'); masthead.className = 'career-masthead';
    const heading = document.createElement('h3'); heading.textContent = name;
    const dates = items.map(item=>item.querySelector('.date').textContent.trim());
    const latest = dates[0].split(' — '), earliest = dates.at(-1).split(' — ');
    const range = earliest[0] + ' — ' + (latest[1] || latest[0]);
    const period = document.createElement('p'); period.textContent = range;
    masthead.append(period,heading);
    const roles = document.createElement('div'); roles.className = 'career-roles';
    items.forEach(item => {item.classList.remove('reveal');item.querySelector('.company').hidden = true;roles.append(item);});
    panel.append(masthead,roles); stage.append(panel); panels.push(panel);
    const button = document.createElement('button'); button.type = 'button';
    button.id = 'career-tab-' + index; button.setAttribute('role','tab');
    button.setAttribute('aria-controls',panel.id);
    const year = document.createElement('span'); year.textContent = earliest[0].match(/\d{4}/)?.[0] || earliest[0];
    const label = document.createElement('strong'); label.textContent = name;
    button.append(year,label); tabs.append(button); buttons.push(button);
  });
  shell.append(tabs,stage); timeline.replaceChildren(shell);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0, animation;
  const select = (index, focus = false) => {
    const previous = current; current = Math.max(0,Math.min(panels.length-1,index));
    animation?.cancel();
    panels.forEach((panel,i)=>panel.hidden = i!==current);
    buttons.forEach((button,i)=>{button.setAttribute('aria-selected',String(i===current));button.tabIndex=i===current?0:-1;});
    if (previous!==current && !motion.matches) animation=panels[current].animate([
      {opacity:0,transform:'translateX(' + (current>previous?16:-16) + 'px)'},
      {opacity:1,transform:'translateX(0)'}
    ],{duration:300,easing:'cubic-bezier(.2,.7,.2,1)'});
    if(focus) buttons[current].focus();
  };
  const section=timeline.closest('#experience');
  const anchor=()=>innerWidth<=800?80:24;
  let lastY=scrollY, lastRect=section.getBoundingClientRect(), ignoreScroll=false;
  let gestureTimer=0, gestureDirection=0;
  let nativeTimer=0,nativeDirection=0,heldY=0;
  let alignmentVersion=0;
  const originalAnchoring=document.documentElement.style.overflowAnchor;
  const settleNative=()=>{
    clearTimeout(nativeTimer);nativeTimer=setTimeout(()=>nativeTimer=0,300);
  };
  const snapshot=()=>{lastY=scrollY;lastRect=section.getBoundingClientRect();};
  const align=(index,edge='top',focus=false)=>{
    const version=++alignmentVersion;
    document.documentElement.style.overflowAnchor='none';
    ignoreScroll=true;select(index,focus);
    const rect=section.getBoundingClientRect();
    window.scrollTo({top:scrollY+careerAlignmentOffset({top:rect.top,bottom:rect.bottom,anchor:anchor(),viewport:innerHeight,edge}),behavior:'instant'});
    snapshot();requestAnimationFrame(()=>requestAnimationFrame(()=>{
      if(version!==alignmentVersion) return;
      snapshot();ignoreScroll=false;document.documentElement.style.overflowAnchor=originalAnchoring;
    }));
  };
  const settleGesture=(direction)=>{
    gestureDirection=direction;clearTimeout(gestureTimer);
    gestureTimer=setTimeout(()=>gestureTimer=0,300);
  };
  const decision=(rect,previous,direction)=>careerScrollDecision({
    top:rect.top,bottom:rect.bottom,previousTop:previous.top,previousBottom:previous.bottom,
    direction,anchor:anchor(),viewport:innerHeight,index:current,count:panels.length
  });
  let touchOrigin=null;
  window.addEventListener('touchstart',event=>{
    clearTimeout(nativeTimer);nativeTimer=0;
    touchOrigin=event.touches.length===1 && !document.querySelector('dialog[open]')
      ? {y:scrollY,rect:section.getBoundingClientRect()} : null;
  },{passive:true});
  window.addEventListener('touchend',()=>{
    if(!touchOrigin) return;
    const origin=touchOrigin;touchOrigin=null;
    const direction=Math.sign(scrollY-origin.y);
    const next=decision(section.getBoundingClientRect(),origin.rect,direction);
    if(next){align(next.index,next.edge);heldY=scrollY;nativeDirection=direction;settleNative();}
    else snapshot();
  },{passive:true});
  window.addEventListener('touchcancel',()=>{touchOrigin=null;snapshot();},{passive:true});
  buttons.forEach((button,index)=>button.addEventListener('click',()=>align(index)));
  tabs.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();align(event.key==='Home'?0:event.key==='End'?panels.length-1:current+(event.key==='ArrowRight'?1:-1),'top',true);
  });
  window.addEventListener('scroll',()=>{
    if(document.querySelector('dialog[open]')){snapshot();return;}
    if(touchOrigin){snapshot();return;}
    if(ignoreScroll){snapshot();return;}
    const rect=section.getBoundingClientRect(),direction=Math.sign(scrollY-lastY);
    if(nativeTimer && direction===nativeDirection){
      ignoreScroll=true;window.scrollTo({top:heldY,behavior:'instant'});snapshot();
      requestAnimationFrame(()=>{ignoreScroll=false;snapshot();});settleNative();return;
    }
    const next=decision(rect,lastRect,direction);
    if(next){align(next.index,next.edge);heldY=scrollY;nativeDirection=direction;settleNative();}
    else snapshot();
  },{passive:true});
  window.addEventListener('wheel',event=>{
    if(event.ctrlKey || !event.deltaY || document.querySelector('dialog[open]')) return;
    clearTimeout(nativeTimer);nativeTimer=0;
    const direction=Math.sign(event.deltaY);
    if(gestureTimer && direction===gestureDirection){event.preventDefault();settleGesture(direction);return;}
    const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
    const rect=section.getBoundingClientRect();
    const next=decision({top:rect.top-delta,bottom:rect.bottom-delta},rect,direction);
    if(!next) return;
    event.preventDefault();align(next.index,next.edge);settleGesture(direction);
  },{passive:false});
  window.addEventListener('keydown',event=>{
    if(!['PageDown','PageUp'].includes(event.key) || event.ctrlKey || event.altKey || event.metaKey || document.querySelector('dialog[open]')) return;
    if(event.target.closest?.('input,textarea,select,[contenteditable=true]')) return;
    clearTimeout(nativeTimer);nativeTimer=0;
    const direction=event.key==='PageDown'?1:-1;
    const rect=section.getBoundingClientRect(),delta=direction*innerHeight*.875;
    const next=decision({top:rect.top-delta,bottom:rect.bottom-delta},rect,direction);
    if(!next) return;
    event.preventDefault();align(next.index,next.edge);
  });
  window.addEventListener('resize',snapshot);
  select(0);snapshot();
}
