import * as THREE from 'three';
import { mulberry32 } from '../backdrop.js';

// Todas as texturas do quarto são canvas procedurais semeadas: zero downloads.

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
}

function grain(ctx, w, h, rng, alpha, n = 900) {
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = `rgba(${rng() > 0.5 ? 255 : 0},${rng() > 0.5 ? 255 : 0},${rng() > 0.5 ? 255 : 0},${(rng() * alpha).toFixed(3)})`;
    ctx.fillRect(rng() * w, rng() * h, 1 + rng() * 2, 1 + rng() * 2);
  }
}

function toTexture(c, { repeat = [1, 1] } = {}) {
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.anisotropy = 4;
  return tex;
}

export function woodFloor() {
  const rng = mulberry32(41);
  const [c, ctx] = canvas(512, 512);
  const planks = 7;
  const ph = 512 / planks;
  for (let p = 0; p < planks; p++) {
    const base = 46 + rng() * 14;
    ctx.fillStyle = `rgb(${base + 14},${base - 2},${base - 18})`;
    ctx.fillRect(0, p * ph, 512, ph);
    for (let i = 0; i < 26; i++) {
      ctx.strokeStyle = `rgba(28,18,10,${(0.05 + rng() * 0.1).toFixed(3)})`;
      ctx.lineWidth = 0.6 + rng() * 1.2;
      const y = p * ph + rng() * ph;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(170, y + (rng() - 0.5) * 7, 340, y + (rng() - 0.5) * 7, 512, y);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(10,7,4,0.75)';
    ctx.fillRect(0, p * ph, 512, 1.6);
    // topos de tábua deslocados
    const seam = rng() * 512;
    ctx.fillRect(seam, p * ph, 1.4, ph);
  }
  grain(ctx, 512, 512, rng, 0.05);
  return toTexture(c, { repeat: [2.4, 1.7] });
}

export function plasterWall() {
  const rng = mulberry32(42);
  const [c, ctx] = canvas(512, 512);
  ctx.fillStyle = '#42454e';
  ctx.fillRect(0, 0, 512, 512);
  grain(ctx, 512, 512, rng, 0.045, 1400);
  // AO nas bordas pintado na própria textura: sensação de luz bakeada.
  const g = ctx.createRadialGradient(256, 256, 130, 256, 256, 370);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.42)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  return toTexture(c);
}

export function ceilingTex() {
  const rng = mulberry32(43);
  const [c, ctx] = canvas(256, 256);
  ctx.fillStyle = '#2f3138';
  ctx.fillRect(0, 0, 256, 256);
  grain(ctx, 256, 256, rng, 0.05, 500);
  const g = ctx.createRadialGradient(128, 128, 60, 128, 128, 190);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return toTexture(c);
}

export function rugTex() {
  const rng = mulberry32(44);
  const [c, ctx] = canvas(512, 340);
  ctx.fillStyle = '#1d2027';
  ctx.fillRect(0, 0, 512, 340);
  for (let y = 0; y < 340; y += 3) {
    ctx.strokeStyle = `rgba(255,255,255,${(0.012 + rng() * 0.02).toFixed(3)})`;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(217,160,91,0.5)';
  ctx.lineWidth = 3;
  ctx.strokeRect(18, 18, 512 - 36, 340 - 36);
  grain(ctx, 512, 340, rng, 0.04, 700);
  return toTexture(c);
}

export function contactShadow() {
  const [c, ctx] = canvas(256, 256);
  const g = ctx.createRadialGradient(128, 128, 8, 128, 128, 124);
  g.addColorStop(0, 'rgba(0,0,0,0.62)');
  g.addColorStop(0.6, 'rgba(0,0,0,0.28)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  return tex;
}

export function monogram() {
  const [c, ctx] = canvas(256, 320);
  ctx.fillStyle = '#101218';
  ctx.fillRect(0, 0, 256, 320);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.strokeRect(10, 10, 236, 300);
  ctx.fillStyle = '#d9a05b';
  ctx.font = 'italic 130px "Instrument Serif", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('JS.', 128, 158);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ---------- Telas animadas ----------

const CODE_COLORS = ['#6ea8ff', '#b48fe8', '#7ed6a0', '#e0b06a', '#8fb6d9', '#a8adb8'];

export function codeScreen() {
  const rng = mulberry32(7);
  const [c, ctx] = canvas(512, 300);
  const lines = [];
  for (let i = 0; i < 46; i++) {
    const indent = Math.max(0, Math.min(4, (lines[i - 1]?.indent ?? 0) + Math.floor(rng() * 3) - 1));
    const segs = [];
    let n = 1 + Math.floor(rng() * 3);
    while (n--) segs.push({ w: 24 + rng() * 90, color: CODE_COLORS[Math.floor(rng() * CODE_COLORS.length)] });
    lines.push({ indent, segs });
  }
  let scroll = 0;
  let brightness = 1;

  function draw(t) {
    ctx.fillStyle = '#0d1017';
    ctx.fillRect(0, 0, 512, 300);
    ctx.fillStyle = '#131722';
    ctx.fillRect(0, 0, 34, 300);
    const lh = 15;
    const visible = 20;
    const first = Math.floor(scroll) % lines.length;
    for (let r = 0; r < visible; r++) {
      const line = lines[(first + r) % lines.length];
      const y = 12 + r * lh;
      ctx.fillStyle = 'rgba(140,150,170,0.4)';
      ctx.font = '9px monospace';
      ctx.fillText(String((first + r) % 99 + 1).padStart(2, ' '), 8, y + 4);
      let x = 44 + line.indent * 16;
      for (const s of line.segs) {
        ctx.fillStyle = s.color;
        ctx.globalAlpha = 0.85 * brightness;
        ctx.fillRect(x, y - 4, s.w, 7);
        ctx.globalAlpha = 1;
        x += s.w + 10;
      }
    }
    // cursor
    if (Math.floor(t * 2) % 2 === 0) {
      ctx.fillStyle = '#e8ecf4';
      ctx.fillRect(44 + 16, 12 + 8 * lh - 4, 7, 10);
    }
  }
  draw(0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;

  let last = 0;
  return {
    tex,
    setFocus(f) { brightness = 0.85 + f * 0.35; },
    update(t) {
      if (t - last < 0.25) return;
      last = t;
      if (Math.floor(t) % 3 === 0) scroll += 0.34;
      draw(t);
      tex.needsUpdate = true;
    },
  };
}

const TERM_LINES = [
  '$ agent plan release',
  '  reading services ......... 12',
  '  contract checks .......... ok',
  '  risk review .............. ok',
  '$ agent apply --canary 5%',
  '  shipping canary .......... ok',
  '  error budget ............. ok',
  '$ agent apply --rollout 100%',
  '  rollout complete ......... ok',
  '$ ',
];

export function terminalScreen() {
  const [c, ctx] = canvas(512, 300);
  let chars = 0;
  let speed = 1;
  const total = TERM_LINES.join('\n').length;

  function draw(t) {
    ctx.fillStyle = '#080c0a';
    ctx.fillRect(0, 0, 512, 300);
    ctx.font = '13px monospace';
    let remaining = Math.floor(chars);
    let y = 26;
    for (const line of TERM_LINES) {
      if (remaining <= 0) break;
      const shown = line.slice(0, remaining);
      ctx.fillStyle = line.startsWith('$') ? '#e8ecf4' : '#7ed6a0';
      ctx.fillText(shown, 16, y);
      remaining -= line.length + 1;
      y += 22;
    }
    if (Math.floor(t * 2.5) % 2 === 0) {
      ctx.fillStyle = '#7ed6a0';
      ctx.fillRect(16 + Math.min(chars * 0, 8) + 14, y - 32 + 22, 8, 14);
    }
  }
  draw(0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;

  let last = 0;
  return {
    tex,
    setFocus(f) { speed = 1 + f * 3; },
    update(t) {
      if (t - last < 0.12) return;
      last = t;
      chars += speed * 2.4;
      if (chars > total + 40) chars = 0;
      draw(t);
      tex.needsUpdate = true;
    },
  };
}

export function scopeScreen() {
  const [c, ctx] = canvas(512, 300);
  let amp = 0.35;

  function draw(t) {
    ctx.fillStyle = '#04140b';
    ctx.fillRect(0, 0, 512, 300);
    ctx.strokeStyle = 'rgba(48,120,80,0.28)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= 512; x += 51.2) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 300); ctx.stroke(); }
    for (let y = 0; y <= 300; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke(); }
    ctx.strokeStyle = '#7ef2c0';
    ctx.lineWidth = 2.4;
    ctx.shadowColor = '#7ef2c0';
    ctx.shadowBlur = 9;
    ctx.beginPath();
    for (let x = 0; x <= 512; x += 4) {
      const ph = x * 0.028 + t * 2.2;
      const y = 150 + Math.sin(ph) * 82 * amp + Math.sin(ph * 3.1) * 26 * amp;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  draw(0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;

  let last = 0;
  return {
    tex,
    setFocus(f) { amp = 0.35 + f * 0.65; },
    update(t) {
      if (t - last < 0.1) return;
      last = t;
      draw(t);
      tex.needsUpdate = true;
    },
  };
}
