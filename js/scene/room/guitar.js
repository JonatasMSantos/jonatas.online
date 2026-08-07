import * as THREE from 'three';

// Canto de música perto da janela: violão em pé no suporte, microfone
// e interface de áudio. O destaque acende um aro quente sobre as cordas.

function guitarBody() {
  // Perfil figura-8 de um folk, ~0.5 de comprimento.
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0.115, 0, 0.19, 0.055, 0.19, 0.15);
  s.bezierCurveTo(0.19, 0.225, 0.13, 0.26, 0.125, 0.3);
  s.bezierCurveTo(0.12, 0.345, 0.155, 0.37, 0.15, 0.42);
  s.bezierCurveTo(0.145, 0.48, 0.08, 0.5, 0, 0.5);
  s.bezierCurveTo(-0.08, 0.5, -0.145, 0.48, -0.15, 0.42);
  s.bezierCurveTo(-0.155, 0.37, -0.12, 0.345, -0.125, 0.3);
  s.bezierCurveTo(-0.13, 0.26, -0.19, 0.225, -0.19, 0.15);
  s.bezierCurveTo(-0.19, 0.055, -0.115, 0, 0, 0);

  const hole = new THREE.Path();
  hole.absarc(0, 0.315, 0.047, 0, Math.PI * 2, true);
  s.holes.push(hole);

  return new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.006, bevelSegments: 2, curveSegments: 24 });
}

export function buildGuitar() {
  const group = new THREE.Group();

  const woodMat = new THREE.MeshStandardMaterial({ color: '#8a5a2e', roughness: 0.38, metalness: 0.05 });
  const darkMat = new THREE.MeshStandardMaterial({ color: '#1c1410', roughness: 0.5 });
  const steelMat = new THREE.MeshStandardMaterial({ color: '#c8cdd6', roughness: 0.3, metalness: 0.9 });
  const standMat = new THREE.MeshStandardMaterial({ color: '#121316', roughness: 0.5, metalness: 0.5 });

  const g = new THREE.Group();

  const body = new THREE.Mesh(guitarBody(), woodMat);
  body.castShadow = true;
  g.add(body);

  // Fundo escuro visível pela boca.
  const back = new THREE.Mesh(new THREE.CircleGeometry(0.06, 16), new THREE.MeshBasicMaterial({ color: '#0a0705' }));
  back.position.set(0, 0.315, 0.03);
  g.add(back);

  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.58, 0.024), darkMat);
  neck.position.set(0, 0.74, 0.06);
  neck.castShadow = true;
  g.add(neck);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.062, 0.15, 0.02), woodMat);
  head.position.set(0, 1.09, 0.052);
  head.rotation.x = -0.16;
  g.add(head);

  for (let i = 0; i < 6; i++) {
    const peg = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.02, 8), steelMat);
    peg.rotation.z = Math.PI / 2;
    peg.position.set(i % 2 === 0 ? -0.04 : 0.04, 1.035 + Math.floor(i / 2) * 0.045, 0.05);
    g.add(peg);
  }

  // Rastilho saliente no tampo e pestana no braço: as cordas descem do
  // rastilho até a pestana sempre por FORA do corpo e do braço.
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.024, 0.024), darkMat);
  bridge.position.set(0, 0.165, 0.118);
  g.add(bridge);
  const nut = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.008, 0.014), darkMat);
  nut.position.set(0, 1.03, 0.082);
  g.add(nut);

  const strFrom = new THREE.Vector3(0, 0.168, 0.132);  // topo do rastilho
  const strTo = new THREE.Vector3(0, 1.03, 0.09);      // topo da pestana
  const strDir = strTo.clone().sub(strFrom);
  const strLen = strDir.length();
  const strQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), strDir.clone().normalize());
  for (let i = 0; i < 6; i++) {
    const string = new THREE.Mesh(new THREE.CylinderGeometry(0.0011, 0.0011, strLen, 4), steelMat);
    string.position.copy(strFrom).addScaledVector(strDir, 0.5);
    string.position.x = -0.02 + i * 0.008;
    string.quaternion.copy(strQuat);
    g.add(string);
  }

  g.position.set(0, 0.06, 0);
  g.rotation.z = -0.1;
  g.rotation.x = -0.14;

  // Suporte: mastro atrás do corpo e dois berços baixos segurando o bojo.
  // Nada cruza o tampo acima da altura do bojo inferior.
  const standPole = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.5, 8), standMat);
  standPole.position.set(0, 0.25, -0.13);
  standPole.rotation.x = 0.22;
  group.add(standPole);
  for (const a of [-0.6, 0.6, Math.PI]) {
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.015, 0.22), standMat);
    foot.position.set(Math.sin(a) * 0.11, 0.008, -0.18 + Math.cos(a) * 0.11);
    foot.rotation.y = -a;
    group.add(foot);
  }
  for (const dx of [-1, 1]) {
    const cradle = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.17, 8), standMat);
    cradle.position.set(dx * 0.13, 0.07, 0.05);
    cradle.rotation.z = dx * 1.05;
    cradle.rotation.x = -0.35;
    group.add(cradle);
  }

  group.add(g);
  group.position.set(-1.62, 0, -1.62);
  group.rotation.y = 0.72;

  // Microfone.
  const mic = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.012, 1.3, 8), standMat);
  pole.position.y = 0.65;
  const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.5, 8), standMat);
  boom.position.set(0.16, 1.28, 0);
  boom.rotation.z = 1.15;
  const capsule = new THREE.Mesh(new THREE.CapsuleGeometry(0.024, 0.05, 4, 10), new THREE.MeshStandardMaterial({ color: '#22252b', roughness: 0.3, metalness: 0.7 }));
  capsule.position.set(0.36, 1.36, 0);
  capsule.rotation.z = 1.1;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.02, 16), standMat);
  base.position.y = 0.01;
  mic.add(pole, boom, capsule, base);
  mic.position.set(-1.05, 0, -1.88);
  mic.rotation.y = -0.6;
  group.add(mic);

  // Interface de áudio sobre caixote.
  const crate = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.3, 0.3), new THREE.MeshStandardMaterial({ color: '#26211a', roughness: 0.7 }));
  crate.position.set(-2.0, 0.15, -1.75);
  crate.castShadow = true;
  group.add(crate);
  const iface = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.14), new THREE.MeshStandardMaterial({ color: '#7a2e2e', roughness: 0.45 }));
  iface.position.set(-2.0, 0.325, -1.75);
  group.add(iface);
  for (let k = 0; k < 4; k++) {
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.012, 10), steelMat);
    knob.position.set(-2.06 + k * 0.04, 0.356, -1.72);
    group.add(knob);
  }

  // Aro quente sobre as cordas (sobe no destaque).
  const light = new THREE.PointLight('#ffd9a5', 0, 2.6, 1.8);
  light.position.set(-1.45, 1.15, -1.35);
  group.add(light);

  return {
    group,
    setFocus(f) { light.intensity = f * 3.2; },
  };
}
