import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RING_A, RING_B } from '../data/skills.js';

const AMBER = '#d9a05b';
const PIVOT = new THREE.Vector3(0, 1.12, 0);

// Label tipográfico bakeado em canvas: numeral serif âmbar + nome letterspaced.
function bakeLabel(index, text) {
  const scale = 2;
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  const idx = String(index + 1).padStart(2, '0');
  const labelFont = `500 ${34 * scale}px "General Sans", sans-serif`;
  const idxFont = `italic 400 ${26 * scale}px "Instrument Serif", serif`;
  const ls = 7 * scale;

  ctx.font = labelFont;
  const charW = [...text].reduce((acc, ch) => acc + ctx.measureText(ch).width + ls, 0);
  ctx.font = idxFont;
  const idxW = ctx.measureText(idx).width;
  const gap = 14 * scale;
  const pad = 8 * scale;
  const w = Math.ceil(idxW + gap + charW + pad * 2);
  const h = 56 * scale;
  c.width = w;
  c.height = h;

  ctx.textBaseline = 'middle';
  ctx.font = idxFont;
  ctx.fillStyle = AMBER;
  ctx.fillText(idx, pad, h * 0.56);

  ctx.font = labelFont;
  ctx.fillStyle = '#ffffff';
  let x = pad + idxW + gap;
  for (const ch of text) {
    ctx.fillText(ch, x, h * 0.54);
    x += ctx.measureText(ch).width + ls;
  }

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return { tex, aspect: w / h };
}

function makeRing({ rx, rz, tilt, labels, labelStart }) {
  const group = new THREE.Group();

  const pts = [];
  for (let i = 0; i <= 128; i++) {
    const a = (i / 128) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * rx, 0, Math.sin(a) * rz));
  }
  const curve = new THREE.CatmullRomCurve3(pts, true);
  const tubeMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(AMBER).multiplyScalar(2.2),
    toneMapped: false,
    transparent: true,
    opacity: 0.9,
  });
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 160, 0.0055, 6, true), tubeMat);
  group.add(tube);

  const labelMeshes = [];
  labels.forEach((text, i) => {
    const { tex, aspect } = bakeLabel(labelStart + i, text);
    const height = 0.085;
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      opacity: 0,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(height * aspect, height), mat);
    const a = (i / labels.length) * Math.PI * 2;
    mesh.position.set(Math.cos(a) * (rx + 0.06), 0.035, Math.sin(a) * (rz + 0.06));
    group.add(mesh);
    labelMeshes.push(mesh);
  });

  group.rotation.x = tilt;
  return { group, tubeMat, labelMeshes };
}

export async function buildHero(tier) {
  const group = new THREE.Group();

  // Luzes do hero em contraluz: o busto é recortado por trás e o rosto fica
  // em meia-luz suave (luz frontal forte revela imperfeições da malha).
  group.add(new THREE.AmbientLight(0xffffff, 0.16));
  const hemi = new THREE.HemisphereLight('#aebbdd', '#080910', 0.34);
  group.add(hemi);

  const rimCool = new THREE.PointLight('#dde6ff', 30, 16, 2);
  rimCool.position.set(-2.1, 2.7, -2.1);
  group.add(rimCool);

  const rimWarm = new THREE.PointLight('#ffd9a5', 24, 16, 2);
  rimWarm.position.set(2.3, 1.7, -2.3);
  group.add(rimWarm);

  const fill = new THREE.PointLight('#8593bb', 5, 18, 2);
  fill.position.set(2.4, 2.2, 5.4);
  group.add(fill);

  // Halo radiante atrás do busto: recorta a silhueta e alimenta o bloom.
  const haloCanvas = document.createElement('canvas');
  haloCanvas.width = haloCanvas.height = 256;
  const hctx = haloCanvas.getContext('2d');
  const hg = hctx.createRadialGradient(128, 128, 10, 128, 128, 126);
  hg.addColorStop(0, 'rgba(255, 244, 224, 0.9)');
  hg.addColorStop(0.35, 'rgba(214, 196, 168, 0.4)');
  hg.addColorStop(1, 'rgba(20, 20, 24, 0)');
  hctx.fillStyle = hg;
  hctx.fillRect(0, 0, 256, 256);
  const haloTex = new THREE.CanvasTexture(haloCanvas);
  haloTex.colorSpace = THREE.SRGBColorSpace;
  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 3.6),
    new THREE.MeshBasicMaterial({
      map: haloTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
      opacity: 0.85,
    })
  );
  halo.position.set(0, 1.3, -1.7);
  group.add(halo);

  // Busto.
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(tier.modelUrl);
  const bust = gltf.scene;
  const box = new THREE.Box3().setFromObject(bust);
  const sizeV = box.getSize(new THREE.Vector3());
  const s = 1.62 / sizeV.y;
  bust.scale.setScalar(s);
  box.setFromObject(bust);
  const center = box.getCenter(new THREE.Vector3());
  bust.position.x -= center.x;
  bust.position.z -= center.z;
  bust.position.y -= box.min.y;
  bust.rotation.y = 0.12;
  bust.traverse((o) => {
    if (o.isMesh) {
      o.frustumCulled = true;
      if (o.material) {
        o.material.envMapIntensity = 0.45;
        if (o.material.emissive) o.material.emissiveIntensity = 0.22;
      }
    }
  });
  group.add(bust);

  // Anéis orbitais com as skills.
  const ringA = makeRing({ rx: 1.42, rz: 1.1, tilt: THREE.MathUtils.degToRad(74), labels: RING_A, labelStart: 0 });
  const ringB = makeRing({ rx: 1.78, rz: 1.34, tilt: THREE.MathUtils.degToRad(-68), labels: RING_B, labelStart: 6 });
  const rings = new THREE.Group();
  ringA.group.position.copy(PIVOT);
  ringB.group.position.copy(PIVOT);
  rings.add(ringA.group, ringB.group);
  group.add(rings);

  const tmpQ = new THREE.Quaternion();
  const tmpQ2 = new THREE.Quaternion();
  const wp = new THREE.Vector3();
  const v1 = new THREE.Vector3();
  const v2 = new THREE.Vector3();
  const camDir = new THREE.Vector3();

  let revealT = 0;

  function update(t, dt, camera, heroExit, revealed) {
    ringA.group.rotation.y = t * 0.10;
    ringB.group.rotation.y = -t * 0.075;

    // Halo sempre atrás do busto em relação à câmera.
    camDir.copy(camera.position).sub(PIVOT).normalize();
    halo.position.copy(PIVOT).addScaledVector(camDir, -1.7);
    halo.position.y = 1.3;
    halo.lookAt(camera.position);

    // Entrada suave dos anéis após o reveal do preloader.
    if (revealed && revealT < 1) revealT = Math.min(1, revealT + dt / 1.6);
    const fade = revealT * (1 - heroExit);
    const scale = 1 + heroExit * 0.18;
    rings.scale.setScalar(scale);
    ringA.tubeMat.opacity = 0.9 * fade;
    ringB.tubeMat.opacity = 0.9 * fade;

    // Labels billboard em espaço de mundo + fade quando atrás do busto.
    camera.getWorldQuaternion(tmpQ);
    v2.copy(camera.position).sub(PIVOT).normalize();
    for (const ring of [ringA, ringB]) {
      ring.group.getWorldQuaternion(tmpQ2).invert();
      for (const label of ring.labelMeshes) {
        label.quaternion.copy(tmpQ2).multiply(tmpQ);
        label.getWorldPosition(wp);
        v1.copy(wp).sub(PIVOT).normalize();
        const facing = THREE.MathUtils.smoothstep(v1.dot(v2), -0.5, 0.12);
        label.material.opacity = fade * (0.28 + 0.72 * facing);
      }
    }
  }

  return { group, update, pivot: PIVOT };
}
