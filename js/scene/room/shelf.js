import * as THREE from 'three';
import { mulberry32 } from '../backdrop.js';

// Estante contra a parede do fundo (z = +2.1): lombadas de livros
// instanciadas com alturas e cores semeadas, luz de leitura no destaque.

const SPINES = ['#5a4a3a', '#3a4a5a', '#4a3a3a', '#52544e', '#6a5a40', '#2f3a44', '#7a6a50', '#454036'];

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
  let idx = 0;
  for (let shelf = 0; shelf < 4 && idx < count; shelf++) {
    let x = cx - W / 2 + 0.07;
    while (x < cx + W / 2 - 0.1 && idx < count) {
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
    }
  }
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
