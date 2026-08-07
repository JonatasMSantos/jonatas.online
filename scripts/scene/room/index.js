import * as THREE from 'three';
import { buildShell, ROOM } from './shell.js';
import { buildDesk } from './desk.js';
import { buildRack } from './rack.js';
import { buildShelf } from './shelf.js';
import { buildBench } from './bench.js';
import { buildGuitar } from './guitar.js';
import { buildProps } from './props.js';
import { codeScreen, terminalScreen, scopeScreen } from './textures.js';
import { makeShaft } from '../backdrop.js';
import { ROOM_STOPS } from '../../data/stops.js';

// Montagem do quarto + luzes + sistema de destaque por parada.
// Sem outline: o destaque é luz real (spot dedicado) + pulso emissivo.

export function buildRoom(tier) {
  const group = new THREE.Group();

  const code = codeScreen();
  const term = terminalScreen();
  const scope = scopeScreen();

  group.add(buildShell());
  const desk = buildDesk({ code, term });
  const rack = buildRack();
  const shelf = buildShelf();
  const bench = buildBench({ scope });
  const guitar = buildGuitar();
  const props = buildProps();
  group.add(desk.group, rack.group, shelf.group, bench.group, guitar.group, props.group);

  // Sol pela janela: única luz com sombra.
  const sun = new THREE.DirectionalLight('#f5dcb2', 3.0);
  sun.position.set(2.1, 5.0, -6.8);
  sun.target.position.set(0.2, 0.4, 0.9);
  if (tier.shadows) {
    sun.castShadow = true;
    sun.shadow.mapSize.setScalar(tier.shadowMap);
    sun.shadow.camera.left = -4;
    sun.shadow.camera.right = 4;
    sun.shadow.camera.top = 4;
    sun.shadow.camera.bottom = -4;
    sun.shadow.camera.near = 2;
    sun.shadow.camera.far = 16;
    sun.shadow.bias = -0.0005;
  }
  group.add(sun, sun.target);

  const hemi = new THREE.HemisphereLight('#7f8db0', '#171310', 0.42);
  group.add(hemi);
  group.add(new THREE.AmbientLight(0xffffff, 0.14));

  // Feixe volumétrico entrando pela janela.
  const shaft = makeShaft({ width: 1.7, length: 4.8, color: '#ffe9c4', opacity: 0.2 });
  shaft.group.position.set(ROOM.win.cx, ROOM.win.cy + 0.1, -ROOM.D / 2 + 0.06);
  const beamDir = new THREE.Vector3(-0.28, -0.6, 0.75).normalize();
  shaft.group.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), beamDir);
  group.add(shaft.group);

  // Dois spots reutilizáveis para o destaque (pares e ímpares alternam).
  const spots = [0, 1].map(() => {
    const s = new THREE.SpotLight('#ffe9c8', 0, 10, 0.6, 0.85, 1.4);
    group.add(s, s.target);
    return s;
  });

  const hooks = {
    intro: (f) => props.setFocus(f),
    arch: (f) => shelf.setFocus(f),
    fullstack: (f) => { desk.screens.m1.color.setScalar(0.8 + f * 0.5); desk.glow.intensity = 1.6 + f * 1.6; },
    ai: (f) => { term.setFocus(f); desk.screens.m2.color.setScalar(0.8 + f * 0.55); },
    infra: (f) => rack.setFocus(f),
    iot: (f) => bench.setFocus(f),
    music: (f) => guitar.setFocus(f),
  };

  function setFocus(focus) {
    let maxF = 0;
    for (let i = 0; i < ROOM_STOPS.length; i++) {
      const stop = ROOM_STOPS[i];
      const f = focus[i];
      if (f > maxF) maxF = f;
      hooks[stop.id](f);
      const spot = spots[i % 2];
      if (f > 0.001) {
        spot.position.set(stop.cam[0], stop.cam[1] + 1.0, stop.cam[2]);
        spot.target.position.set(...stop.look);
        spot.intensity = Math.max(spot.intensity, 7.0 * Math.pow(f, 1.3));
      }
    }
    hemi.intensity = 0.42 - 0.18 * maxF;
    return maxF;
  }

  function update(t, dt, focus, visible) {
    if (!visible) return;
    for (const s of spots) s.intensity = 0;
    setFocus(focus);
    code.update(t);
    term.update(t);
    scope.update(t);
    rack.update(t);
  }

  return { group, update, shaftMaterial: shaft.material };
}
