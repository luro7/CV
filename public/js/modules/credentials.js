const SKILLSOFT_HOST = 'skillsoft.digitalbadges.skillsoft.com';
const SKILLSOFT_ORIGIN = `https://${SKILLSOFT_HOST}`;

function skillsoftEmbedUrl(credentialId) {
  return `${SKILLSOFT_ORIGIN}/embed/${encodeURIComponent(credentialId)}`;
}

function isPrimaryActivation(event) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

export function initCredentials() {
  const dialog = document.querySelector('#credential-dialog');
  const dialogFrame = dialog?.querySelector('[data-credential-dialog-frame]');
  const dialogTitle = dialog?.querySelector('[data-credential-dialog-title]');
  const dialogExternal = dialog?.querySelector('[data-credential-dialog-external]');
  const dialogClose = dialog?.querySelector('[data-credential-dialog-close]');

  const closeDialog = () => {
    if (dialog?.open) dialog.close();
  };

  dialogClose?.addEventListener('click', closeDialog);
  dialog?.addEventListener('click', event => {
    if (event.target === dialog) closeDialog();
  });
  dialog?.addEventListener('close', () => {
    if (dialogFrame) dialogFrame.removeAttribute('src');
  });

  document.querySelectorAll('.certification-card[data-credential-provider="skillsoft"]').forEach(card => {
    const credentialId = card.dataset.credentialId?.trim();
    const credentialUrl = card.dataset.credentialUrl?.trim();
    const action = card.querySelector('[data-credential-details]');
    const title = card.querySelector('h4')?.textContent?.trim() || 'Skillsoft credential';
    if (!credentialId || !credentialUrl || !action) return;

    action.addEventListener('click', event => {
      if (!isPrimaryActivation(event) || !dialog || !dialogFrame || !dialogTitle || !dialogExternal) return;

      const embedUrl = skillsoftEmbedUrl(credentialId);
      dialogTitle.textContent = title;
      dialogFrame.src = embedUrl;
      dialogFrame.title = `${title} credential details`;
      dialogExternal.href = credentialUrl;
      dialog.showModal();
    });
  });
}
