// Anel que persegue o cursor do sistema com easing; some em dispositivos touch.

export function initCursor() {
  if (matchMedia('(hover: none)').matches) return;
  const el = document.getElementById('cursor');
  let tx = innerWidth / 2, ty = innerHeight / 2;
  let x = tx, y = ty;
  let visible = false;
  let scale = 1;

  addEventListener('pointermove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
    if (!visible) { visible = true; el.style.opacity = '1'; x = tx; y = ty; }
    const interactive = e.target.closest && e.target.closest('a, button');
    scale = interactive ? 0.55 : 1;
  }, { passive: true });

  document.addEventListener('mouseleave', () => { visible = false; el.style.opacity = '0'; });

  let currentScale = 1;
  (function loop() {
    x += (tx - x) * 0.15;
    y += (ty - y) * 0.15;
    currentScale += (scale - currentScale) * 0.12;
    el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${currentScale.toFixed(3)})`;
    requestAnimationFrame(loop);
  })();
}
