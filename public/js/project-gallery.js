let activeProjectOpener;
const createCarousel = dialog => {
  const root = dialog.querySelector('[data-project-carousel]');
  const viewport = root?.querySelector('[data-carousel-viewport]');
  if (!root || !viewport || typeof window.EmblaCarousel !== 'function') return;

  const api = window.EmblaCarousel(viewport, { loop: false, dragFree: false, watchDrag: true, dragThreshold: 8 });
  const previous = root.querySelector('[data-carousel-prev]');
  const next = root.querySelector('[data-carousel-next]');
  const count = root.querySelector('[data-carousel-count]');
  const thumbnailRail = root.querySelector('[data-carousel-thumbnails]');
  const thumbnails = [...root.querySelectorAll('[data-carousel-to]')];

  const update = () => {
    const selected = api.selectedScrollSnap();
    if (count) count.textContent = (selected + 1) + ' / ' + api.scrollSnapList().length;
    if (previous) previous.disabled = !api.canScrollPrev();
    if (next) next.disabled = !api.canScrollNext();
    thumbnails.forEach((button, index) => {
      const active = index === selected;
      button.setAttribute('aria-pressed', String(active));
      if (active && thumbnailRail) {
        const railBounds = thumbnailRail.getBoundingClientRect();
        const buttonBounds = button.getBoundingClientRect();
        if (buttonBounds.left < railBounds.left) thumbnailRail.scrollTo({ left: thumbnailRail.scrollLeft + buttonBounds.left - railBounds.left, behavior: 'smooth' });
        if (buttonBounds.right > railBounds.right) thumbnailRail.scrollTo({ left: thumbnailRail.scrollLeft + buttonBounds.right - railBounds.right, behavior: 'smooth' });
      }
    });
  };

  previous?.addEventListener('click', () => api.scrollPrev());
  next?.addEventListener('click', () => api.scrollNext());
  thumbnails.forEach(button => button.addEventListener('click', () => api.scrollTo(Number(button.dataset.carouselTo))));
  viewport.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      api.scrollPrev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      api.scrollNext();
    }
  });
  api.on('select', update);
  api.on('reInit', update);
  if (thumbnails.length < 2) root.classList.add('is-single-image');
  update();
  return api;
};

const projectOpeners = [...document.querySelectorAll('[data-open-project]')];
projectOpeners.forEach(button => button.addEventListener('click', () => {
  const dialog = document.getElementById('project-dialog-' + button.dataset.openProject);
  if (!dialog || dialog.open) return;
  activeProjectOpener = button;
  dialog.showModal();
  dialog._projectCarousel = createCarousel(dialog);
  dialog.querySelector('[data-close-project]')?.focus();
}));

document.querySelectorAll('[data-project-dialog]').forEach(dialog => {
  dialog.querySelector('[data-close-project]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    dialog._projectCarousel?.destroy();
    dialog._projectCarousel = undefined;
    activeProjectOpener?.focus();
    activeProjectOpener = undefined;
  });
});
