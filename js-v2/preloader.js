import { Spring } from './springs.js';

// Quadrado que se desenha enquanto o contador sobe; segura em 99% até a cena
// estar compilada e aquecida; então o mesmo quadrado tinge de preto, expande
// e desvanece revelando a cena.

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function startPreloader() {
  const root = document.getElementById('preloader');
  const path = root.querySelector('path');
  const count = root.querySelector('.pre-count');
  const square = root.querySelector('.pre-square');
  const brand = root.querySelector('.pre-brand');

  let sceneReady = false;
  let onDone = () => {};
  const t0 = performance.now() + 150;
  const DRAW_MS = 1400;
  const FAILSAFE_MS = 9000;

  function tick(now) {
    const p = Math.min(1, Math.max(0, (now - t0) / DRAW_MS));
    const eased = easeInOutCubic(p);
    path.style.strokeDashoffset = (1 - eased).toFixed(4);
    let pct = Math.round(eased * 100);
    if (pct >= 100 && !sceneReady && now - t0 < FAILSAFE_MS) pct = 99;
    count.textContent = pct + '%';
    if (pct >= 100 && (sceneReady || now - t0 >= FAILSAFE_MS)) {
      fill();
      return;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  function fill() {
    const size = square.getBoundingClientRect().width;
    const sx = (innerWidth / size) * 1.06;
    const sy = (innerHeight / size) * 1.06;
    brand.style.transition = 'opacity 300ms';
    count.style.transition = 'opacity 300ms';
    brand.style.opacity = '0';
    count.style.opacity = '0';
    new Spring({
      value: 0,
      tension: 150,
      friction: 26,
      onUpdate(v) {
        const p = Math.min(1, v);
        square.style.transform = `scale(${1 + (sx - 1) * p}, ${1 + (sy - 1) * p})`;
        square.style.background = `rgba(5, 6, 10, ${Math.min(1, v * 2.2).toFixed(3)})`;
        if (v > 0.985) reveal();
      },
    }).set(1);
  }

  let revealed = false;
  function reveal() {
    if (revealed) return;
    revealed = true;
    onDone();
    new Spring({
      value: 1,
      tension: 70,
      friction: 26,
      onUpdate(v) {
        root.style.opacity = Math.max(0, v).toFixed(3);
        if (v < 0.01) root.remove();
      },
    }).set(0);
  }

  return {
    ready() { sceneReady = true; },
    onReveal(fn) { onDone = fn; },
  };
}
