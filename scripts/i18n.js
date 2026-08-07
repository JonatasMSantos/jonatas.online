import { DICT } from './data/content.js';

let current = document.documentElement.dataset.lang === 'en' ? 'en' : 'pt';

const resolve = (path, lang) =>
  path.split('.').reduce((node, key) => (node ? node[key] : undefined), DICT[lang]);

export function getLang() { return current; }

export function apply() {
  const lang = current;
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
  document.documentElement.dataset.lang = lang;
  document.title = DICT[lang].meta.title;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.content = DICT[lang].meta.desc;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const value = resolve(el.dataset.i18n, lang);
    if (typeof value === 'string') el.textContent = value;
  });

  document.querySelectorAll('[data-i18n-tags]').forEach((el) => {
    const tags = resolve(el.dataset.i18nTags, lang);
    if (!Array.isArray(tags)) return;
    el.innerHTML = tags
      .map((t) => `<b>${t}</b>`)
      .join(' <i>·</i> ');
  });
}

export function toggle() {
  current = current === 'pt' ? 'en' : 'pt';
  try { localStorage.setItem('jo.lang', current); } catch (e) {}
  apply();
}
