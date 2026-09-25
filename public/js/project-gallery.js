import translations from './translations.js';

const openGallery = window.GLightbox;

if (typeof openGallery === 'function') {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gallery = openGallery({
    selector: '.project-lightbox-link',
    touchNavigation: true,
    touchFollowAxis: true,
    keyboardNavigation: true,
    zoomable: true,
    draggable: true,
    loop: true,
    preload: true,
    moreLength: 0,
    openEffect: reducedMotion ? 'none' : 'fade',
    closeEffect: reducedMotion ? 'none' : 'fade',
    slideEffect: reducedMotion ? 'none' : 'slide',
    closeOnOutsideClick: true
  });

  let navigationFrame = 0;
  let observedImage = null;
  const imageObserver = typeof ResizeObserver === 'function'
    ? new ResizeObserver(() => positionNavigation())
    : null;

  function positionNavigation() {
    if (navigationFrame) cancelAnimationFrame(navigationFrame);
    navigationFrame = requestAnimationFrame(() => {
      navigationFrame = requestAnimationFrame(() => {
        const container = document.querySelector('.glightbox-container .gcontainer');
        const image = document.querySelector('.glightbox-container .gslide.current .gslide-image img');
        const previous = document.querySelector('.glightbox-container .gprev');
        const next = document.querySelector('.glightbox-container .gnext');
        if (!container || !image || !previous || !next) return;

        if (observedImage !== image) {
          if (observedImage) imageObserver?.unobserve(observedImage);
          observedImage = image;
          imageObserver?.observe(image);
          image.addEventListener('load', positionNavigation, { once: true });
        }

        const frame = container.getBoundingClientRect();
        const picture = image.getBoundingClientRect();
        const previousWidth = previous.getBoundingClientRect().width || 40;
        const nextWidth = next.getBoundingClientRect().width || 40;
        const gap = 18;
        const safe = 12;
        const centerY = picture.top - frame.top + picture.height / 2;
        const leftLimit = safe;
        const rightLimit = Math.max(safe, frame.width - safe);
        const previousLeft = Math.min(rightLimit - previousWidth, Math.max(leftLimit, picture.left - frame.left - gap - previousWidth));
        const nextLeft = Math.min(rightLimit - nextWidth, Math.max(leftLimit, picture.right - frame.left + gap));
        const top = Math.min(frame.height - safe - 50, Math.max(safe, centerY - 25));

        previous.style.left = `${previousLeft}px`;
        previous.style.right = 'auto';
        previous.style.top = `${top}px`;
        next.style.left = `${nextLeft}px`;
        next.style.right = 'auto';
        next.style.top = `${top}px`;
      });
    });
  }

  gallery.on('open', () => {
    const translate = text => document.documentElement.lang === 'es' ? translations[text] || text : text;
    const labels = {
      '.gclose': 'Close gallery',
      '.gprev': 'Previous image',
      '.gnext': 'Next image'
    };
    for (const [selector, label] of Object.entries(labels)) {
      const control = document.querySelector(selector);
      if (control) {
        control.setAttribute('aria-label', translate(label));
        control.setAttribute('title', translate(label));
      }
    }
    positionNavigation();
    window.addEventListener('resize', positionNavigation);
  });

  gallery.on('slide_changed', positionNavigation);
  gallery.on('slide_after_load', positionNavigation);
  gallery.on('close', () => {
    window.removeEventListener('resize', positionNavigation);
    imageObserver?.disconnect();
    observedImage = null;
  });
}
