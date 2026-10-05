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
  buttons.forEach((button,index)=>button.addEventListener('click',()=>select(index)));
  tabs.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    select(event.key==='Home'?0:event.key==='End'?panels.length-1:current+(event.key==='ArrowRight'?1:-1),true);
  });
  let wheelTimer = 0;
  shell.addEventListener('wheel',event=>{
    const rect=shell.getBoundingClientRect();
    if(event.ctrlKey || !event.deltaY || rect.top<0 || rect.bottom>innerHeight || innerWidth<=800) return;
    const next=current+Math.sign(event.deltaY);
    if(wheelTimer){event.preventDefault();clearTimeout(wheelTimer);wheelTimer=setTimeout(()=>wheelTimer=0,350);return;}
    if(next<0 || next>=panels.length) return;
    event.preventDefault(); select(next); wheelTimer=setTimeout(()=>wheelTimer=0,350);
  },{passive:false});
  const measure=()=>{
    stage.style.removeProperty('min-height');
    let height=0;
    panels.forEach(panel=>{panel.hidden=false;height=Math.max(height,panel.offsetHeight);});
    stage.style.minHeight=height+'px';
    panels.forEach((panel,index)=>panel.hidden=index!==current);
  };
  select(0); measure();
  new ResizeObserver(measure).observe(tabs);
  document.fonts.ready.then(measure);
}
