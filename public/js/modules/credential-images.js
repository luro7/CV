export class CredentialImageRegistry {
  static images = new Map([
    ['f3357bee-cd6a-11f1-8e57-af708f98066f', '/assets/credentials/udacity-data-analyst.svg'],
    ['fe6d913c-cd64-11f1-a2f6-9f197f889d6c', '/assets/credentials/udacity-tq-physical-ai.svg'],
    ['a42c4332-35ac-47e7-b437-99037b692bf8', '/assets/credentials/accenture-agentic-ai.png'],
    ['a18db90b-3b9f-4e06-961c-92f686679d34', '/assets/credentials/skillsoft-generative-ai.png'],
    ['c736b38b-c866-49f1-82ed-57cdf5887686', '/assets/credentials/skillsoft-ai-machine-learning.png'],
    ['46214cad-397c-464e-ba48-fe46368e78d0', '/assets/credentials/skillsoft-chatgpt-prompt-engineering.svg'],
    ['9885d253-7eaa-4e93-8d5e-7dd872fd6d48', '/assets/credentials/skillsoft-application-security.svg'],
    ['414e9a71-cc0c-409c-9d07-7bb33aa22a04', '/assets/credentials/skillsoft-api-security.png'],
    ['e3e76a9b-95af-4da6-be4a-c6563d7993fe', '/assets/credentials/skillsoft-secure-application-iam.png'],
    ['e76f6824-61cc-43d2-9624-b6799e3620d2', '/assets/credentials/skillsoft-top-10-list.svg']
  ]);

  static credentialId(card) {
    const directId = card.dataset.credentialId?.trim();
    if (directId) return directId;

    try {
      const url = new URL(card.dataset.credentialUrl || '');
      const parts = url.pathname.split('/').filter(Boolean);
      const badgeIndex = parts.indexOf('badges');
      return badgeIndex >= 0 ? (parts[badgeIndex + 1] || '') : (parts[0] || '');
    } catch {
      return '';
    }
  }

  static apply() {
    document.querySelectorAll('.certification-card').forEach(card => {
      const image = card.querySelector('.credential-art img');
      const imagePath = this.images.get(this.credentialId(card));
      if (!image || !imagePath) return;

      image.src = imagePath + '?v=udacity-certificates-20261026';
      image.loading = 'eager';
      image.decoding = 'async';
    });
  }
}

export function initCredentialImages() {
  CredentialImageRegistry.apply();
}
