const credentialDescriptions = new Map([
  ['a42c4332-35ac-47e7-b437-99037b692bf8', 'Demonstrates understanding and practical expertise in applying agentic AI to real-world challenges through foundational learning, hands-on workshops, and expert-led content focused on using AI agents to drive reinvention.'],
  ['a18db90b-3b9f-4e06-961c-92f686679d34', 'Covers the fundamentals of generative AI APIs and how they can be used to build practical applications, including common capabilities, integration patterns, and considerations when working with generative models through APIs.'],
  ['c736b38b-c866-49f1-82ed-57cdf5887686', 'Introduces core artificial intelligence and machine learning concepts, approaches, and practical applications, including how learning systems use data to recognize patterns, make predictions, and support automated decision-making.'],
  ['46214cad-397c-464e-ba48-fe46368e78d0', 'Explores prompt-engineering techniques for ChatGPT through practical examples and use cases, with emphasis on writing clear and concise prompts, reducing bias, and iterating prompts to improve model output.'],
  ['9885d253-7eaa-4e93-8d5e-7dd872fd6d48', 'Covers application-security fundamentals and the importance of validating security throughout the software lifecycle, including recognizing common weaknesses and applying secure development practices.'],
  ['414e9a71-cc0c-409c-9d07-7bb33aa22a04', 'Focuses on protecting APIs and the data they expose, covering common API risks, authentication and authorization considerations, secure communication, and practices for reducing vulnerabilities in API-based systems.'],
  ['e3e76a9b-95af-4da6-be4a-c6563d7993fe', 'Explores secure application architecture and identity and access management, including authentication, authorization, access control, and architectural practices used to reduce security risk.'],
  ['e76f6824-61cc-43d2-9624-b6799e3620d2', 'Reviews the OWASP Top 10 categories of web-application security risks, helping identify common vulnerabilities and understand the defensive practices used to reduce their impact.']
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
  document.querySelectorAll('.certification-card').forEach(card => {
    const id = credentialIdFrom(card);
    const description = credentialDescriptions.get(id);
    const info = card.querySelector('.credential-info');
    const actions = card.querySelector('.credential-actions');
    if (!description || !info || !actions || info.querySelector('.credential-description')) return;

    const paragraph = document.createElement('p');
    paragraph.className = 'credential-description';
    paragraph.textContent = description;
    info.insertBefore(paragraph, actions);
  });
}
