import * as THREE from 'three';
import { ROOM_STOPS, ROOM_EXIT } from '../data/stops.js';
import { clamp01, smoothstep, lerp, damp } from '../springs.js';

export const ROOM_ORIGIN = new THREE.Vector3(0, -31.45, 0);

const toWorld = ([x, y, z]) => new THREE.Vector3(x, y + ROOM_ORIGIN.y, z);

// Curva mestra: saída do hero, mergulho, janela, seis paradas, pouso final.
const CONTROL = [
  new THREE.Vector3(0.0, 2.6, 3.4),
  new THREE.Vector3(0.4, -7.0, 4.4),
  new THREE.Vector3(1.2, -17.0, 0.8),
  new THREE.Vector3(0.8, -25.5, -4.6),
  toWorld([0.8, 1.55, -4.2]),
  toWorld([0.8, 1.52, -2.1]),   // exatamente no plano da janela
  toWorld([0.78, 1.5, -1.4]),
  ...ROOM_STOPS.map((s) => toWorld(s.cam)),
  toWorld(ROOM_EXIT.cam),
];

const curve = new THREE.CatmullRomCurve3(CONTROL, false, 'centripetal');

// Fração de arco (u) de cada ponto de controle.
const uOfControl = (() => {
  const N = 1200;
  const lengths = [0];
  let prev = curve.getPoint(0);
  for (let i = 1; i <= N; i++) {
    const p = curve.getPoint(i / N);
    lengths.push(lengths[i - 1] + p.distanceTo(prev));
    prev = p;
  }
  const total = lengths[N];
  return CONTROL.map((_, ci) => {
    const t = ci / (CONTROL.length - 1);
    const idx = Math.min(N, Math.round(t * N));
    return lengths[idx] / total;
  });
})();

const U_WINDOW_IN = uOfControl[6];
const STOP_U = ROOM_STOPS.map((_, i) => uOfControl[7 + i]);
const easeInOut = (t) => t * t * (3 - 2 * t);

// p_room -> { u, focus[] }: platôs de dwell em cada parada, viagem suave entre.
const UNITS = ROOM_STOPS.length + 0.6;
function roomMap(p) {
  const focus = new Array(ROOM_STOPS.length).fill(0);
  let u;
  const x = p * UNITS;
  const seg = Math.min(Math.floor(x), ROOM_STOPS.length);

  if (seg >= ROOM_STOPS.length) {
    // trecho final: última parada -> pouso
    const f = clamp01((x - ROOM_STOPS.length) / 0.6);
    u = lerp(STOP_U[ROOM_STOPS.length - 1], 1, easeInOut(f));
  } else {
    const local = x - seg;
    const dwell = ROOM_STOPS[seg].dwell;
    const travel = 1 - dwell;
    const from = seg === 0 ? U_WINDOW_IN : STOP_U[seg - 1];
    u = local < travel
      ? lerp(from, STOP_U[seg], easeInOut(local / travel))
      : STOP_U[seg];
  }

  // foco: sobe no fim da viagem, pleno no platô, desce no início da próxima.
  for (let i = 0; i < ROOM_STOPS.length; i++) {
    const dwell = ROOM_STOPS[i].dwell;
    const start = i + (1 - dwell);   // início do platô, em unidades
    const end = i + 1;               // fim do platô
    const rise = smoothstep(start - 0.26, start - 0.03, x);
    const fall = 1 - smoothstep(end + 0.03, end + 0.26, x);
    focus[i] = Math.min(rise, fall);
  }

  return { u, focus };
}

const tmpAhead = new THREE.Vector3();
const tmpLook = new THREE.Vector3();
const stopLooks = ROOM_STOPS.map((s) => toWorld(s.look));

export function createCameraRig() {
  const pointer = { x: 0, y: 0, sx: 0, sy: 0, moved: false };
  // Arrastar gira o busto no hero, com inércia e retorno lento à frente.
  const drag = { active: false, lastX: 0, offset: 0, vel: 0 };

  addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / innerHeight) * 2 + 1;
    pointer.moved = true;
    if (drag.active) {
      const dx = e.clientX - drag.lastX;
      drag.lastX = e.clientX;
      drag.vel = dx * 0.005;
      drag.offset += dx * 0.005;
    }
  }, { passive: true });

  addEventListener('pointerdown', (e) => {
    if (e.target.closest && e.target.closest('a, button, .stop-panel, #nav, #menu')) return;
    drag.active = true;
    drag.lastX = e.clientX;
    drag.vel = 0;
    document.body.classList.add('grabbing');
  }, { passive: true });
  const endDrag = () => { drag.active = false; document.body.classList.remove('grabbing'); };
  addEventListener('pointerup', endDrag, { passive: true });
  addEventListener('pointercancel', endDrag, { passive: true });

  const state = { focus: new Array(ROOM_STOPS.length).fill(0), u: 0, inRoom: false };
  const heroLook = new THREE.Vector3(0, 1.12, 0);
  const exitLook = new THREE.Vector3(0, 1.3, 0);

  function update(camera, progress, t, dt) {
    pointer.sx += (pointer.x - pointer.sx) * Math.min(1, dt * 3);
    pointer.sy += (pointer.y - pointer.sy) * Math.min(1, dt * 3);
    const px = pointer.moved ? pointer.sx : 0;
    const py = pointer.moved ? pointer.sy : 0;

    const pHero = progress.hero;
    const pDive = progress.dive;
    const pRoom = progress.room;

    let roll = 0;

    if (pDive <= 0 && pRoom <= 0) {
      // Regime hero: balanço natural centrado no rosto + arrasto do usuário.
      // A saída interpola azimute/raio/altura (nunca em linha reta, que
      // atravessaria o busto quando a órbita está do lado oposto).
      if (!drag.active) {
        drag.offset += drag.vel;
        drag.vel *= Math.pow(0.94, dt * 60);
        const home = Math.round(drag.offset / (Math.PI * 2)) * Math.PI * 2;
        drag.offset = damp(drag.offset, home, 0.012, dt);
      }
      const exit = smoothstep(0.55, 0.98, pHero);
      const az0 = Math.PI / 2;   // frente do busto e ponto de partida do mergulho
      const azFree = az0 + Math.sin(t * 0.16) * 0.35 + px * 0.5 - drag.offset;
      let dAz = (azFree - az0) % (Math.PI * 2);
      if (dAz > Math.PI) dAz -= Math.PI * 2;
      if (dAz < -Math.PI) dAz += Math.PI * 2;
      const az = az0 + dAz * (1 - exit);
      const radius = lerp(4.4 - pHero * 0.35, 3.4, exit);
      const eyeY = lerp(1.5 + py * 0.45 - pHero * 0.25, CONTROL[0].y, exit);
      const eye = new THREE.Vector3(Math.cos(az) * radius, eyeY, Math.sin(az) * radius);
      const look = heroLook.clone().lerp(exitLook, exit);
      camera.position.copy(eye);
      camera.lookAt(look);
      roll = 0.055 * (1 - exit);
      state.u = 0;
      state.focus.fill(0);
      state.inRoom = false;
    } else {
      // Regime de trilho: mergulho + quarto.
      let u, focus;
      if (pRoom <= 0) {
        u = easeInOut(pDive) * U_WINDOW_IN;
        focus = state.focus.fill(0);
      } else {
        const m = roomMap(pRoom);
        u = m.u;
        focus = m.focus;
        state.focus = focus;
      }
      state.u = u;
      state.inRoom = pRoom > 0;

      camera.position.copy(curve.getPointAt(u));

      // Olhar: ponto adiante no trilho, cedendo ao alvo da parada em foco.
      tmpLook.copy(curve.getPointAt(Math.min(u + 0.045, 1)));
      // Início do mergulho: inclina do olhar do hero para o trilho, sem pop.
      const tiltIn = smoothstep(0, 0.14, pDive);
      if (tiltIn < 1 && pRoom <= 0) tmpLook.lerp(exitLook, 1 - tiltIn);
      let maxF = 0;
      for (let i = 0; i < focus.length; i++) {
        if (focus[i] > 0.001) {
          tmpLook.lerp(stopLooks[i], focus[i]);
          if (focus[i] > maxF) maxF = focus[i];
          roll += THREE.MathUtils.degToRad(ROOM_STOPS[i].roll) * focus[i];
        }
      }
      // Fim do trilho: o ponto adiante degenera perto de u = 1, então o olhar
      // cede ao alvo de saída antes disso.
      tmpLook.lerp(toWorld(ROOM_EXIT.look), smoothstep(0.88, 0.96, pRoom));

      // Sway sutil do ponteiro dentro do quarto.
      if (state.inRoom) {
        camera.position.x += px * 0.05;
        camera.position.y += py * 0.04;
      }
      camera.lookAt(tmpLook);
    }

    camera.rotation.z += roll;
    return state;
  }

  return { update, state, pointer };
}
