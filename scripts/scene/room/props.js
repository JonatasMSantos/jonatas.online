import * as THREE from 'three';
import { mulberry32 } from '../backdrop.js';
import { rugTex, contactShadow, monogram } from './textures.js';

// Cadeira, tapete, planta, fita de LED, quadro e sombras de contato.

export function buildProps() {
  const group = new THREE.Group();
  const rng = mulberry32(9001);

  // Cadeira de escritório voltada para a mesa.
  const chair = new THREE.Group();
  const leatherMat = new THREE.MeshStandardMaterial({ color: '#15171c', roughness: 0.55 });
  const steelMat = new THREE.MeshStandardMaterial({ color: '#1c1e24', roughness: 0.4, metalness: 0.7 });

  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.06, 0.44), leatherMat);
  seat.position.y = 0.47;
  seat.castShadow = true;
  chair.add(seat);

  const back = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.48, 0.52), leatherMat);
  back.position.set(-0.31, 0.74, 0);
  back.rotation.z = 0.18;
  back.castShadow = true;
  chair.add(back);

  const makeRod = (from, to, radius = 0.011) => {
    const dir = to.clone().sub(from);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, dir.length(), 8), steelMat);
    rod.position.copy(from).add(to).multiplyScalar(0.5);
    rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    rod.castShadow = true;
    chair.add(rod);
  };

  for (const dz of [-0.08, 0.08]) {
    makeRod(new THREE.Vector3(-0.18, 0.49, dz), new THREE.Vector3(-0.3, 0.62, dz * 1.35));
  }

  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.34, 10), steelMat);
  column.position.y = 0.28;
  chair.add(column);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.02, 0.035), steelMat);
    leg.position.set(Math.cos(a) * 0.13, 0.05, Math.sin(a) * 0.13);
    leg.rotation.y = -a;
    chair.add(leg);
    const caster = new THREE.Mesh(new THREE.SphereGeometry(0.021, 8, 8), leatherMat);
    caster.position.set(Math.cos(a) * 0.25, 0.025, Math.sin(a) * 0.25);
    chair.add(caster);
  }
  // Afastada da mesa: o tampo começa em x 2.11, nada da cadeira o cruza.
  chair.position.set(1.82, 0, 0.62);
  chair.rotation.y = -0.5;
  group.add(chair);

  // Tapete.
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 1.85), new THREE.MeshStandardMaterial({ map: rugTex(), roughness: 0.95 }));
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0.35, 0.012, 0.3);
  rug.receiveShadow = true;
  group.add(rug);

  // Planta.
  const plant = new THREE.Group();
  const pot = new THREE.Mesh(
    new THREE.LatheGeometry([new THREE.Vector2(0.001, 0), new THREE.Vector2(0.12, 0.01), new THREE.Vector2(0.1, 0.16), new THREE.Vector2(0.115, 0.3)], 18),
    new THREE.MeshStandardMaterial({ color: '#23262c', roughness: 0.6 })
  );
  plant.add(pot);
  const leafMat = new THREE.MeshStandardMaterial({ color: '#2c4a33', roughness: 0.9, flatShading: true });
  for (let i = 0; i < 9; i++) {
    const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.09 + rng() * 0.07, 0), leafMat);
    leaf.position.set((rng() - 0.5) * 0.3, 0.45 + rng() * 0.42, (rng() - 0.5) * 0.3);
    leaf.rotation.set(rng() * 3, rng() * 3, rng() * 3);
    leaf.castShadow = true;
    plant.add(leaf);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.009, leaf.position.y, 6), new THREE.MeshStandardMaterial({ color: '#1e3324', roughness: 0.9 }));
    stem.position.set(leaf.position.x * 0.6, leaf.position.y / 2, leaf.position.z * 0.6);
    plant.add(stem);
  }
  plant.position.set(2.6, 0, -1.72);
  group.add(plant);

  // Fita de LED âmbar atrás da mesa.
  const strip = new THREE.Mesh(
    new THREE.BoxGeometry(0.01, 0.01, 1.75),
    new THREE.MeshBasicMaterial({ color: new THREE.Color('#d9a05b').multiplyScalar(1.1), toneMapped: false })
  );
  strip.position.set(2.985, 1.98, 0.45);
  group.add(strip);
  const stripLight = new THREE.PointLight('#d9a05b', 1.1, 2.8, 2);
  stripLight.position.set(2.85, 1.95, 0.45);
  group.add(stripLight);

  // Quadro com monograma na parede do fundo.
  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.62, 0.03), new THREE.MeshStandardMaterial({ color: '#0c0d10', roughness: 0.4 }));
  frame.position.set(-0.75, 1.72, 2.06);
  group.add(frame);
  const art = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.56), new THREE.MeshBasicMaterial({ map: monogram(), toneMapped: false }));
  art.position.set(-0.75, 1.72, 2.04);
  art.rotation.y = Math.PI;
  group.add(art);

  // Sombras de contato: decais radiais sob cada móvel.
  const blobTex = contactShadow();
  const blob = (x, z, w, d, opacity = 0.55) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, d),
      new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, opacity, depthWrite: false })
    );
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.006, z);
    m.renderOrder = 1;
    group.add(m);
  };
  blob(2.45, 0.45, 1.3, 2.1);      // mesa
  blob(1.82, 0.62, 0.9, 0.9);      // cadeira
  blob(-2.55, 1.45, 1.1, 1.2);     // rack
  blob(0.9, 1.9, 1.9, 0.8);        // estante
  blob(-2.66, -0.6, 0.9, 1.7);     // bancada
  blob(-1.62, -1.62, 0.9, 0.9);    // violão
  blob(-2.0, -1.75, 0.6, 0.55);    // caixote
  blob(2.6, -1.72, 0.55, 0.55);    // planta

  return { group };
}
