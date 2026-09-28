export function initProjectShowcase() {
  document.querySelectorAll('.project-card[data-project-slug]').forEach(card => {
    const mediaLink = card.querySelector('.project-card-media .project-lightbox-link');
    const action = card.querySelector('[data-open-project-gallery]');

    if (action) {
      if (!mediaLink) {
        action.hidden = true;
      } else {
        action.addEventListener('click', () => mediaLink.click());
      }
    }

    if (card.dataset.projectCategory !== 'android' || !mediaLink) return;

    const cover = mediaLink.querySelector('.project-card-cover');
    const firstImage = cover?.querySelector('img');
    if (!cover || !firstImage) return;

    const gallerySource = document.getElementById(`project-gallery-${card.dataset.projectSlug}`);
    const sources = [
      firstImage.getAttribute('src'),
      ...Array.from(gallerySource?.querySelectorAll('.project-lightbox-link') || [], link => link.getAttribute('href'))
    ].filter(Boolean);
    const uniqueSources = [...new Set(sources)].slice(0, 3);
    if (uniqueSources.length < 2) return;

    const strip = document.createElement('span');
    strip.className = 'project-phone-strip';
    strip.setAttribute('aria-hidden', 'true');

    uniqueSources.forEach((source, index) => {
      const frame = document.createElement('span');
      frame.className = 'project-phone-shot';
      if (index === 1) frame.classList.add('is-primary');

      const image = document.createElement('img');
      image.src = source;
      image.alt = '';
      image.loading = 'lazy';
      image.decoding = 'async';

      frame.append(image);
      strip.append(frame);
    });

    cover.classList.add('project-card-cover--devices');
    cover.replaceChildren(strip);
  });
}
