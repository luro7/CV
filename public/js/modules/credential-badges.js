export function initCredentialBadges() {
  document.querySelectorAll('.credential-card-link[href]').forEach(link => {
    const url = new URL(link.href);
    if (url.hostname !== 'skillsoft.digitalbadges.skillsoft.com') return;

    const credentialId = url.pathname.split('/').filter(Boolean).at(-1);
    const art = link.querySelector('.credential-art');
    if (!credentialId || !art) return;

    const frame = document.createElement('iframe');
    frame.className = 'skillsoft-badge-embed';
    frame.src = `https://skillsoft.digitalbadges.skillsoft.com/embed/${credentialId}`;
    frame.title = `${link.querySelector('h4')?.textContent?.trim() || 'Skillsoft credential'} badge`;
    frame.loading = 'lazy';
    frame.setAttribute('aria-hidden', 'true');
    frame.setAttribute('tabindex', '-1');

    art.classList.remove('credential-art-label');
    art.classList.add('credential-art-embed');
    art.replaceChildren(frame);
  });
}
