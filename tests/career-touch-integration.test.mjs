import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { render } from '../src/render.mjs';

const site = JSON.parse(readFileSync(new URL('../content/site.json', import.meta.url), 'utf8'));
const translations = JSON.parse(readFileSync(new URL('../content/locales/es.json', import.meta.url), 'utf8'));
const companies = [...new Map(site.experience.map(role => [role.company, role])).values()];

for (const [language, dictionary] of [['en', {}], ['es', translations]]) {
  test(`${language} career render keeps every company, role disclosure and anchor target`, () => {
    const html = render(site, { language, translations: dictionary });
    const companyIds = companies.map(company => 'career-' + site.experience.find(role => role.company === company.company).id);
    const details = [...html.matchAll(/<details class="career-role-details"([^>]*)>/g)];

    assert.equal((html.match(/class="career-company"/g) || []).length, companies.length);
    assert.equal(details.length, site.experience.length);
    for (const id of companyIds) {
      assert.match(html, new RegExp(`id="${id}"`));
      assert.match(html, new RegExp(`href="#${id}"`));
    }
    assert.equal(details.filter(([, attributes]) => /\bopen\b/.test(attributes)).length,
      site.experience.filter(role => role.current).length);
    const htmlText = value => (dictionary[value] || value).replaceAll('&', '&amp;');
    for (const role of site.experience) {
      assert.ok(html.includes(htmlText(role.role)), `Missing rendered role: ${role.role}`);
      for (const point of role.points) assert.ok(html.includes(htmlText(point)), `Missing role detail: ${point}`);
    }
  });
}

test('career indicator only updates the current company link as the page scrolls', () => {
  const source = readFileSync(new URL('../public/js/modules/career-timeline.js', import.meta.url), 'utf8')
    .replace('export function', 'function');
  assert.doesNotMatch(source, /details|\.open\b/);
  const scrollListeners = {};
  const sectionListeners = {};
  const disclosureOpen = [true, false, false, false];
  let scrollY = 0;
  let scrollToCalls = 0;
  const links = companies.map((company, index) => ({
    hash: '#career-' + site.experience.find(role => role.company === company.company).id,
    attributes: index === 0 ? { 'aria-current': 'location' } : {},
    setAttribute(name, value) { this.attributes[name] = value; },
    removeAttribute(name) { delete this.attributes[name]; }
  }));
  const targets = new Map(links.map((link, index) => [link.hash, {
    id: link.hash.slice(1),
    getBoundingClientRect: () => ({ top: [0, 500, 1000][index] - scrollY })
  }]));
  const section = {
    querySelectorAll: () => links,
    querySelector: hash => targets.get(hash),
    addEventListener: (name, callback) => { sectionListeners[name] = callback; }
  };
  const frames = [];
  const context = vm.createContext({
    document: { querySelector: selector => selector === '#experience' ? section : null },
    innerHeight: 800,
    addEventListener: (name, callback, options) => { scrollListeners[name] = { callback, options }; },
    requestAnimationFrame: callback => frames.push(callback),
    scrollTo: () => { scrollToCalls += 1; }
  });
  vm.runInContext(`${source}; initCareerTimeline();`, context);

  assert.equal(links.filter(link => link.attributes['aria-current'] === 'location').length, 1);
  assert.equal(links[0].attributes['aria-current'], 'location');
  assert.equal(scrollListeners.scroll.options.passive, true);
  assert.equal(typeof scrollListeners.resize.callback, 'function');
  assert.equal(typeof sectionListeners.toggle, 'function');

  scrollY = 600;
  scrollListeners.scroll.callback();
  assert.equal(frames.length, 1);
  frames.shift()();
  assert.equal(links[1].attributes['aria-current'], 'location');
  assert.equal(links.filter(link => link.attributes['aria-current'] === 'location').length, 1);
  assert.deepEqual(disclosureOpen, [true, false, false, false]);
  assert.equal(scrollToCalls, 0);
});
