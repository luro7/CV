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
  });
}
