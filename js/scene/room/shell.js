import * as THREE from 'three';
import { woodFloor, plasterWall, ceilingTex } from './textures.js';

// Quarto 6.0 x 4.2 x 2.9 m, piso em y = 0. Janela na parede z = -2.1,
// abertura centrada em (0.8, 1.5), 1.6 x 1.4: é por ela que a câmera entra.

export const ROOM = { W: 6, D: 4.2, H: 2.9, win: { cx: 0.8, cy: 1.5, w: 1.6, h: 1.4 } };

export function buildShell() {
  const group = new THREE.Group();

  const wallMat = new THREE.MeshStandardMaterial({ map: plasterWall(), roughness: 0.94, metalness: 0 });
  const floorMat = new THREE.MeshStandardMaterial({ map: woodFloor(), roughness: 0.5, metalness: 0.04 });
  const ceilMat = new THREE.MeshStandardMaterial({ map: ceilingTex(), roughness: 0.96 });
  const frameMat = new THREE.MeshStandardMaterial({ color: '#181a1f', roughness: 0.4, metalness: 0.6 });
  const baseMat = new THREE.MeshStandardMaterial({ color: '#101216', roughness: 0.5 });

  const add = (geo, mat, x, y, z, { cast = false, receive = true, ry = 0 } = {}) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.y = ry;
    m.castShadow = cast;
    m.receiveShadow = receive;
    group.add(m);
    return m;
  };

  const { W, D, H, win } = ROOM;
  const T = 0.12;

  add(new THREE.BoxGeometry(W, 0.1, D), floorMat, 0, -0.05, 0);
  add(new THREE.BoxGeometry(W, 0.1, D), ceilMat, 0, H + 0.05, 0);

  // Paredes laterais e fundo.
  add(new THREE.BoxGeometry(T, H, D), wallMat, -W / 2 - T / 2, H / 2, 0);
  add(new THREE.BoxGeometry(T, H, D), wallMat, W / 2 + T / 2, H / 2, 0);
  add(new THREE.BoxGeometry(W + T * 2, H, T), wallMat, 0, H / 2, D / 2 + T / 2);

  // Parede da janela (z = -2.1) em quatro segmentos ao redor da abertura.
  const zw = -D / 2 - T / 2;
  const x0 = win.cx - win.w / 2;
  const x1 = win.cx + win.w / 2;
  const y0 = win.cy - win.h / 2;
  const y1 = win.cy + win.h / 2;
  const segL = x0 - (-W / 2);
  const segR = W / 2 - x1;
  add(new THREE.BoxGeometry(segL, H, T), wallMat, -W / 2 + segL / 2, H / 2, zw);
  add(new THREE.BoxGeometry(segR, H, T), wallMat, x1 + segR / 2, H / 2, zw);
  add(new THREE.BoxGeometry(win.w, y0, T), wallMat, win.cx, y0 / 2, zw);
  add(new THREE.BoxGeometry(win.w, H - y1, T), wallMat, win.cx, y1 + (H - y1) / 2, zw);

  // Moldura da janela.
  const fd = 0.2;
  add(new THREE.BoxGeometry(win.w + 0.1, 0.05, fd), frameMat, win.cx, y1 + 0.025, zw, { cast: true });
  add(new THREE.BoxGeometry(win.w + 0.1, 0.05, fd), frameMat, win.cx, y0 - 0.025, zw, { cast: true });
  add(new THREE.BoxGeometry(0.05, win.h + 0.1, fd), frameMat, x0 - 0.025, win.cy, zw, { cast: true });
  add(new THREE.BoxGeometry(0.05, win.h + 0.1, fd), frameMat, x1 + 0.025, win.cy, zw, { cast: true });
  // Peitoril.
  add(new THREE.BoxGeometry(win.w + 0.16, 0.03, 0.3), frameMat, win.cx, y0 - 0.06, zw + 0.06, { cast: true });

  // Névoa luminosa do lado de fora da janela: profundidade sem revelar o void.
  const skyC = document.createElement('canvas');
  skyC.width = skyC.height = 128;
  const skyCtx = skyC.getContext('2d');
  const skyG = skyCtx.createRadialGradient(64, 58, 6, 64, 64, 66);
  skyG.addColorStop(0, 'rgba(126, 118, 96, 0.85)');
  skyG.addColorStop(0.5, 'rgba(64, 60, 52, 0.35)');
  skyG.addColorStop(1, 'rgba(20, 20, 22, 0)');
  skyCtx.fillStyle = skyG;
  skyCtx.fillRect(0, 0, 128, 128);
  const skyTex = new THREE.CanvasTexture(skyC);
  skyTex.colorSpace = THREE.SRGBColorSpace;
  const sky = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 2.8),
    new THREE.MeshBasicMaterial({ map: skyTex, transparent: true, toneMapped: false, depthWrite: false })
  );
  sky.position.set(win.cx + 0.4, win.cy + 0.3, zw - 1.4);
  group.add(sky);

  // Rodapés.
  const bb = (w, x, z, ry = 0) => add(new THREE.BoxGeometry(w, 0.09, 0.02), baseMat, x, 0.045, z, { ry });
  bb(D, -W / 2 + 0.01, 0, Math.PI / 2);
  bb(D, W / 2 - 0.01, 0, Math.PI / 2);
  bb(W, 0, D / 2 - 0.01);
  bb(W, 0, -D / 2 + 0.01);

  return group;
}
