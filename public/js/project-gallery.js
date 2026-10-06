export function galleryPhotoIndex(index, count) {
  return ((index % count) + count) % count;
}
export function gallerySwipeDirection(dx,dy) {
  return Math.abs(dx)>=48 && Math.abs(dx)>Math.abs(dy)*1.5 ? (dx<0?1:-1) : 0;
}
export function lockGalleryPage(page=window) {
  const body=page.document.body, root=page.document.documentElement;
  const position={x:page.scrollX,y:page.scrollY};
  const properties=['position','top','left','width','overflow','paddingRight'];
  const saved=Object.fromEntries(properties.map(key=>[key,body.style[key]]));
  const rootOverflow=root.style.overflow;
  const scrollbar=Math.max(0,page.innerWidth-root.clientWidth);
  body.style.position='fixed';body.style.top=`-${position.y}px`;
  body.style.left=`-${position.x}px`;body.style.width='100%';body.style.overflow='hidden';
  if(scrollbar) body.style.paddingRight=`${parseFloat(page.getComputedStyle(body).paddingRight)+scrollbar}px`;
  root.style.overflow='hidden';
  return ()=>{
    Object.assign(body.style,saved);root.style.overflow=rootOverflow;
    page.scrollTo({left:position.x,top:position.y,behavior:'instant'});
  };
}

export function initProjectGallery() {
  const grid = document.querySelector('.projects-grid');
  if (!grid) return;
  const es = document.documentElement.lang === 'es';
  const dialog = document.createElement('dialog');
  dialog.className = 'project-photo-dialog';
  dialog.setAttribute('aria-label', es ? 'Galería del proyecto' : 'Project gallery');
  const close = document.createElement('button');
  close.className = 'project-photo-close';
  close.textContent = '×';
  close.setAttribute('aria-label', es ? 'Cerrar' : 'Close');
  const figure = document.createElement('figure');
  figure.className = 'inline-gallery-photo';
  const image = document.createElement('img');
  const caption = document.createElement('figcaption');
  figure.append(image, caption);
  const controls = document.createElement('div');
  controls.className = 'project-photo-controls';
  const previous = document.createElement('button');
  previous.textContent = es ? '← Anterior' : '← Previous';
  const status = document.createElement('span');
  status.setAttribute('aria-live', 'polite');
  const next = document.createElement('button');
  next.textContent = es ? 'Siguiente →' : 'Next →';
  controls.append(previous, status, next);
  dialog.append(close, figure, controls);
  document.body.append(dialog);
  let photos = [], index = 0;
  let unlockPage;
  dialog.addEventListener('close',()=>{unlockPage?.();unlockPage=null;touchStart=null;});
  const show = value => {
    index = galleryPhotoIndex(value, photos.length);
    const source = photos[index];
    image.src = source.href;
    image.alt = source.dataset.alt || source.dataset.description || '';
    caption.textContent = source.dataset.description || '';
    status.textContent = `${index + 1} / ${photos.length}`;
    previous.disabled = next.disabled = photos.length < 2;
  };
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  previous.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  let touchStart=null;
  figure.addEventListener('touchstart',event=>{
    touchStart=event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY}:null;
  },{passive:true});
  figure.addEventListener('touchend',event=>{
    if(!touchStart || !event.changedTouches.length) return;
    const touch=event.changedTouches[0];
    const direction=gallerySwipeDirection(touch.clientX-touchStart.x,touch.clientY-touchStart.y);
    touchStart=null;
    if(direction && photos.length>1) show(index+direction);
  },{passive:true});
  figure.addEventListener('touchcancel',()=>touchStart=null,{passive:true});
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); show(index + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  grid.querySelectorAll('.project-card').forEach(card => {
    const source = card.querySelector('.project-lightbox-link[data-gallery]');
    if (!source) return;
    const button = card.querySelector('[data-open-project-gallery]');
    button?.removeAttribute('aria-expanded');
    button?.removeAttribute('aria-controls');
    const open = event => {
      event.preventDefault();
      photos = [...document.querySelectorAll('.project-lightbox-link[data-gallery]')]
        .filter(link => link.dataset.gallery === source.dataset.gallery);
      if(dialog.open) return;
      show(0); unlockPage=lockGalleryPage();dialog.showModal();
    };
    source.addEventListener('click', open);
    button?.addEventListener('click', open);
  });
}
