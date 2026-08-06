import * as THREE from 'three';
import { mulberry32 } from '../backdrop.js';

// Bancada de eletrônica na parede esquerda: osciloscópio com forma de onda
// animada, protoboard, ferro de solda e gaveteiro de componentes.

export function buildBench({ scope }) {
  const group = new THREE.Group();
  const rng = mulberry32(555);

  const topMat = new THREE.MeshStandardMaterial({ color: '#2a2d33', roughness: 0.6 });
  const steelMat = new THREE.MeshStandardMaterial({ color: '#191b1f', roughness: 0.45, metalness: 0.6 });

  const top = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 1.35), topMat);
  top.position.set(-2.66, 0.86, -0.6);
  top.castShadow = top.receiveShadow = true;
  group.add(top);

  for (const dz of [-0.6, 0.6]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.84, 0.04), steelMat);
    leg.position.set(-2.66, 0.42, -0.6 + dz);
    leg.castShadow = true;
    group.add(leg);
  }

  // Osciloscópio.
  const scopeBox = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.24, 0.34), new THREE.MeshStandardMaterial({ color: '#22252b', roughness: 0.5 }));
  scopeBox.position.set(-2.72, 1.0, -0.62);
  scopeBox.castShadow = true;
  group.add(scopeBox);

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.27, 0.17),
    new THREE.MeshBasicMaterial({ map: scope.tex, toneMapped: false })
  );
  screen.rotation.y = Math.PI / 2;
  screen.position.set(-2.617, 1.03, -0.62);
  group.add(screen);

  for (let k = 0; k < 4; k++) {
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.012, 10), steelMat);
    knob.rotation.z = Math.PI / 2;
    knob.position.set(-2.617, 0.915, -0.74 + k * 0.055);
    group.add(knob);
  }

  // Protoboard com componentes.
  const proto = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.012, 0.16), new THREE.MeshStandardMaterial({ color: '#9aa0aa', roughness: 0.6 }));
  proto.position.set(-2.6, 0.886, -0.18);
  proto.rotation.y = 0.3;
  group.add(proto);
  const compColors = ['#c23c3c', '#3c66c2', '#d9a05b', '#2ea043'];
  for (let i = 0; i < 8; i++) {
    const comp = new THREE.Mesh(
      new THREE.BoxGeometry(0.01, 0.012, 0.016),
      new THREE.MeshStandardMaterial({ color: compColors[Math.floor(rng() * compColors.length)], roughness: 0.5 })
    );
    comp.position.set(-2.62 + (rng() - 0.5) * 0.06, 0.9, -0.18 + (rng() - 0.5) * 0.12);
    comp.rotation.y = rng();
    group.add(comp);
  }

  // Ferro de solda no suporte.
  const holder = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.09, 12, 1, true), steelMat);
  holder.rotation.z = 1.2;
  holder.position.set(-2.7, 0.93, -1.05);
  group.add(holder);
  const iron = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.003, 0.19, 8), new THREE.MeshStandardMaterial({ color: '#31343c', roughness: 0.4 }));
  iron.rotation.z = 1.25;
  iron.position.set(-2.68, 0.955, -1.05);
  group.add(iron);

  // Gaveteiro de componentes na parede.
  for (let r = 0; r < 3; r++) {
    for (let col = 0; col < 4; col++) {
      const drawer = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.06, 0.075),
        new THREE.MeshStandardMaterial({ color: '#3a3226', roughness: 0.55, transparent: true, opacity: 0.92 })
      );
      drawer.position.set(-2.94, 1.42 + r * 0.07, -0.92 + col * 0.085);
      group.add(drawer);
    }
  }

  // Glow do fósforo do osciloscópio (sobe no destaque).
  const glow = new THREE.PointLight('#7ef2c0', 0.3, 1.2, 2);
  glow.position.set(-2.5, 1.05, -0.62);
  group.add(glow);

  return {
    group,
    setFocus(f) {
      scope.setFocus(f);
      glow.intensity = 0.3 + f * 0.9;
    },
  };
}
