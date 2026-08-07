// Lido uma vez no boot; todo o resto deriva daqui.

const coarse = matchMedia('(hover: none) and (pointer: coarse)').matches;
const w = innerWidth;

const name = (w < 768 || coarse) ? 'mobile' : (w < 1180 ? 'tablet' : 'desktop');

const PRESETS = {
  mobile:  { dpr: [1, 1.5],  frameMs: 1000 / 30, msaa: 0, shadows: false, shadowMap: 0,    dust: 900,  fine: false },
  tablet:  { dpr: [1, 1.75], frameMs: 1000 / 45, msaa: 2, shadows: true,  shadowMap: 1024, dust: 1600, fine: true },
  desktop: { dpr: [1, 2],    frameMs: 0,         msaa: 4, shadows: true,  shadowMap: 2048, dust: 2600, fine: true },
};

export const TIER = {
  name,
  ...PRESETS[name],
  reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
  pixelRatio: Math.min(Math.max(devicePixelRatio || 1, PRESETS[name].dpr[0]), PRESETS[name].dpr[1]),
  modelUrl: name === 'mobile' ? 'assets/3dmodels/jonatas.min.1k.glb' : 'assets/3dmodels/jonatas.min.glb',
};

document.documentElement.classList.add('tier-' + name);
if (TIER.reducedMotion) document.documentElement.classList.add('reduced-motion');
