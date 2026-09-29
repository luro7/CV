const descriptions = {
  en: new Map([
    ['a42c4332-35ac-47e7-b437-99037b692bf8', 'Demonstrates understanding and practical expertise in applying agentic AI to real-world challenges through foundational learning, hands-on workshops, and expert-led content focused on using AI agents to drive reinvention.'],
    ['a18db90b-3b9f-4e06-961c-92f686679d34', 'Covers the fundamentals of generative AI APIs and how they can be used to build practical applications, including common capabilities, integration patterns, and considerations when working with generative models through APIs.'],
    ['c736b38b-c866-49f1-82ed-57cdf5887686', 'Introduces core artificial intelligence and machine learning concepts, approaches, and practical applications, including how learning systems use data to recognize patterns, make predictions, and support automated decision-making.'],
    ['46214cad-397c-464e-ba48-fe46368e78d0', 'Explores prompt-engineering techniques for ChatGPT through practical examples and use cases, with emphasis on writing clear and concise prompts, reducing bias, and iterating prompts to improve model output.'],
    ['9885d253-7eaa-4e93-8d5e-7dd872fd6d48', 'Covers application-security fundamentals and the importance of validating security throughout the software lifecycle, including recognizing common weaknesses and applying secure development practices.'],
    ['414e9a71-cc0c-409c-9d07-7bb33aa22a04', 'Focuses on protecting APIs and the data they expose, covering common API risks, authentication and authorization considerations, secure communication, and practices for reducing vulnerabilities in API-based systems.'],
    ['e3e76a9b-95af-4da6-be4a-c6563d7993fe', 'Explores secure application architecture and identity and access management, including authentication, authorization, access control, and architectural practices used to reduce security risk.'],
    ['e76f6824-61cc-43d2-9624-b6799e3620d2', 'Reviews the OWASP Top 10 categories of web-application security risks, helping identify common vulnerabilities and understand the defensive practices used to reduce their impact.']
  ]),
  es: new Map([
    ['a42c4332-35ac-47e7-b437-99037b692bf8', 'Demuestra comprensión y experiencia práctica para aplicar IA agéntica a desafíos reales mediante fundamentos, talleres prácticos y contenido guiado por expertos enfocado en utilizar agentes de IA para impulsar la reinvención.'],
    ['a18db90b-3b9f-4e06-961c-92f686679d34', 'Cubre los fundamentos de las APIs de IA generativa y su uso para crear aplicaciones prácticas, incluyendo capacidades habituales, patrones de integración y consideraciones al trabajar con modelos generativos mediante APIs.'],
    ['c736b38b-c866-49f1-82ed-57cdf5887686', 'Introduce conceptos, enfoques y aplicaciones prácticas de inteligencia artificial y machine learning, incluyendo cómo los sistemas utilizan datos para reconocer patrones, realizar predicciones y apoyar decisiones automatizadas.'],
    ['46214cad-397c-464e-ba48-fe46368e78d0', 'Explora técnicas de prompt engineering para ChatGPT mediante ejemplos y casos de uso prácticos, con foco en redactar prompts claros y concisos, reducir sesgos e iterar para mejorar los resultados del modelo.'],
    ['9885d253-7eaa-4e93-8d5e-7dd872fd6d48', 'Cubre fundamentos de seguridad de aplicaciones y la importancia de validar la seguridad durante el ciclo de vida del software, incluyendo la identificación de vulnerabilidades comunes y prácticas de desarrollo seguro.'],
    ['414e9a71-cc0c-409c-9d07-7bb33aa22a04', 'Se enfoca en proteger APIs y los datos que exponen, cubriendo riesgos habituales, autenticación y autorización, comunicación segura y prácticas para reducir vulnerabilidades en sistemas basados en APIs.'],
    ['e3e76a9b-95af-4da6-be4a-c6563d7993fe', 'Explora arquitectura segura de aplicaciones y gestión de identidades y accesos, incluyendo autenticación, autorización, control de acceso y prácticas de arquitectura orientadas a reducir riesgos de seguridad.'],
    ['e76f6824-61cc-43d2-9624-b6799e3620d2', 'Repasa las categorías OWASP Top 10 de riesgos de seguridad en aplicaciones web, ayudando a identificar vulnerabilidades frecuentes y comprender las prácticas defensivas utilizadas para reducir su impacto.']
  ])
};

const artworkOverrides = new Map([
  ['9885d253-7eaa-4e93-8d5e-7dd872fd6d48', 'https://api.accredible.com/v1/frontend/credential_badge_image/31919885'],
  ['e76f6824-61cc-43d2-9624-b6799e3620d2', 'https://api.accredible.com/v1/frontend/credential_badge_image/32000909']
]);

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
    const artwork = artworkOverrides.get(id);

    if (image && artwork) image.src = artwork;

    if (!description || !info || !actions || info.querySelector('.credential-description')) return;

    const paragraph = document.createElement('p');
    paragraph.className = 'credential-description';
    paragraph.textContent = description;
    info.insertBefore(paragraph, actions);
  });
}
