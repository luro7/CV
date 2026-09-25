let activeProjectOpener;
const projectOpeners = [...document.querySelectorAll('[data-open-project]')];
projectOpeners.forEach(button => button.addEventListener('click', () => {
  const dialog = document.getElementById('project-dialog-' + button.dataset.openProject);
  if (!dialog || dialog.open) return;
  activeProjectOpener = button;
  dialog.showModal();
  dialog.querySelector('[data-close-project]')?.focus();
}));

document.querySelectorAll('[data-project-dialog]').forEach(dialog => {
  dialog.querySelector('[data-close-project]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    activeProjectOpener?.focus();
    activeProjectOpener = undefined;
  });
});
