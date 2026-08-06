import * as THREE from 'three';

// Mesa de trabalho contra a parede direita (x = +3), monitores voltados para
// dentro do quarto. Monitor 1: editor de código. Monitor 2: terminal de agente.

function monitor(screenTex, w = 0.6, h = 0.35) {
  const g = new THREE.Group();
  const shellMat = new THREE.MeshStandardMaterial({ color: '#0c0d10', roughness: 0.35, metalness: 0.5 });
  const panel = new THREE.Mesh(new THREE.BoxGeometry(0.022, h + 0.02, w + 0.02), shellMat);
  panel.castShadow = true;
  g.add(panel);

  const mat = new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.015, h - 0.015), mat);
  screen.rotation.y = -Math.PI / 2;
  screen.position.x = -0.013;
  g.add(screen);

  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 0.16, 10), shellMat);
  stand.position.set(0.02, -h / 2 - 0.08, 0);
  g.add(stand);
  const foot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.014, 0.2), shellMat);
  foot.position.set(0.02, -h / 2 - 0.16, 0);
  g.add(foot);
  return { group: g, screenMat: mat };
}

export function buildDesk({ code, term }) {
  const group = new THREE.Group();

  const woodMat = new THREE.MeshStandardMaterial({ color: '#33291d', roughness: 0.55, metalness: 0.05 });
  const steelMat = new THREE.MeshStandardMaterial({ color: '#191b1f', roughness: 0.45, metalness: 0.65 });

  const top = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.045, 1.75), woodMat);
  top.position.set(2.5, 0.745, 0.45);
  top.castShadow = top.receiveShadow = true;
  group.add(top);

  for (const dz of [-0.8, 0.8]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.72, 0.05), steelMat);
    leg.position.set(2.5, 0.36, 0.45 + dz);
    leg.castShadow = true;
    group.add(leg);
  }

  const m1 = monitor(code.tex);
  m1.group.position.set(2.52, 1.1, 0.14);
  m1.group.rotation.y = 0.14;
  group.add(m1.group);

  const m2 = monitor(term.tex);
  m2.group.position.set(2.54, 1.1, 0.78);
  m2.group.rotation.y = -0.16;
  group.add(m2.group);

  const kb = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.016, 0.44), new THREE.MeshStandardMaterial({ color: '#22242a', roughness: 0.6 }));
  kb.position.set(2.24, 0.777, 0.44);
  kb.rotation.y = 0.04;
  kb.castShadow = true;
  group.add(kb);

  const mouse = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.03, 4, 10), new THREE.MeshStandardMaterial({ color: '#1c1e24', roughness: 0.4 }));
  mouse.rotation.z = Math.PI / 2;
  mouse.rotation.y = 0.5;
  mouse.position.set(2.26, 0.775, 0.76);
  group.add(mouse);

  // Caneca.
  const mugPts = [];
  for (let i = 0; i <= 8; i++) mugPts.push(new THREE.Vector2(0.032 + Math.sin(i / 8) * 0.004, i * 0.0105));
  const mug = new THREE.Mesh(new THREE.LatheGeometry(mugPts, 18), new THREE.MeshStandardMaterial({ color: '#8a4a2e', roughness: 0.4 }));
  mug.position.set(2.3, 0.768, 1.02);
  mug.castShadow = true;
  group.add(mug);

  // Luminária articulada com poça de luz quente.
  const lampMat = new THREE.MeshStandardMaterial({ color: '#101114', roughness: 0.35, metalness: 0.7 });
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.02, 14), lampMat);
  lampBase.position.set(2.62, 0.78, 1.28);
  const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.34, 8), lampMat);
  arm1.position.set(2.6, 0.94, 1.24);
  arm1.rotation.z = 0.3;
  const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.3, 8), lampMat);
  arm2.position.set(2.52, 1.1, 1.16);
  arm2.rotation.set(0.5, 0, -0.9);
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.09, 14, 1, true), lampMat);
  head.position.set(2.44, 1.13, 1.06);
  head.rotation.set(-0.7, 0, 0.7);
  group.add(lampBase, arm1, arm2, head);

  const lampBulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.018, 10, 10),
    new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd9a5').multiplyScalar(1.6), toneMapped: false })
  );
  lampBulb.position.copy(head.position);
  group.add(lampBulb);

  const lampLight = new THREE.SpotLight('#ffd9a5', 4.0, 3.4, 0.75, 0.6, 1.4);
  lampLight.position.copy(head.position);
  lampLight.target.position.set(2.3, 0.75, 0.7);
  group.add(lampLight, lampLight.target);

  const glow = new THREE.PointLight('#9db6ff', 1.6, 2.4, 2);
  glow.position.set(2.15, 1.12, 0.46);
  group.add(glow);

  return { group, screens: { m1: m1.screenMat, m2: m2.screenMat }, glow, lampLight };
}
