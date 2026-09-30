import translations from './translations.js';

// The library owns slides and gestures; this module owns gallery controls.
export function initProjectGallery() {
  if (typeof window.GLightbox !== 'function') return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const translate = text => document.documentElement.lang === 'es' ? translations[text] || text : text;
  const gallery = window.GLightbox({
    selector: '.project-lightbox-link',
    touchNavigation: true,
    touchFollowAxis: true,
    keyboardNavigation: true,
    zoomable: false,
    draggable: true,
    loop: true,
    preload: true,
    moreLength: 0,
    openEffect: reducedMotion ? 'none' : 'fade',
    closeEffect: reducedMotion ? 'none' : 'fade',
    slideEffect: reducedMotion ? 'none' : 'slide',
    closeOnOutsideClick: true
  });
  let sources = [];
  let chrome = null;
  let trigger = null;

  document.addEventListener('click', event => {
    const source = event.target.closest('.project-lightbox-link[data-gallery]');
    if (!source) return;
    trigger = document.activeElement?.matches('[data-open-project-gallery]') ? document.activeElement : source;
    sources = [...document.querySelectorAll('.project-lightbox-link[data-gallery]')]
      .filter(link => link.dataset.gallery === source.dataset.gallery);
  }, true);

  function updateChrome() {
    if (!chrome || !sources.length) return;
    const index = gallery.getActiveSlideIndex();
    const source = sources[index];
    if (!source) return;
    chrome.querySelector('.project-gallery-title').textContent = source.dataset.title;
    chrome.querySelector('.project-gallery-caption').textContent = source.dataset.description;
    chrome.querySelector('.project-gallery-counter').textContent = `${index + 1} / ${sources.length}`;
    chrome.querySelectorAll('.project-gallery-thumb').forEach((button, position) => {
      const active = position === index;
      button.classList.toggle('is-active', active);
      if (active) {
        button.setAttribute('aria-current', 'true');
        // Scroll the rail only, keeping the underlying CV in place.
        const rail = button.parentElement;
        rail.scrollTo({ left: button.offsetLeft - rail.offsetLeft - rail.clientWidth / 2 + button.clientWidth / 2,
          behavior: reducedMotion ? 'auto' : 'smooth' });
      } else button.removeAttribute('aria-current');
    });
  }

  gallery.on('open', () => {
    const container = document.querySelector('.glightbox-container');
    if (!container || !sources.length) return;
    container.setAttribute('role', 'dialog');
    container.setAttribute('aria-modal', 'true');
    container.setAttribute('aria-label', sources[0].dataset.title);
    for (const [selector, label] of Object.entries({ '.gclose': 'Close gallery', '.gprev': 'Previous image', '.gnext': 'Next image' })) {
      const control = container.querySelector(selector);
      control?.setAttribute('aria-label', translate(label));
      control?.setAttribute('title', translate(label));
    }
    chrome = document.createElement('div');
    chrome.className = 'project-gallery-chrome';
    chrome.addEventListener('click', event => event.stopPropagation());
    const copy = document.createElement('div');
    copy.className = 'project-gallery-copy';
    const title = document.createElement('strong');
    title.className = 'project-gallery-title';
    const caption = document.createElement('p');
    caption.className = 'project-gallery-caption';
    const counter = document.createElement('span');
    counter.className = 'project-gallery-counter';
    counter.setAttribute('aria-live', 'polite');
    copy.append(title, caption, counter);
    chrome.append(copy);
    if (sources.length > 1) {
      const rail = document.createElement('div');
      rail.className = 'project-gallery-thumbs';
      rail.setAttribute('role', 'group');
      rail.setAttribute('aria-label', document.documentElement.lang === 'es' ? 'Miniaturas del proyecto' : 'Project thumbnails');
      sources.forEach((source, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'project-gallery-thumb';
        button.setAttribute('aria-label', source.dataset.description);
        const image = document.createElement('img');
        image.src = source.href;
        image.alt = '';
        image.loading = 'lazy';
        image.decoding = 'async';
        button.append(image);
        button.addEventListener('click', event => {
          event.preventDefault();
          event.stopPropagation();
          gallery.goToSlide(index);
        });
        rail.append(button);
      });
      chrome.append(rail);
    }
    container.querySelector('.gcontainer').append(chrome);
    updateChrome();
    container.querySelector('.gclose')?.focus();
    container.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const controls = [...container.querySelectorAll('button, [href]')]
        .filter(control => !control.disabled && control.getClientRects().length && getComputedStyle(control).display !== 'none');
      const position = controls.indexOf(document.activeElement);
      if (!controls.length) return;
      event.preventDefault();
      event.stopPropagation();
      controls[(position + (event.shiftKey ? -1 : 1) + controls.length) % controls.length].focus();
    });
  });
  gallery.on('slide_changed', updateChrome);
  gallery.on('close', () => {
    chrome?.remove();
    chrome = null;
    sources = [];
    trigger?.focus({ preventScroll: true });
    trigger = null;
  });
}
