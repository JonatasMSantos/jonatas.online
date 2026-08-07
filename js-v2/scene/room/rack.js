import * as THREE from 'three';
import { mulberry32 } from '../backdrop.js';

// Rack de homelab no canto esquerdo do fundo, LEDs piscando em padrões
// determinísticos. O destaque da parada acelera e clareia o piscar.

const LED_COLORS = [
  new THREE.Color('#123b22'),
  new THREE.Color('#2ea043'),
  new THREE.Color('#3fdd6f'),
  new THREE.Color('#d9a05b'),
  new THREE.Color('#e5534b'),
];

export function buildRack() {
  const group = new THREE.Group();
  const rng = mulberry32(1337);

  const bodyMat = new THREE.MeshStandardMaterial({ color: '#1a1d23', roughness: 0.45, metalness: 0.4 });
  const unitMat = new THREE.MeshStandardMaterial({ color: '#262a33', roughness: 0.5, metalness: 0.35 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.62, 1.82, 0.72), bodyMat);
  body.position.set(-2.55, 0.91, 1.45);
  body.castShadow = body.receiveShadow = true;
  group.add(body);

  // Unidades frontais (face +x).
  const units = 7;
  for (let u = 0; u < units; u++) {
    const face = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.185, 0.6), unitMat);
    face.position.set(-2.23, 0.24 + u * 0.235, 1.45);
    group.add(face);
    // Aletas de ventilação.
    for (let v = 0; v < 3; v++) {
      const slot = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.1, 0.05), bodyMat);
      slot.position.set(-2.208, 0.24 + u * 0.235, 1.28 + v * 0.08);
      group.add(slot);
    }
  }

  // LEDs instanciados.
  const perUnit = 8;
  const count = units * perUnit;
  const led = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(0.013, 0.013),
    new THREE.MeshBasicMaterial({ toneMapped: false }),
    count
  );
  const dummy = new THREE.Object3D();
  const states = [];
  for (let u = 0; u < units; u++) {
    for (let i = 0; i < perUnit; i++) {
      const idx = u * perUnit + i;
      dummy.position.set(-2.218, 0.285 + u * 0.235, 1.56 + i * 0.017);
      dummy.rotation.y = Math.PI / 2;
      dummy.updateMatrix();
      led.setMatrixAt(idx, dummy.matrix);
      const c = LED_COLORS[Math.floor(rng() * 3)];
      led.setColorAt(idx, c);
      states.push({ next: rng() * 2, base: rng() });
    }
  }
  led.instanceMatrix.needsUpdate = true;
  group.add(led);

  // Cabos descendo pela lateral.
  const cableMat = new THREE.MeshStandardMaterial({ color: '#0c0d10', roughness: 0.7 });
  for (let i = 0; i < 3; i++) {
    const curvePts = [
      new THREE.Vector3(-2.4 + i * 0.05, 1.82, 1.7),
      new THREE.Vector3(-2.3 + i * 0.04, 1.5, 1.86 + i * 0.03),
      new THREE.Vector3(-2.5, 0.9, 1.94),
      new THREE.Vector3(-2.75, 0.1, 1.9 - i * 0.05),
    ];
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curvePts), 20, 0.008, 6), cableMat);
    group.add(tube);
  }

  let focus = 0;
  let last = 0;
  function update(t) {
    const interval = focus > 0.4 ? 0.09 : 0.2;
    if (t - last < interval) return;
    last = t;
    for (let i = 0; i < count; i++) {
      const s = states[i];
      if (t > s.next) {
        s.next = t + 0.15 + s.base * (focus > 0.4 ? 0.8 : 2.2);
        const roll = (s.base + t) % 1;
        const c = roll < 0.55 ? LED_COLORS[1] : roll < 0.8 ? LED_COLORS[2] : roll < 0.94 ? LED_COLORS[3] : LED_COLORS[roll < 0.97 ? 0 : 4];
        led.setColorAt(i, c.clone().multiplyScalar(0.9 + focus * 0.9));
      }
    }
    led.instanceColor.needsUpdate = true;
  }

  return { group, update, setFocus(f) { focus = f; } };
}
