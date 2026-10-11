import { LINKS, PROJECTS, SKILLS } from '@/data/content';

// Cada saída é uma lista de linhas tipadas; o TerminalApp decide como desenhar.
// heading | text | dim | link | row (chave e valor) | blank
const line = (t, v, extra) => ({ t, v, ...extra });
const blank = () => line('blank');

// Nomes em PT e EN levam ao mesmo comando, sem depender do idioma da tela.
const ALIASES = {
  help: 'help', ajuda: 'help', '?': 'help',
  sobre: 'about', about: 'about', whoami: 'about',
  experiencia: 'experience', experience: 'experience',
  projetos: 'projects', projects: 'projects',
  skills: 'skills', stack: 'skills',
  curriculo: 'resume', resume: 'resume', cv: 'resume',
  formacao: 'education', education: 'education',
  contato: 'contact', contact: 'contact',
  abrir: 'open', open: 'open',
  ls: 'ls', cat: 'cat', lang: 'lang', idioma: 'lang',
  clear: 'clear', limpar: 'clear', cls: 'clear',
  echo: 'echo', date: 'date', data: 'date', sudo: 'sudo',
};

const OPEN_TARGETS = {
  projetos: 'projects', projects: 'projects',
  busto: 'bust', bust: 'bust', '3d': 'bust',
  skills: 'skills',
  sobre: 'about', about: 'about',
  contato: 'contact', contact: 'contact',
  terminal: 'terminal',
};

// cat <arquivo>: os "arquivos" são os próprios comandos.
const FILES = {
  pt: ['sobre.txt', 'experiencia.txt', 'curriculo.txt', 'skills.txt', 'contato.txt', 'projetos/'],
  en: ['about.txt', 'experience.txt', 'resume.txt', 'skills.txt', 'contact.txt', 'projects/'],
};

export const normalize = value =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

const fill = (template, values) => template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '');

const help = t => [
  line('text', t.terminal.help),
  ...Object.entries(t.terminal.commands).map(([name, desc]) => line('row', desc, { k: name })),
  blank(),
  line('dim', t.terminal.tip),
];

const about = t => [
  line('heading', t.name),
  line('dim', `${t.role} · ${t.location}`),
  blank(),
  line('text', t.resume.summary),
];

const experience = t =>
  t.experience.jobs.flatMap((job, index) => [
    ...(index ? [blank()] : []),
    line('heading', job.role),
    line('dim', `# ${job.date}`),
    line('text', job.body),
  ]);

const projects = t =>
  PROJECTS.flatMap((project, index) => [
    ...(index ? [blank()] : []),
    line('heading', project.name),
    line('dim', t.projects[project.id].role),
    line('text', t.projects[project.id].body),
    line('link', project.url, { href: project.url }),
  ]);

const skills = t => [
  ...t.resume.competencies.map(([k, v]) => line('row', v, { k })),
  blank(),
  line('dim', SKILLS.join(' · ')),
];

const education = t => [
  line('row', t.resume.education, { k: t.terminal.headings.education }),
  line('row', t.resume.languages, { k: t.terminal.headings.languages }),
  line('row', t.resume.interests, { k: t.terminal.headings.interests }),
];

const contact = t => [
  line('row', LINKS.emailLabel, { k: 'email', href: LINKS.email }),
  line('row', 'linkedin.com/in/jonatas-m-santos', { k: 'linkedin', href: LINKS.linkedin }),
  line('row', 'github.com/JonatasMSantos', { k: 'github', href: LINKS.github }),
  line('row', 'contato.jonatas.online', { k: 'site', href: LINKS.contact }),
];

const section = (title, body) => [line('heading', `## ${title}`), ...body, blank()];

const resume = t => {
  const h = t.terminal.headings;
  return [
    line('heading', t.name.toUpperCase()),
    line('dim', `${t.role} · ${t.location} · ${LINKS.emailLabel}`),
    blank(),
    ...section(h.summary, [line('text', t.resume.summary)]),
    ...section(h.competencies, t.resume.competencies.map(([k, v]) => line('row', v, { k }))),
    ...section(h.strengths, t.resume.strengths.map(item => line('text', `- ${item}`))),
    ...section(h.experience, experience(t)),
    ...section(h.ownProject, [line('text', t.resume.ownProject)]),
    ...section(h.education, education(t)),
  ];
};

const HANDLERS = { help, about, experience, projects, skills, resume, education, contact };

const FILE_COMMAND = {
  sobre: 'about', about: 'about',
  experiencia: 'experience', experience: 'experience',
  curriculo: 'resume', resume: 'resume',
  skills: 'skills',
  contato: 'contact', contact: 'contact',
  projetos: 'projects', projects: 'projects',
};

/**
 * Executa uma linha digitada. Devolve as linhas de saída e um efeito opcional
 * para o componente aplicar (limpar a tela, abrir janela, trocar idioma).
 */
export function run(input, { t, lang }) {
  const [rawCmd = '', ...args] = input.trim().split(/\s+/);
  const cmd = ALIASES[normalize(rawCmd)];
  const arg = normalize(args.join(' '));

  if (!rawCmd) return { out: [] };
  if (cmd && HANDLERS[cmd]) return { out: HANDLERS[cmd](t) };

  switch (cmd) {
    case 'clear':
      return { out: [], effect: { type: 'clear' } };
    case 'ls':
      return { out: [line('text', FILES[lang].join('   '))] };
    case 'cat': {
      const target = FILE_COMMAND[arg.replace(/(\.txt|\/)$/, '')];
      if (target) return { out: HANDLERS[target](t) };
      return { out: [line('dim', `cat: ${args.join(' ') || '?'}: No such file`)] };
    }
    case 'open': {
      const app = OPEN_TARGETS[arg];
      if (!app) return { out: [line('dim', t.terminal.openUsage)] };
      return { out: [line('dim', fill(t.terminal.opening, { app: t.apps[app] }))], effect: { type: 'open', app } };
    }
    case 'lang': {
      const next = arg === 'pt' || arg === 'en' ? arg : lang === 'pt' ? 'en' : 'pt';
      return { out: [], effect: { type: 'lang', lang: next } };
    }
    case 'echo':
      return { out: [line('text', args.join(' '))] };
    case 'date':
      return { out: [line('text', new Date().toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US'))] };
    case 'sudo':
      return { out: [line('dim', t.terminal.sudo)] };
    default:
      return { out: [line('dim', fill(t.terminal.notFound, { cmd: rawCmd }))] };
  }
}

/** Completa o comando (ou o alvo do abrir) a partir do que já foi digitado. */
export function complete(input, { t }) {
  const parts = input.split(' ');
  const pool =
    parts.length > 1 && ALIASES[normalize(parts[0])] === 'open'
      ? Object.keys(OPEN_TARGETS)
      : [...Object.keys(t.terminal.commands), ...Object.keys(ALIASES)];
  const current = normalize(parts[parts.length - 1]);
  if (!current) return input;
  const match = [...new Set(pool)].find(name => name.startsWith(current));
  if (!match) return input;
  parts[parts.length - 1] = match;
  return parts.join(' ') + (parts.length === 1 ? ' ' : '');
}
