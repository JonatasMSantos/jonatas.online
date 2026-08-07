import { clamp01, damp } from './springs.js';

// Scroll nativo suavizado, mapeado para progressos locais por seção.
// Tudo downstream é função pura destes valores: scroll reverso simétrico.

const sections = {};
let smooth = 0;
let raw = 0;

export const progress = { hero: 0, dive: 0, room: 0, projects: 0, scrollY: 0, covered: false };

export function measure() {
  for (const id of ['hero', 'dive', 'room', 'experience', 'projects', 'contact']) {
    const el = document.getElementById(id);
    sections[id] = { top: el.offsetTop, height: el.offsetHeight };
  }
}

function local(id, y) {
  const s = sections[id];
  const span = Math.max(1, s.height - innerHeight);
  return clamp01((y - s.top) / span);
}

export function update(dt, instant = false) {
  raw = scrollY;
  smooth = instant ? raw : damp(smooth, raw, 0.16, dt);
  if (Math.abs(smooth - raw) < 0.3) smooth = raw;
  // Saltos longos (âncoras do nav): limita o atraso a 4 viewports.
  const maxLag = innerHeight * 4;
  if (smooth - raw > maxLag) smooth = raw + maxLag;
  else if (raw - smooth > maxLag) smooth = raw - maxLag;

  progress.scrollY = smooth;
  progress.hero = local('hero', smooth);
  progress.dive = local('dive', smooth);
  progress.room = local('room', smooth);
  progress.projects = clamp01((smooth + innerHeight - sections.projects.top) / innerHeight);
  // Canvas totalmente coberto pelas seções DOM (a experiência é a primeira
  // opaca depois do quarto): render principal pode pausar.
  progress.covered = raw >= sections.experience.top;
  return progress;
}
