import * as THREE from 'three';

// PRNG determinístico: layout idêntico em todo carregamento.
export const mulberry32 = (seed) => {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// Esfera de fundo: gradiente vertical + brilho direcional suave.
export function makeBackdrop() {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      uTop: { value: new THREE.Color('#23242c') },
      uBottom: { value: new THREE.Color('#050507') },
      uGlow: { value: new THREE.Color('#2a2c38') },
      uGlowStrength: { value: 0.5 },
      uGlowSharpness: { value: 4.5 },
      uGlowDir: { value: new THREE.Vector3(0, 0.9, 0.25) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uTop;
      uniform vec3 uBottom;
      uniform vec3 uGlow;
      uniform float uGlowStrength;
      uniform float uGlowSharpness;
      uniform vec3 uGlowDir;
      varying vec3 vDir;
      void main() {
        float t = clamp(vDir.y * 0.5 + 0.5, 0.0, 1.0);
        vec3 base = mix(uBottom, uTop, smoothstep(0.0, 1.0, t));
        float g = pow(max(dot(normalize(vDir), normalize(uGlowDir)), 0.0), uGlowSharpness);
        gl_FragColor = vec4(base + uGlow * (g * uGlowStrength), 1.0);
      }
    `,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), mat);
  mesh.scale.setScalar(60);
  mesh.renderOrder = -2;
  return mesh;
}

// Poeira flutuante (Points), semeada e reutilizável por região.
export function makeDust({ seed, count, center, radius, height, size = 0.12, drift = 0.05, opacity = 0.8 }) {
  const rng = mulberry32(seed);
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const brights = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = center[0] + (rng() - 0.5) * radius * 2;
    positions[i * 3 + 1] = center[1] + (rng() - 0.5) * height;
    positions[i * 3 + 2] = center[2] + (rng() - 0.5) * radius * 2;
    phases[i] = rng() * Math.PI * 2;
    brights[i] = 0.4 + Math.pow(rng(), 1.5) * 0.6;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
  geo.setAttribute('bright', new THREE.BufferAttribute(brights, 1));

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: size },
      uDrift: { value: drift },
      uColor: { value: new THREE.Color('#eaf1ff') },
      uOpacity: { value: opacity },
    },
    vertexShader: /* glsl */ `
      attribute float phase;
      attribute float bright;
      uniform float uTime;
      uniform float uSize;
      uniform float uDrift;
      varying float vBright;
      void main() {
        vBright = bright;
        vec3 p = position;
        p.y += sin(uTime * uDrift + phase) * 0.35;
        p.x += cos(uTime * uDrift * 0.7 + phase * 1.3) * 0.25;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = clamp(uSize * (220.0 / -mv.z), 2.0, 7.0);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying float vBright;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float alpha = smoothstep(0.5, 0.0, d) * uOpacity * vBright;
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
  });
  return new THREE.Points(geo, mat);
}

// Feixe de luz volumétrico: plano aditivo com fade longitudinal e gaussiano.
export function makeShaft({ width = 1.4, length = 11, color = '#fff8eb', opacity = 0.28 }) {
  const mat = new THREE.ShaderMaterial({
    transparent: false,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    fog: false,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying vec2 vUv;
      void main() {
        float lengthFade = pow(clamp(vUv.y, 0.0, 1.0), 1.3) * smoothstep(0.0, 0.12, vUv.y);
        float across = exp(-pow((vUv.x - 0.5) * 4.5, 2.0));
        gl_FragColor = vec4(uColor, uOpacity * lengthFade * across);
      }
    `,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, length), mat);
  mesh.position.y = -length / 2;
  mesh.renderOrder = -1;
  const group = new THREE.Group();
  group.add(mesh);
  return { group, material: mat };
}
