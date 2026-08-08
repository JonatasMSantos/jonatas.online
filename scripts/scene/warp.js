import * as THREE from 'three';
import { mulberry32 } from './backdrop.js';
import { smoothstep } from '../springs.js';

// Efeito "velocidade da luz" do mergulho: estrelas como segmentos de linha em
// espaço de visão (o grupo copia posição/orientação da câmera). A cauda de
// cada estrela estica com a velocidade; tudo é função pura do progresso do
// scroll (mais um leve drift temporal), então o scroll reverso é simétrico.

const SPAN = 42;          // profundidade do túnel em unidades de visão
const TRAVEL_DIST = 150;  // distância percorrida ao longo do dive inteiro

export function makeWarp(count = 700) {
  const rng = mulberry32(4242);
  const positions = new Float32Array(count * 2 * 3);
  const ends = new Float32Array(count * 2);
  const brights = new Float32Array(count * 2);

  for (let i = 0; i < count; i++) {
    // Anel ao redor do centro: o miolo fica livre para o texto.
    const a = rng() * Math.PI * 2;
    const r = 0.7 + Math.pow(rng(), 0.75) * 8;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    const z = -rng() * SPAN;
    const b = 0.3 + rng() * 0.7;
    for (let e = 0; e < 2; e++) {
      const v = i * 2 + e;
      positions[v * 3] = x;
      positions[v * 3 + 1] = y;
      positions[v * 3 + 2] = z;
      ends[v] = e;
      brights[v] = b;
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aEnd', new THREE.BufferAttribute(ends, 1));
  geo.setAttribute('aBright', new THREE.BufferAttribute(brights, 1));

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
    uniforms: {
      uTravel: { value: 0 },
      uStretch: { value: 0 },
      uOpacity: { value: 0 },
      uColor: { value: new THREE.Color('#cfe0ff') },
    },
    vertexShader: /* glsl */ `
      attribute float aEnd;
      attribute float aBright;
      uniform float uTravel;
      uniform float uStretch;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        // Cabeça flui em direção à câmera; reciclagem por mod evita pool infinito.
        float zHead = mod(p.z + uTravel, ${SPAN.toFixed(1)}) - ${SPAN.toFixed(1)};
        // Cauda fica para trás no sentido do movimento e estica com a velocidade.
        p.z = zHead - aEnd * uStretch * (0.4 + 0.6 * aBright);
        float depth = clamp(-zHead / ${SPAN.toFixed(1)}, 0.0, 1.0);
        vAlpha = aBright * smoothstep(1.0, 0.55, depth) * smoothstep(0.0, 0.05, depth);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying float vAlpha;
      void main() {
        gl_FragColor = vec4(uColor, uOpacity * vAlpha);
      }
    `,
  });

  const mesh = new THREE.LineSegments(geo, mat);
  mesh.frustumCulled = false; // as posições reais vivem no shader
  mesh.renderOrder = -1;
  mesh.visible = false;

  // speed em [0, 1]: 0 = parado entre as estrelas (platô do texto), 1 = warp.
  function update(camera, pDive, speed, t) {
    const on = pDive > 0.015 && pDive < 0.985;
    mesh.visible = on;
    if (!on) return;
    mesh.position.copy(camera.position);
    mesh.quaternion.copy(camera.quaternion);
    mat.uniforms.uTravel.value = pDive * TRAVEL_DIST + t * 0.5;
    mat.uniforms.uStretch.value = speed * 7;
    const edge = Math.min(smoothstep(0.02, 0.1, pDive), 1 - smoothstep(0.88, 0.97, pDive));
    mat.uniforms.uOpacity.value = edge * (0.22 + 0.78 * Math.min(1, speed));
  }

  return { mesh, update };
}
