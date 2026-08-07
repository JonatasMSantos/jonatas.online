import { TIER } from './tier.js';
import { stepSprings, clamp01, smoothstep, lerp } from './springs.js';
import * as scroll from './scroll.js';
import { apply as i18nApply, toggle as i18nToggle } from './i18n.js';
import { startPreloader } from './preloader.js';
import { initCursor } from './cursor.js';
import { revealText, revealBlock } from './reveal.js';
import { ROOM_STOPS } from './data/stops.js';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

i18nApply();
const preloader = startPreloader();
initCursor();

// ---------- Navegação ----------

function goTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({ top: id === 'hero' ? 0 : el.offsetTop, behavior: TIER.reducedMotion ? 'auto' : 'smooth' });
}

$$('[data-nav]').forEach((a) =>
  a.addEventListener('click', (e) => {
    e.preventDefault();
    $('#menu').classList.remove('open');
    goTo(a.dataset.nav);
  })
);
$('#lang-toggle').addEventListener('click', i18nToggle);
$('#burger').addEventListener('click', () => $('#menu').classList.add('open'));
$('#menu-close').addEventListener('click', () => $('#menu').classList.remove('open'));

// ---------- Estado do mundo 3D ----------

let world = null;   // { renderer, scene, camera, composer, bloom, rig, hero, room, fog, resize }
let revealed = false;

async function initScene() {
  const [THREE, rendererMod, backdropMod, heroMod, roomMod, pathMod] = await Promise.all([
    import('three'),
    import('./scene/renderer.js'),
    import('./scene/backdrop.js'),
    import('./scene/hero.js'),
    import('./scene/room/index.js'),
    import('./scene/pathCamera.js'),
  ]);

  // Labels e texturas tipográficas dependem das fontes.
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load('500 34px "General Sans"'),
        document.fonts.load('italic 400 26px "Instrument Serif"'),
      ]),
      new Promise((r) => setTimeout(r, 2500)),
    ]);
  } catch (e) {}

  const { createRenderer } = rendererMod;
  const ctx = createRenderer($('#gl'), TIER);
  const { scene, camera } = ctx;

  scene.fog = new THREE.FogExp2('#0b0c12', 0.03);
  const backdrop = backdropMod.makeBackdrop();
  scene.add(backdrop);

  const hero = await heroMod.buildHero(TIER);
  scene.add(hero.group);

  const room = roomMod.buildRoom(TIER);
  room.group.position.copy(pathMod.ROOM_ORIGIN);
  scene.add(room.group);

  // Poeira: hero, coluna do mergulho, interior do quarto.
  const dustHero = backdropMod.makeDust({ seed: 99, count: TIER.dust, center: [0, 1.2, 0], radius: 6.5, height: 9 });
  const dustDive = backdropMod.makeDust({ seed: 133, count: Math.floor(TIER.dust * 0.5), center: [0.5, -15, 0], radius: 4.5, height: 32, opacity: 0.6 });
  const dustRoom = backdropMod.makeDust({ seed: 77, count: Math.floor(TIER.dust * 0.3), center: [0.8, -30.1, -0.8], radius: 1.7, height: 2.6, size: 0.06, drift: 0.03, opacity: 0.5 });
  scene.add(dustHero, dustDive, dustRoom);

  const rig = pathMod.createCameraRig();

  // Aquecimento: compila tudo e renderiza frames reais antes do reveal.
  // Um frame de dentro do quarto força o upload das texturas dele para a
  // GPU (senão o frustum culling adia o upload e a entrada na sala engasga).
  hero.group.visible = true;
  room.group.visible = true;
  if (ctx.renderer.compileAsync) await ctx.renderer.compileAsync(scene, camera);
  camera.position.set(0.2, -29.9, -0.6);
  camera.lookAt(0.9, -30.3, 1.9);
  ctx.composer.render();
  camera.position.set(0.75, -29.95, -1.55);
  camera.lookAt(2.35, -30.37, 0.3);
  ctx.composer.render();
  camera.position.set(0, 1.5, 4.4);
  camera.lookAt(0, 1.12, 0);
  for (let i = 0; i < 2; i++) ctx.composer.render();

  world = { ...ctx, THREE, rig, hero, room, backdrop, dust: [dustHero, dustDive, dustRoom] };
  preloader.ready();
}

initScene().catch((err) => {
  console.error('WebGL indisponível:', err);
  document.documentElement.classList.add('no-webgl');
  preloader.ready();
});

// ---------- Reveal pós-preloader ----------

preloader.onReveal(async () => {
  revealed = true;
  const kicker = $('.hero-kicker');
  const name = $('.hero-name');
  const sub = $('.hero-sub');
  kicker.style.opacity = '0';
  sub.style.opacity = '0';
  setTimeout(() => {
    revealBlock(kicker, { delay: 0, y: 10, blur: 6 });
    revealText(name, { mode: 'letters', stagger: 46, delay: 180 });
    revealText(sub, { mode: 'words', stagger: 34, delay: 700, blur: 8, y: 12, tension: 130 });
    hintRevealAt = performance.now() + 1400;
    revealBlock($('#nav'), { delay: 250, y: -12, blur: 0, tension: 90, friction: 22 });
  }, 60);

  // Inicializa a cena isolada da seção de experiência
  try {
    const { initExperience3D } = await import('./scene/experience.js');
    initExperience3D('experience-gl', TIER.modelUrl);
  } catch (err) {
    console.error('Erro ao iniciar modelo 3D da timeline', err);
  }
});

// ---------- Painéis das paradas + linha do mergulho ----------

// Dica de rolagem: fixa, visível até o fim da página, some perto do rodapé.
const hintEl = $('#scroll-hint');
let hintRevealAt = Infinity;

function updateHint(now) {
  const entry = clamp01((now - hintRevealAt) / 900);
  if (entry <= 0) return;
  const end = document.body.scrollHeight - innerHeight;
  const nearEnd = 1 - clamp01((end - scrollY - innerHeight * 0.2) / (innerHeight * 0.6));
  hintEl.style.opacity = (entry * (1 - nearEnd)).toFixed(3);
}

const panels = ROOM_STOPS.map((s) => {
  const el = $(`.stop-panel[data-stop="${s.id}"]`);
  return { el, body: el.querySelector('.stop-body'), seen: false, side: el.dataset.side };
});
const diveLine = $('.dive-line');

function updateOverlay(progress, focus) {
  // Platô de leitura: entra cedo, segura nítida por quase todo o mergulho.
  const p = progress.dive;
  const vis = Math.min(smoothstep(0.02, 0.12, p), 1 - smoothstep(0.88, 0.98, p));
  diveLine.style.opacity = vis.toFixed(3);
  diveLine.style.filter = `blur(${((1 - vis) * 10).toFixed(1)}px)`;

  for (let i = 0; i < panels.length; i++) {
    const p = panels[i];
    const f = focus ? focus[i] : 0;
    p.el.style.opacity = f.toFixed(3);
    const shift = (1 - f) * 26;
    const dir = p.side === 'left' ? -1 : 1;
    p.el.style.transform = innerWidth < 768
      ? `translateY(${shift.toFixed(1)}px)`
      : `translateY(calc(-50% + ${(shift * 0.4).toFixed(1)}px)) translateX(${(dir * shift).toFixed(1)}px)`;
    p.el.style.filter = `blur(${((1 - f) * 6).toFixed(1)}px)`;
    p.el.style.pointerEvents = f > 0.5 ? 'auto' : 'none';
    if (!p.seen && f > 0.28) {
      p.seen = true;
      revealText(p.body, { mode: 'words', stagger: 15, blur: 6, y: 8, tension: 170 });
    }
  }
}

// ---------- Projetos: parallax + tilt ----------

const parallaxEls = $$('[data-parallax]').map((el) => ({ el, f: parseFloat(el.dataset.parallax), center: 0 }));
const numEls = $$('.project-num').map((el) => ({ el, center: 0 }));
const wideImg = $('.shot-wide img');
const clampPx = (v, m) => Math.max(-m, Math.min(m, v));

function measureProjects() {
  const base = $('#projects').offsetTop;
  const centerOf = (el) => {
    const article = el.closest('.project');
    return base + article.offsetTop + article.offsetHeight / 2;
  };
  for (const p of parallaxEls) p.center = centerOf(p.el);
  for (const n of numEls) n.center = centerOf(n.el);
}

function updateProjects() {
  const mid = scrollY + innerHeight / 2;
  for (const { el, f, center } of parallaxEls) {
    el.style.transform = `translateY(${clampPx((center - mid) * f, 90).toFixed(1)}px)`;
  }
  for (const { el, center } of numEls) {
    el.style.transform = `translateY(${clampPx((mid - center) * 0.08, 110).toFixed(1)}px)`;
  }
  if (wideImg) {
    const r = wideImg.getBoundingClientRect();
    if (r.bottom > 0 && r.top < innerHeight) {
      const vis = clamp01(1 - Math.abs(r.top + r.height / 2 - innerHeight / 2) / innerHeight);
      wideImg.style.transform = `scale(${(1.08 - vis * 0.08).toFixed(4)})`;
    }
  }
}

// Tilt 3D sutil nas imagens primárias.
if (TIER.fine) {
  $$('.tilt').forEach((fig) => {
    let rx = 0, ry = 0, trx = 0, try_ = 0, hover = false;
    fig.addEventListener('pointerenter', () => { hover = true; });
    fig.addEventListener('pointerleave', () => { hover = false; });
    fig.addEventListener('pointermove', (e) => {
      const r = fig.getBoundingClientRect();
      try_ = ((e.clientX - r.left) / r.width - 0.5) * 6;
      trx = -((e.clientY - r.top) / r.height - 0.5) * 5;
    });
    (function tiltLoop() {
      rx += ((hover ? trx : 0) - rx) * 0.08;
      ry += ((hover ? try_ : 0) - ry) * 0.08;
      if (Math.abs(rx) > 0.01 || Math.abs(ry) > 0.01) {
        fig.style.transform = `perspective(1200px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      }
      requestAnimationFrame(tiltLoop);
    })();
  });
}

// ---------- Nav ativa ----------

const navLinks = $$('.nav-links a');
function updateNav() {
  const y = scrollY + innerHeight * 0.5;
  const ids = ['hero', 'room', 'projects', 'contact'];
  let active = 'hero';
  for (const id of ids) {
    const el = document.getElementById(id);
    if (y >= el.offsetTop) active = id === 'dive' ? active : id;
  }
  navLinks.forEach((a) => a.classList.toggle('active', a.dataset.nav === active));
}

// ---------- Debug ----------

const QA_INSTANT = location.search.includes('instant');
let debugEl = null;
if (location.search.includes('debug')) {
  debugEl = document.createElement('div');
  debugEl.id = 'debug';
  document.body.appendChild(debugEl);
}

// ---------- Resize ----------

let lastW = innerWidth;
let resizeTimer = 0;
addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    // iOS: ignora resizes só de altura (barra de URL) no touch.
    if (TIER.name === 'mobile' && innerWidth === lastW) return;
    lastW = innerWidth;
    scroll.measure();
    measureProjects();
    if (world) world.resize();
  }, 140);
});

// ---------- Loop mestre ----------

scroll.measure();
measureProjects();

let lastT = performance.now();
let acc = 0;
let fps = 60;
let settleTimer = 0;

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - lastT) / 1000);
  lastT = now;
  fps = lerp(fps, 1 / Math.max(dt, 1e-4), 0.05);

  stepSprings(dt);
  const progress = scroll.update(dt, TIER.reducedMotion || QA_INSTANT);

  updateNav();
  updateProjects();
  updateHint(now);

  if (!world) {
    updateOverlay(progress, null);
    return;
  }

  const { renderer, camera, composer, bloom, rig, hero, room, backdrop, dust } = world;

  const state = rig.update(camera, progress, now / 1000, dt);
  updateOverlay(progress, state.focus);

  if (document.hidden || progress.covered) return;

  acc += dt * 1000;
  if (TIER.frameMs > 0 && acc < TIER.frameMs) return;
  acc = 0;

  // Modo economia: com reduced motion, renderiza só quando o scroll muda.
  if (TIER.reducedMotion) {
    if (Math.abs(progress.scrollY - settleTimer) < 0.5 && now / 1000 > 4) return;
    settleTimer = progress.scrollY;
  }

  const t = now / 1000;
  const heroVisible = camera.position.y > -13;
  const roomVisible = camera.position.y < -5;
  hero.group.visible = heroVisible;
  room.group.visible = roomVisible;
  dust[0].visible = heroVisible;
  dust[1].visible = camera.position.y < 3 && camera.position.y > -27;
  dust[2].visible = roomVisible;

  // Coreografia do fog: denso no meio do mergulho, limpo dentro do quarto.
  const bell = Math.pow(Math.sin(Math.PI * progress.dive), 2);
  world.scene.fog.density = 0.03 + bell * 0.055 - smoothstep(0, 0.2, progress.room) * 0.012;

  backdrop.position.copy(camera.position);

  const heroExit = smoothstep(0.55, 0.98, progress.hero);
  hero.update(t, dt, camera, heroExit, revealed);

  for (const d of dust) d.material.uniforms.uTime.value = t;

  room.update(t, dt, state.focus, roomVisible);

  bloom.strength = (TIER.name === 'mobile' ? 0.4 : 0.62) * (1 - 0.55 * progress.projects);
  world.postfx.uniforms.uTime.value = t % 1000;

  renderer.info.reset();
  composer.render();

  if (debugEl && Math.floor(now / 250) !== Math.floor((now - dt * 1000) / 250)) {
    const info = renderer.info.render;
    debugEl.textContent =
      `tier ${TIER.name}  fps ${fps.toFixed(0)}\n` +
      `calls ${info.calls}  tris ${(info.triangles / 1000).toFixed(0)}k\n` +
      `hero ${progress.hero.toFixed(2)} dive ${progress.dive.toFixed(2)} room ${progress.room.toFixed(2)}\n` +
      `u ${state.u.toFixed(3)}  focus [${state.focus.map((f) => f.toFixed(1)).join(' ')}]`;
  }
}

requestAnimationFrame(frame);
