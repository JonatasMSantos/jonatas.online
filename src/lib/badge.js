// Gera as artes do crachá (frente, verso e alça) em canvas, já no idioma atual.
// O Lanyard recebe URLs de imagem; aqui devolvemos data URLs.

const W = 1024;
const H = 1440; // proporção do cartão retrato do Lanyard (1.6 x 2.25)
const BLUE = '#0455BF';
const FONT = '"Geist Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const loadImage = src =>
  new Promise(resolve => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });

const canvas = (width, height) => {
  const node = document.createElement('canvas');
  node.width = width;
  node.height = height;
  return [node, node.getContext('2d')];
};

const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
};

const tinted = (image, size, color) => {
  const [node, ctx] = canvas(size, size);
  ctx.drawImage(image, 0, 0, size, size);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  return node;
};

const encode = node => node.toDataURL('image/webp', 0.92);

const drawFront = (t, photo, logo) => {
  const [node, ctx] = canvas(W, H);
  ctx.fillStyle = '#fbfbfa';
  ctx.fillRect(0, 0, W, H);

  // Faixa superior fica limpa: o furo da presilha passa por aqui.
  if (logo) ctx.drawImage(logo, 64, 52, 76, 76);
  ctx.fillStyle = '#8a8a8f';
  ctx.font = `500 30px ${FONT}`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('jonatas.online', W - 64, 90);

  const panel = { x: 64, y: 168, w: W - 128, h: 780 };
  const sky = ctx.createLinearGradient(0, panel.y, 0, panel.y + panel.h);
  sky.addColorStop(0, '#2f80ed');
  sky.addColorStop(1, BLUE);
  roundRect(ctx, panel.x, panel.y, panel.w, panel.h, 36);
  ctx.save();
  ctx.clip();
  ctx.fillStyle = sky;
  ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
  if (photo) {
    const scale = panel.w / photo.width;
    const ph = photo.height * scale;
    ctx.drawImage(photo, panel.x, panel.y + 28, panel.w, ph);
  }
  ctx.restore();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#111114';
  ctx.font = `700 88px ${FONT}`;
  ctx.fillText(t.name, 64, 1058);
  ctx.fillStyle = '#56565c';
  ctx.font = `500 42px ${FONT}`;
  ctx.fillText(t.role, 64, 1120);

  ctx.fillStyle = '#e4e4e7';
  ctx.fillRect(64, 1176, W - 128, 3);

  ctx.fillStyle = '#8a8a8f';
  ctx.font = `500 32px ${FONT}`;
  ctx.fillText(t.location, 64, 1250);
  ctx.fillText(t.badge.since, 64, 1300);

  // Código de barras decorativo, determinístico.
  ctx.fillStyle = '#111114';
  let x = W - 64;
  let seed = 7;
  while (x > W - 400) {
    seed = (seed * 9301 + 49297) % 233280;
    const bar = 3 + (seed % 4) * 3;
    x -= bar;
    ctx.fillRect(x, 1212, bar, 110);
    x -= 5 + (seed % 3) * 3;
  }

  ctx.fillStyle = BLUE;
  ctx.fillRect(0, H - 36, W, 36);
  return encode(node);
};

const drawBack = (t, logo) => {
  const [node, ctx] = canvas(W, H);
  ctx.fillStyle = BLUE;
  ctx.fillRect(0, 0, W, H);
  if (logo) ctx.drawImage(tinted(logo, 360, '#ffffff'), (W - 360) / 2, 330, 360, 360);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 68px ${FONT}`;
  ctx.fillText('jonatas.online', W / 2, 840);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
  ctx.font = `500 36px ${FONT}`;
  ['jts.msantos@gmail.com', 'github.com/JonatasMSantos', 'linkedin.com/in/jonatas-m-santos'].forEach((line, i) =>
    ctx.fillText(line, W / 2, 940 + i * 60)
  );
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.font = `500 28px ${FONT}`;
  ctx.fillText(t.badge.flip, W / 2, H - 90);
  return encode(node);
};

const drawStrap = () => {
  const [node, ctx] = canvas(1800, 160);
  ctx.fillStyle = '#111114';
  ctx.fillRect(0, 0, node.width, node.height);
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 70px ${FONT}`;
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '6px';
  const word = 'JONATAS.ONLINE';
  const step = node.width / 2;
  for (let i = 0; i < 2; i++) {
    ctx.fillText(word, i * step + 70, node.height / 2 + 4);
    ctx.fillStyle = BLUE;
    ctx.beginPath();
    ctx.arc(i * step + step - 60, node.height / 2, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
  }
  return encode(node);
};

export async function buildBadge(t) {
  await Promise.all([document.fonts.load(`700 88px ${FONT}`), document.fonts.load(`500 42px ${FONT}`)]).catch(() => {});
  const [photo, logo] = await Promise.all([loadImage('/img/jonatas-foto.webp'), loadImage('/img/logo-hq-white.svg')]);
  return { front: drawFront(t, photo, logo), back: drawBack(t, logo), strap: drawStrap() };
}
