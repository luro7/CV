let activeProjectOpener;

const createGallery = dialog => {
  const root = dialog.querySelector('[data-project-gallery]');
  const mainElement = root?.querySelector('[data-gallery-main]');
  const thumbsElement = root?.querySelector('[data-gallery-thumbs]');
  if (!root || !mainElement || typeof window.Swiper !== 'function') return;

  const thumbs = thumbsElement && !thumbsElement.classList.contains('is-single-image')
    ? new window.Swiper(thumbsElement, {
        slidesPerView: 'auto',
        spaceBetween: 10,
        freeMode: true,
        watchSlidesProgress: true,
        grabCursor: true
      })
    : undefined;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gallery = new window.Swiper(mainElement, {
    slidesPerView: 1,
    speed: reducedMotion ? 0 : 420,
    simulateTouch: true,
    grabCursor: true,
    watchOverflow: true,
    rewind: true,
    keyboard: { enabled: true, onlyInViewport: true },
    navigation: {
      prevEl: root.querySelector('[data-gallery-prev]'),
      nextEl: root.querySelector('[data-gallery-next]')
    },
    thumbs: thumbs ? { swiper: thumbs } : undefined
  });
  const count = root.querySelector('[data-gallery-count]');
  const updateCount = () => {
    if (count) count.textContent = `${String(gallery.realIndex + 1).padStart(2, '0')} / ${String(gallery.slides.length).padStart(2, '0')}`;
  };
  gallery.on('slideChange', updateCount);
  updateCount();
  gallery.update();

  return {
    destroy() {
      gallery.destroy(true, true);
      thumbs?.destroy(true, true);
    }
  };
};

const projectOpeners = [...document.querySelectorAll('[data-open-project]')];
projectOpeners.forEach(button => button.addEventListener('click', () => {
  const dialog = document.getElementById('project-dialog-' + button.dataset.openProject);
  if (!dialog || dialog.open) return;
  activeProjectOpener = button;
  dialog.showModal();
  dialog._projectGallery = createGallery(dialog);
  dialog.querySelector('[data-close-project]')?.focus();
}));

document.querySelectorAll('[data-project-dialog]').forEach(dialog => {
  dialog.querySelector('[data-close-project]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    dialog._projectGallery?.destroy();
    dialog._projectGallery = undefined;
    activeProjectOpener?.focus();
    activeProjectOpener = undefined;
  });
});
