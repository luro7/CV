import translations from './translations.js';

const openGallery = window.GLightbox;

if (typeof openGallery === 'function') {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gallery = openGallery({
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

  let navigationFrame = 0;
  let dragPositionFrame = 0;
  let observedImage = null;
  let dragStartX = null;
  let dragTimer = 0;
  let dragContainer = null;
  let dragBaseline = null;
  const imageObserver = typeof ResizeObserver === 'function'
    ? new ResizeObserver(() => positionNavigation())
    : null;

  function updateNavigationPosition() {
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
    const top = Math.min(frame.height - safe - 50, Math.max(safe, centerY - 25));
    const previousLeft = picture.left - frame.left - gap - previousWidth;
    const nextLeft = picture.right - frame.left + gap;
    const hasPreviousSpace = previousLeft >= safe;
    const hasNextSpace = nextLeft + nextWidth <= frame.width - safe;

    previous.style.visibility = hasPreviousSpace ? 'visible' : 'hidden';
    previous.style.pointerEvents = hasPreviousSpace ? '' : 'none';
    previous.setAttribute('aria-hidden', String(!hasPreviousSpace));
    next.style.visibility = hasNextSpace ? 'visible' : 'hidden';
    next.style.pointerEvents = hasNextSpace ? '' : 'none';
    next.setAttribute('aria-hidden', String(!hasNextSpace));

    if (hasPreviousSpace) previous.style.left = `${previousLeft}px`;
    if (hasNextSpace) next.style.left = `${nextLeft}px`;
    previous.style.right = 'auto';
    previous.style.top = `${top}px`;
    next.style.right = 'auto';
    next.style.top = `${top}px`;
  }

  function positionNavigation() {
    if (navigationFrame) cancelAnimationFrame(navigationFrame);
    navigationFrame = requestAnimationFrame(() => {
      navigationFrame = requestAnimationFrame(() => {
        navigationFrame = 0;
        updateNavigationPosition();
      });
    });
  }

  function finishNavigationDrag() {
    if (!dragContainer) return;
    window.clearTimeout(dragTimer);
    const container = dragContainer;
    container.classList.remove('gallery-is-dragging');
    dragContainer = null;
    dragStartX = null;
    dragBaseline = null;
  }

  function onPointerDown(event) {
    if (event.button !== 0 && event.pointerType !== 'touch') return;
    const image = event.target.closest('.glightbox-container .gslide.current .gslide-image img');
    const container = event.target.closest('.glightbox-container .gcontainer');
    if (!image || !container || image.closest('.gslide')?.classList.contains('zoomed')) return;
    finishNavigationDrag();
    const frame = container.getBoundingClientRect();
    const previous = document.querySelector('.glightbox-container .gprev');
    const next = document.querySelector('.glightbox-container .gnext');
    if (!previous || !next) return;
    const previousRect = previous.getBoundingClientRect();
    const nextRect = next.getBoundingClientRect();
    dragContainer = container;
    dragStartX = event.clientX;
    dragBaseline = {
      frameLeft: frame.left,
      frameWidth: frame.width,
      previousLeft: previousRect.left - frame.left,
      previousTop: previousRect.top - frame.top,
      previousWidth: previousRect.width,
      previousVisible: getComputedStyle(previous).visibility === 'visible',
      nextLeft: nextRect.left - frame.left,
      nextTop: nextRect.top - frame.top,
      nextWidth: nextRect.width,
      nextVisible: getComputedStyle(next).visibility === 'visible'
    };
    container.classList.add('gallery-is-dragging');
  }

  function onPointerMove(event) {
    if (dragStartX === null || !dragContainer) return;
    const delta = event.clientX - dragStartX;
    if (dragPositionFrame) cancelAnimationFrame(dragPositionFrame);
    dragPositionFrame = requestAnimationFrame(() => {
      dragPositionFrame = 0;
      const image = document.querySelector('.glightbox-container .gslide.current .gslide-image img');
      if (!image || !dragBaseline) return;
      const picture = image.getBoundingClientRect();
      const gap = 18;
      const safe = 12;
      const previous = document.querySelector('.glightbox-container .gprev');
      const next = document.querySelector('.glightbox-container .gnext');

      if (delta < 0 && dragBaseline.previousVisible) {
        if (!previous) return;
        next.style.left = `${dragBaseline.nextLeft}px`;
        next.style.top = `${dragBaseline.nextTop}px`;
        next.style.visibility = dragBaseline.nextVisible ? 'visible' : 'hidden';
        next.style.pointerEvents = dragBaseline.nextVisible ? '' : 'none';
        next.setAttribute('aria-hidden', String(!dragBaseline.nextVisible));
        const left = Math.min(dragBaseline.previousLeft, picture.left - dragBaseline.frameLeft - gap - dragBaseline.previousWidth);
        const hasSpace = left >= safe;
        previous.style.visibility = hasSpace ? 'visible' : 'hidden';
        previous.style.pointerEvents = hasSpace ? '' : 'none';
        previous.setAttribute('aria-hidden', String(!hasSpace));
        if (hasSpace) previous.style.left = `${left}px`;
      } else if (delta < 0) {
        next.style.left = `${dragBaseline.nextLeft}px`;
        next.style.top = `${dragBaseline.nextTop}px`;
        next.style.visibility = dragBaseline.nextVisible ? 'visible' : 'hidden';
        next.style.pointerEvents = dragBaseline.nextVisible ? '' : 'none';
        next.setAttribute('aria-hidden', String(!dragBaseline.nextVisible));
      } else if (delta > 0 && dragBaseline.nextVisible) {
        if (!next) return;
        previous.style.left = `${dragBaseline.previousLeft}px`;
        previous.style.top = `${dragBaseline.previousTop}px`;
        previous.style.visibility = dragBaseline.previousVisible ? 'visible' : 'hidden';
        previous.style.pointerEvents = dragBaseline.previousVisible ? '' : 'none';
        previous.setAttribute('aria-hidden', String(!dragBaseline.previousVisible));
        const left = Math.max(dragBaseline.nextLeft, picture.right - dragBaseline.frameLeft + gap);
        const hasSpace = left + dragBaseline.nextWidth <= dragBaseline.frameWidth - safe;
        next.style.visibility = hasSpace ? 'visible' : 'hidden';
        next.style.pointerEvents = hasSpace ? '' : 'none';
        next.setAttribute('aria-hidden', String(!hasSpace));
        if (hasSpace) next.style.left = `${left}px`;
      } else if (delta > 0) {
        previous.style.left = `${dragBaseline.previousLeft}px`;
        previous.style.top = `${dragBaseline.previousTop}px`;
        previous.style.visibility = dragBaseline.previousVisible ? 'visible' : 'hidden';
        previous.style.pointerEvents = dragBaseline.previousVisible ? '' : 'none';
        previous.setAttribute('aria-hidden', String(!dragBaseline.previousVisible));
      } else if (delta === 0) {
        previous.style.left = `${dragBaseline.previousLeft}px`;
        previous.style.top = `${dragBaseline.previousTop}px`;
        previous.style.visibility = dragBaseline.previousVisible ? 'visible' : 'hidden';
        previous.style.pointerEvents = dragBaseline.previousVisible ? '' : 'none';
        previous.setAttribute('aria-hidden', String(!dragBaseline.previousVisible));
        next.style.left = `${dragBaseline.nextLeft}px`;
        next.style.top = `${dragBaseline.nextTop}px`;
        next.style.visibility = dragBaseline.nextVisible ? 'visible' : 'hidden';
        next.style.pointerEvents = dragBaseline.nextVisible ? '' : 'none';
        next.setAttribute('aria-hidden', String(!dragBaseline.nextVisible));
      }
    });
  }

  function onPointerUp() {
    if (dragStartX === null) return;
    // Let GLightbox complete its slide gesture first; otherwise restore the arrows
    // after a short drag that did not change the active image.
    window.clearTimeout(dragTimer);
    dragTimer = window.setTimeout(() => {
      finishNavigationDrag();
      positionNavigation();
    }, 420);
  }

  function onGlobalMouseUp(event) {
    const image = document.querySelector('.glightbox-container .gslide.current .gslide-image img.dragging');
    if (!image) return;

    // GLightbox listens for mouseup on the image itself. If the pointer is released
    // outside it, forward one cleanup event so its drag state and grabbing cursor reset.
    if (event.target !== image && !image.contains(event.target)) {
      image.dispatchEvent(new MouseEvent('mouseup', {
        bubbles: false,
        cancelable: true,
        clientX: event.clientX,
        clientY: event.clientY,
        button: event.button,
        buttons: 0
      }));
    }

    image.classList.remove('dragging');
    image.closest('.gslide')?.classList.remove('dragging-nav');
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
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('pointermove', onPointerMove, { capture: true, passive: true });
    document.addEventListener('pointerup', onPointerUp, true);
    document.addEventListener('pointercancel', onPointerUp, true);
    document.addEventListener('mouseup', onGlobalMouseUp, true);
  });

  gallery.on('slide_changed', () => {
    finishNavigationDrag();
    positionNavigation();
  });
  gallery.on('slide_after_load', positionNavigation);
  gallery.on('close', () => {
    window.removeEventListener('resize', positionNavigation);
    document.removeEventListener('pointerdown', onPointerDown, true);
    document.removeEventListener('pointermove', onPointerMove, true);
    document.removeEventListener('pointerup', onPointerUp, true);
    document.removeEventListener('pointercancel', onPointerUp, true);
    document.removeEventListener('mouseup', onGlobalMouseUp, true);
    finishNavigationDrag();
    if (navigationFrame) cancelAnimationFrame(navigationFrame);
    if (dragPositionFrame) cancelAnimationFrame(dragPositionFrame);
    imageObserver?.disconnect();
    observedImage = null;
  });
}
