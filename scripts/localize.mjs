const protectedBlockPattern = /<(script|style)\b[\s\S]*?<\/\1>/gi;

const translateValue = (value, translations) => translations[value] || value;

export function localizeHtml(html, translations) {
  const protectedBlocks = [];
  let localized = html.replace(protectedBlockPattern, block => {
    const token = '@@PROTECTED_BLOCK_' + protectedBlocks.length + '@@';
    protectedBlocks.push(block);
    return token;
  });

  localized = localized.replace(/\b(aria-label|title|placeholder)="([^"]*)"/g, (match, attr, value) => {
    return attr + '="' + translateValue(value, translations) + '"';
  });

  localized = localized.replace(/>([^<>]+)</g, (match, text) => {
    const trimmed = text.trim();
    if (!trimmed) return match;
    const translated = translateValue(trimmed, translations);
    if (translated === trimmed) return match;
    const leading = text.match(/^\s*/)?.[0] || '';
    const trailing = text.match(/\s*$/)?.[0] || '';
    return '>' + leading + translated + trailing + '<';
  });

  protectedBlocks.forEach((block, index) => {
    localized = localized.replace('@@PROTECTED_BLOCK_' + index + '@@', block);
  });

  return localized;
}
