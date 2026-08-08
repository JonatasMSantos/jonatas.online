import * as THREE from 'three';
import { mulberry32 } from '../backdrop.js';

// Estante contra a parede do fundo (z = +2.1): lombadas de livros
// instanciadas com alturas e cores semeadas, luz de leitura no destaque.
// Clássicos de engenharia de software ganham lombada própria com título
// legível (canvas procedural), intercalados nas prateleiras à altura do olhar.

const SPINES = ['#5a4a3a', '#3a4a5a', '#4a3a3a', '#52544e', '#6a5a40', '#2f3a44', '#7a6a50', '#454036'];

const FEATURED = [
  { title: 'CLEAN CODE',                  author: 'R. C. MARTIN',    bg: '#20242b', fg: '#e8ecf4', accent: '#c9553d' },
  { title: 'EFFECTIVE JAVA',              author: 'J. BLOCH',        bg: '#2c463a', fg: '#eae4d0', accent: '#d9a05b' },
  { title: 'THE PRAGMATIC PROGRAMMER',    author: 'HUNT · THOMAS',   bg: '#3a3f4a', fg: '#e8ecf4', accent: '#8fb6d9' },
  { title: 'DESIGN PATTERNS',             author: 'GAMMA ET AL.',    bg: '#41372e', fg: '#eae4d0', accent: '#c9a06a' },
  { title: 'REFACTORING',                 author: 'M. FOWLER',       bg: '#274052', fg: '#e8ecf4', accent: '#d9a05b' },
  { title: 'HEAD FIRST JAVA',             author: 'SIERRA · BATES',  bg: '#5a4632', fg: '#f0e8d8', accent: '#c9553d' },
  { title: 'CLEAN ARCHITECTURE',          author: 'R. C. MARTIN',    bg: '#233042', fg: '#e8ecf4', accent: '#7ea8d9' },
  { title: 'JAVA CONCURRENCY IN PRACTICE', author: 'B. GOETZ',       bg: '#31404a', fg: '#e8ecf4', accent: '#7ed6a0' },
  { title: 'DOMAIN-DRIVEN DESIGN',        author: 'E. EVANS',        bg: '#37343f', fg: '#e8e2f0', accent: '#b48fe8' },
  { title: 'CODE COMPLETE',               author: 'S. MCCONNELL',    bg: '#3d3a30', fg: '#eae4d0', accent: '#d9a05b' },
  { title: 'SPRING IN ACTION',            author: 'C. WALLS',        bg: '#2a4436', fg: '#e0ecda', accent: '#7ed6a0' },
  { title: 'THE MYTHICAL MAN-MONTH',      author: 'F. BROOKS',       bg: '#4a3238', fg: '#f0e4e0', accent: '#d98a7a' },
];

// Lombada 1:5.3 (~mesma proporção dos livros): título lido de cima para
// baixo, autor no pé, faixas na cor de destaque como nos clássicos impressos.
function spineTexture({ title, author, bg, fg, accent }) {
  const c = document.createElement('canvas');
  c.width = 96;
  c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 96, 512);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 14, 96, 6);
  ctx.fillRect(0, 492, 96, 6);
  ctx.save();
  ctx.translate(48, 256);
  ctx.rotate(Math.PI / 2);
  ctx.textBaseline = 'middle';
  let size = 40;
  ctx.font = `500 ${size}px "General Sans", sans-serif`;
  const tw = ctx.measureText(title).width;
  if (tw > 340) {
    size = Math.max(19, (size * 340) / tw);
    ctx.font = `500 ${size}px "General Sans", sans-serif`;
  }
  ctx.fillStyle = fg;
  ctx.textAlign = 'left';
  ctx.fillText(title, -218, 1);
  ctx.globalAlpha = 0.62;
  ctx.font = '500 20px "General Sans", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(author, 216, 1);
  ctx.restore();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

export function buildShelf() {
  const group = new THREE.Group();
  const rng = mulberry32(2024);

  const frameMat = new THREE.MeshStandardMaterial({ color: '#26211a', roughness: 0.6 });
  const cx = 0.9;
  const W = 1.5;
  const Hs = [0.32, 0.78, 1.24, 1.7];

  for (const dx of [-W / 2, W / 2]) {
    const side = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.86, 0.28), frameMat);
    side.position.set(cx + dx, 0.93, 1.94);
    side.castShadow = true;
    group.add(side);
  }
  for (const h of [...Hs, 1.86]) {
    const board = new THREE.Mesh(new THREE.BoxGeometry(W, 0.035, 0.28), frameMat);
    board.position.set(cx, h + 0.0175 - 0.035, 1.94);
    board.castShadow = board.receiveShadow = true;
    group.add(board);
  }

  // Livros.
  const count = 62;
  const books = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ roughness: 0.75 }),
    count
  );
  const dummy = new THREE.Object3D();

  // Livros titulados: lombada com textura no rosto -z (voltado para o quarto),
  // corte de páginas no topo, capa na cor de fundo da lombada.
  const paperMat = new THREE.MeshStandardMaterial({ color: '#d8d2c0', roughness: 0.9 });
  function makeFeatured(spec, w, h, d) {
    const cover = new THREE.MeshStandardMaterial({ color: spec.bg, roughness: 0.7 });
    const spine = new THREE.MeshStandardMaterial({ map: spineTexture(spec), roughness: 0.62 });
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      [cover, cover, paperMat, cover, cover, spine]
    );
    mesh.castShadow = true;
    return mesh;
  }

  // Prateleiras 1 e 2 são as que ficam na altura do olhar da parada "arch".
  const featuredByShelf = { 1: [...FEATURED.slice(0, 6)], 2: [...FEATURED.slice(6)] };

  let idx = 0;
  for (let shelf = 0; shelf < 4; shelf++) {
    const queue = featuredByShelf[shelf] || [];
    let x = cx - W / 2 + 0.07;
    let since = 0; // enchimentos desde o último titulado: evita aglomerá-los
    while (x < cx + W / 2 - 0.1 && (idx < count || queue.length)) {
      if (queue.length && ((since >= 2 && rng() > 0.45) || idx >= count)) {
        const spec = queue.shift();
        const w = 0.036 + rng() * 0.012;
        const h = 0.225 + rng() * 0.035;
        const book = makeFeatured(spec, w, h, 0.17 + rng() * 0.03);
        book.position.set(x + w / 2, Hs[shelf] + h / 2, 1.945 + (rng() - 0.5) * 0.02);
        group.add(book);
        x += w + 0.004;
        since = 0;
      } else if (idx < count) {
        const w = 0.026 + rng() * 0.024;
        const h = 0.17 + rng() * 0.1;
        const lean = rng() > 0.88 ? 0.12 : 0;
        dummy.position.set(x + w / 2, Hs[shelf] + h / 2, 1.94 + (rng() - 0.5) * 0.03);
        dummy.scale.set(w, h, 0.16 + rng() * 0.05);
        dummy.rotation.set(0, 0, lean);
        dummy.updateMatrix();
        books.setMatrixAt(idx, dummy.matrix);
        books.setColorAt(idx, new THREE.Color(SPINES[Math.floor(rng() * SPINES.length)]).multiplyScalar(0.8 + rng() * 0.4));
        x += w + 0.004 + (rng() > 0.85 ? 0.05 : 0);
        idx++;
        since++;
      }
    }
  }
  books.count = idx;
  books.castShadow = true;
  books.instanceMatrix.needsUpdate = true;
  group.add(books);

  // Objetos de cima: vaso pequeno e sulfite.
  const vase = new THREE.Mesh(
    new THREE.LatheGeometry([new THREE.Vector2(0.001, 0), new THREE.Vector2(0.05, 0.02), new THREE.Vector2(0.035, 0.1), new THREE.Vector2(0.045, 0.16)], 16),
    new THREE.MeshStandardMaterial({ color: '#3a3e46', roughness: 0.5 })
  );
  vase.position.set(cx - 0.45, 1.703, 1.94);
  group.add(vase);

  // Luz de leitura embutida (sobe no destaque).
  const bar = new THREE.Mesh(
    new THREE.BoxGeometry(W * 0.7, 0.01, 0.014),
    new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffe2b8').multiplyScalar(0.2), toneMapped: false })
  );
  bar.position.set(cx, 1.88, 1.84);
  group.add(bar);

  const light = new THREE.SpotLight('#ffe2b8', 0, 2.8, 1.0, 0.7, 1.5);
  light.position.set(cx, 1.95, 1.62);
  light.target.position.set(cx, 0.8, 1.96);
  group.add(light, light.target);

  return {
    group,
    setFocus(f) {
      light.intensity = f * 5.0;
      bar.material.color.set('#ffe2b8').multiplyScalar(0.2 + f * 0.5);
    },
  };
}
