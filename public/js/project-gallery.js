const filters = [...document.querySelectorAll('[data-project-filter]')];
const cards = [...document.querySelectorAll('[data-project-category]')];
const viewer = document.querySelector('#project-image-viewer');
const viewerImage = viewer?.querySelector('[data-viewer-image]');
const viewerCaption = viewer?.querySelector('[data-viewer-caption]');

filters.forEach(button => button.addEventListener('click', () => {
  const category = button.dataset.projectFilter;
  filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  cards.forEach(card => { card.hidden = category !== 'all' && card.dataset.projectCategory !== category; });
}));

document.querySelectorAll('[data-gallery-image]').forEach(button => button.addEventListener('click', () => {
  if (!viewer || !viewerImage || !viewerCaption) return;
  viewerImage.src = button.dataset.imageSrc;
  viewerImage.alt = button.dataset.imageAlt || '';
  viewerCaption.textContent = button.dataset.imageCaption || '';
  viewer.showModal();
}));

document.querySelector('[data-close-image]')?.addEventListener('click', () => viewer?.close());
viewer?.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
