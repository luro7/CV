// Decorative only: never capture wheel, touch or keyboard input.
export function initReadingMotion() {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const bar=document.createElement('div');
 bar.className='reading-progress'; bar.setAttribute('aria-hidden','true');
 document.body.append(bar);
 let frame=0;
 const update=()=>{
  frame=0;
  const range=document.documentElement.scrollHeight-innerHeight;
  bar.style.transform='scaleX('+Math.max(0,Math.min(1,range>0?scrollY/range:0))+')';
 };
 addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(update);},{passive:true});
 addEventListener('resize',update);
 new ResizeObserver(update).observe(document.body);
 update();
 if(!('IntersectionObserver' in window))return;
 const animations=new Set();
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(({target,isIntersecting})=>{
   if(!isIntersecting)return;
   observer.unobserve(target);
   if(reduced.matches || !target.animate)return;
   const animation=target.animate([{opacity:.55,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:480,easing:'cubic-bezier(.2,.7,.2,1)'});
   animations.add(animation); animation.onfinish=()=>animations.delete(animation);
  });
 },{threshold:0,rootMargin:'0px 0px -24px 0px'});
 document.querySelectorAll('.section-heading,.expertise-card,.experience-item,.education-item,.certification-card,.languages').forEach(el=>observer.observe(el));
 reduced.addEventListener('change',()=>{if(reduced.matches){animations.forEach(a=>a.cancel());animations.clear();}});
}
