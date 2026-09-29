const descriptions = {
  en: new Map([
    ['a42c4332-35ac-47e7-b437-99037b692bf8', 'Applies agentic AI concepts to practical business and technology scenarios.'],
    ['a18db90b-3b9f-4e06-961c-92f686679d34', 'Introduces generative AI APIs and their use in practical applications.'],
    ['c736b38b-c866-49f1-82ed-57cdf5887686', 'Covers core AI and machine learning concepts and applications.'],
    ['46214cad-397c-464e-ba48-fe46368e78d0', 'Covers practical prompt-engineering techniques and ChatGPT use cases.'],
    ['9885d253-7eaa-4e93-8d5e-7dd872fd6d48', 'Covers application-security fundamentals and secure development practices.'],
    ['414e9a71-cc0c-409c-9d07-7bb33aa22a04', 'Covers common API risks and core security practices.'],
    ['e3e76a9b-95af-4da6-be4a-c6563d7993fe', 'Covers secure architecture, authentication, authorization, and access control.'],
    ['e76f6824-61cc-43d2-9624-b6799e3620d2', 'Reviews the OWASP Top 10 web-application security risks.']
  ]),
  es: new Map([
    ['a42c4332-35ac-47e7-b437-99037b692bf8', 'Aplica conceptos de IA agéntica a escenarios prácticos de negocio y tecnología.'],
    ['a18db90b-3b9f-4e06-961c-92f686679d34', 'Introduce APIs de IA generativa y su uso en aplicaciones prácticas.'],
    ['c736b38b-c866-49f1-82ed-57cdf5887686', 'Cubre conceptos y aplicaciones fundamentales de IA y machine learning.'],
    ['46214cad-397c-464e-ba48-fe46368e78d0', 'Cubre técnicas prácticas de prompt engineering y casos de uso de ChatGPT.'],
    ['9885d253-7eaa-4e93-8d5e-7dd872fd6d48', 'Cubre fundamentos de seguridad de aplicaciones y desarrollo seguro.'],
    ['414e9a71-cc0c-409c-9d07-7bb33aa22a04', 'Cubre riesgos habituales de APIs y prácticas esenciales de seguridad.'],
    ['e3e76a9b-95af-4da6-be4a-c6563d7993fe', 'Cubre arquitectura segura, autenticación, autorización y control de acceso.'],
    ['e76f6824-61cc-43d2-9624-b6799e3620d2', 'Repasa los principales riesgos de seguridad web del OWASP Top 10.']
  ])
};

function credentialIdFrom(card) {
  const provider = card.dataset.credentialProvider;
  const directId = card.dataset.credentialId?.trim();
  if (directId) return directId;

  if (provider !== 'credly') return '';

  try {
    const url = new URL(card.dataset.credentialUrl || '');
    const parts = url.pathname.split('/').filter(Boolean);
    const badgeIndex = parts.indexOf('badges');
    return badgeIndex >= 0 ? (parts[badgeIndex + 1] || '') : '';
  } catch {
    return '';
  }
}

export function initCredentialDescriptions() {
  const language = document.documentElement.lang?.toLowerCase().startsWith('es') ? 'es' : 'en';
  const localizedDescriptions = descriptions[language];

  document.querySelectorAll('.certification-card').forEach(card => {
    const id = credentialIdFrom(card);
    const description = localizedDescriptions.get(id);
    const info = card.querySelector('.credential-info');
    const actions = card.querySelector('.credential-actions');
    const image = card.querySelector('.credential-art img');

    if (image) {
      const originalSrc = image.getAttribute('src');
      if (originalSrc?.startsWith('/assets/credentials/')) {
        image.loading = 'eager';
        image.src = originalSrc.split('?')[0] + '?v=credential-badges-20260929c';
      }
    }

    if (!description || !info || !actions || info.querySelector('.credential-description')) return;

    const paragraph = document.createElement('p');
    paragraph.className = 'credential-description';
    paragraph.textContent = description;
    info.insertBefore(paragraph, actions);
  });
}
