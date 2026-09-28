export function initCredentialBadges() {
  const dialog = document.querySelector('#credential-dialog');
  const dialogFrame = dialog?.querySelector('[data-credential-dialog-frame]');
  const dialogTitle = dialog?.querySelector('[data-credential-dialog-title]');
  const dialogExternal = dialog?.querySelector('[data-credential-dialog-external]');
  const dialogClose = dialog?.querySelector('[data-credential-dialog-close]');

  const closeDialog = () => {
    if (!dialog?.open) return;
    dialog.close();
  };

  dialogClose?.addEventListener('click', closeDialog);
  dialog?.addEventListener('click', event => {
    if (event.target === dialog) closeDialog();
  });
  dialog?.addEventListener('close', () => {
    if (dialogFrame) dialogFrame.removeAttribute('src');
  });

  document.querySelectorAll('.credential-card-link[href]').forEach(link => {
    const url = new URL(link.href);
    if (url.hostname !== 'skillsoft.digitalbadges.skillsoft.com') return;

    const credentialId = url.pathname.split('/').filter(Boolean).at(-1);
    const art = link.querySelector('.credential-art');
    const title = link.querySelector('h4')?.textContent?.trim() || 'Skillsoft credential';
    if (!credentialId || !art) return;

    const embedUrl = `https://skillsoft.digitalbadges.skillsoft.com/embed/${credentialId}`;
    const frame = document.createElement('iframe');
    frame.className = 'skillsoft-badge-embed';
    frame.src = embedUrl;
    frame.title = `${title} badge`;
    frame.loading = 'lazy';
    frame.setAttribute('aria-hidden', 'true');
    frame.setAttribute('tabindex', '-1');

    art.classList.remove('credential-art-label');
    art.classList.add('credential-art-embed');
    art.replaceChildren(frame);

    link.addEventListener('click', event => {
      if (!dialog || !dialogFrame || !dialogTitle || !dialogExternal) return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      event.preventDefault();
      dialogTitle.textContent = title;
      dialogFrame.src = embedUrl;
      dialogFrame.title = `${title} credential details`;
      dialogExternal.href = url.href;
      dialog.showModal();
    });
  });
}
