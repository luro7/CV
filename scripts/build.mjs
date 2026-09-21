import { readFileSync, mkdirSync, cpSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { render } from '../src/render.mjs';
export const root = fileURLToPath(new URL('../', import.meta.url));
export const output = resolve(root, 'dist');
export function build() {
  const site = JSON.parse(readFileSync(resolve(root, 'Content/site.json'), 'utf8'));
  const html = render(site);
  mkdirSync(output, { recursive: true });
  cpSync(resolve(root, 'public'), output, { recursive: true });
  const translations = JSON.parse(readFileSync(resolve(root, 'Content/locales/es.json'), 'utf8'));
  writeFileSync(resolve(output, 'js/translations.js'), `export default ${JSON.stringify(translations)};\n`);
  writeFileSync(resolve(output, 'index.html'), html);
  console.log('Web generada: dist/');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) build();
