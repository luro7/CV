export function galleryScrollFrame(progress, count) {
  const bounded = Math.max(0, Math.min(Math.max(0, count - 1), progress));
  return {index: Math.floor(bounded), fraction: bounded - Math.floor(bounded)};
}

export function initProjectGallery() {
  const grid = document.querySelector('.projects-grid');
  if (!grid) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const journeys = [];
  grid.querySelectorAll('.project-card').forEach(card => {
    const source = card.querySelector('.project-card-link.project-lightbox-link');
    if (!source) return;
    const sources = [...document.querySelectorAll('.project-lightbox-link[data-gallery]')]
      .filter(link => link.dataset.gallery === source.dataset.gallery);
    const journey = document.createElement('div');
    journey.className = 'project-scroll-journey';
    const stage = document.createElement('div');
    stage.className = 'project-scroll-stage';
    stage.setAttribute('aria-label', source.dataset.title);
    const photos = sources.map(link => {
      const figure = document.createElement('figure');
      figure.className = 'inline-gallery-photo';
      const image = document.createElement('img');
      image.src = link.href;
      image.alt = link.dataset.alt || link.dataset.description || '';
      image.loading = 'lazy'; image.decoding = 'async';
      const caption = document.createElement('figcaption');
      caption.textContent = link.dataset.description;
      figure.append(image, caption); stage.append(figure);
      return figure;
    });
    journey.append(stage); card.append(journey);
    card.classList.add('has-scroll-gallery');
    journeys.push({journey, stage, photos});
  });
  if (!journeys.length) return;
  grid.classList.add('has-scroll-galleries');
  let frame = 0;
  const update = () => {
    frame = 0;
    journeys.forEach(({journey, stage, photos}) => {
      if (motion.matches) {
        photos.forEach(photo => { photo.removeAttribute('style'); photo.removeAttribute('aria-hidden'); });
        return;
      }
      const top = innerWidth <= 800 ? 76 : 16;
      const step = stage.offsetHeight;
      const {index, fraction} = galleryScrollFrame((top - journey.getBoundingClientRect().top) / step, photos.length);
      photos.forEach((photo, position) => {
        const current = position === index;
        const incoming = position === index + 1;
        photo.style.opacity = current ? String(1 - fraction * .35) : incoming ? '1' : '0';
        photo.style.zIndex = incoming ? '2' : '1';
        photo.style.clipPath = incoming ? 'inset(0 0 0 ' + (100 - fraction * 100) + '%)' : 'inset(0 0 0 0)';
        photo.style.transform = current ? 'scale(' + (1 - fraction * .04) + ')' : incoming ? 'scale(' + (1.04 - fraction * .04) + ')' : 'none';
        photo.setAttribute('aria-hidden', String(position !== index));
      });
    });
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  const measure = () => {
    journeys.forEach(({journey,stage,photos}) => {
      journey.style.height = motion.matches ? 'auto' : stage.offsetHeight * photos.length + 'px';
    });
    schedule();
  };
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', measure, {passive:true});
  motion.addEventListener('change', measure);
  document.fonts.ready.then(measure);
  measure();
}
