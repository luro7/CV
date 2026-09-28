const badgeImages = new Map([
  ['46214cad-397c-464e-ba48-fe46368e78d0', 'https://api.accredible.com/v1/frontend/credential_badge_image/103507875'],
  ['9885d253-7eaa-4e93-8d5e-7dd872fd6d48', 'https://api.accredible.com/v1/frontend/credential_badge_image/31919885'],
  ['414e9a71-cc0c-409c-9d07-7bb33aa22a04', 'https://api.accredible.com/v1/frontend/credential_badge_image/32000818'],
  ['e3e76a9b-95af-4da6-be4a-c6563d7993fe', 'https://api.accredible.com/v1/frontend/credential_badge_image/31921777'],
  ['e76f6824-61cc-43d2-9624-b6799e3620d2', 'https://api.accredible.com/v1/frontend/credential_badge_image/32000909']
]);

export function initCredentialBadges() {
  document.querySelectorAll('.credential-card-link[href]').forEach(link => {
    const credentialId = new URL(link.href).pathname.split('/').filter(Boolean).at(-1);
    const source = badgeImages.get(credentialId);
    const art = link.querySelector('.credential-art-label');
    if (!source || !art) return;

    const image = new Image();
    image.alt = '';
    image.width = 400;
    image.height = 400;
    image.loading = 'lazy';
    image.decoding = 'async';

    image.addEventListener('load', () => {
      art.classList.remove('credential-art-label');
      art.replaceChildren(image);
    }, { once: true });

    // Keep the existing text fallback if the remote badge artwork is unavailable.
    image.addEventListener('error', () => {}, { once: true });
    image.src = source;
  });
}
