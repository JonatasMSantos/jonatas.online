import { Spring } from './springs.js';

// Reveal tipográfico: letra a letra (blur bloom) ou palavra a palavra.
// Cada span recebe sua própria mola com stagger; estilos aplicados inline.

function split(el, mode) {
  const text = el.textContent;
  el.textContent = '';
  el.setAttribute('aria-label', text);
  const parts = mode === 'letters' ? [...text] : text.split(/(\s+)/);
  const spans = [];
  for (const part of parts) {
    if (/^\s+$/.test(part)) {
      el.appendChild(document.createTextNode(' '));
      continue;
    }
    const span = document.createElement('span');
    span.textContent = part;
    span.style.display = 'inline-block';
    span.style.whiteSpace = 'pre';
    span.setAttribute('aria-hidden', 'true');
    el.appendChild(span);
    spans.push(span);
  }
  return spans;
}

export function revealText(el, { mode = 'letters', stagger = 46, delay = 0, tension = 66, friction = 24, blur = 18, y = 0 } = {}) {
  const spans = split(el, mode);
  el.style.opacity = '1';
  spans.forEach((span, i) => {
    span.style.opacity = '0';
    setTimeout(() => {
      new Spring({
        value: 0,
        target: 1,
        tension,
        friction,
        onUpdate(v) {
          const p = Math.min(1, Math.max(0, v));
          span.style.opacity = p.toFixed(3);
          span.style.filter = `blur(${((1 - p) * blur).toFixed(2)}px)`;
          if (y) span.style.transform = `translateY(${((1 - p) * y).toFixed(2)}px)`;
          if (p > 0.999) { span.style.filter = ''; span.style.transform = ''; }
        },
      }).set(1);
    }, delay + i * stagger);
  });
}

export function revealBlock(el, { delay = 0, tension = 120, friction = 26, y = 16, blur = 8 } = {}) {
  setTimeout(() => {
    new Spring({
      value: 0,
      target: 1,
      tension,
      friction,
      onUpdate(v) {
        const p = Math.min(1, Math.max(0, v));
        el.style.opacity = p.toFixed(3);
        el.style.filter = `blur(${((1 - p) * blur).toFixed(2)}px)`;
        el.style.transform = `translateY(${((1 - p) * y).toFixed(2)}px)`;
        if (p > 0.999) { el.style.filter = ''; el.style.transform = ''; }
      },
    }).set(1);
  }, delay);
}
