import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Vinheta + film grain animado em um único pass, depois do bloom.
const PostFXShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uGrain: { value: 0.055 },
    uVignette: { value: 0.42 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uGrain;
    uniform float uVignette;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233)) + uTime) * 43758.5453);
    }

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      float n = hash(vUv * vec2(1920.0, 1080.0)) - 0.5;
      color.rgb += n * uGrain;
      float d = length(vUv - 0.5);
      color.rgb *= 1.0 - smoothstep(0.42, 0.98, d) * uVignette;
      gl_FragColor = color;
    }
  `,
};

export function createRenderer(canvas, tier) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    stencil: false,
    powerPreference: tier.name === 'desktop' ? 'high-performance' : 'default',
  });
  renderer.setPixelRatio(tier.pixelRatio);
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.98;
  if (tier.shadows) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.08, 90);
  camera.position.set(0, 1.5, 4.4);

  // Environment sutil: dá vida a metais e superfícies escuras sem HDR externo.
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.3;
  pmrem.dispose();

  renderer.info.autoReset = false;

  const size = new THREE.Vector2();
  renderer.getDrawingBufferSize(size);
  const target = new THREE.WebGLRenderTarget(size.x, size.y, {
    samples: tier.msaa,
    type: THREE.HalfFloatType,
  });

  const composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));

  const bloom = new UnrealBloomPass(
    new THREE.Vector2(size.x, size.y),
    tier.name === 'mobile' ? 0.4 : 0.62,
    0.55,
    0.82
  );
  composer.addPass(bloom);

  const postfx = new ShaderPass(PostFXShader);
  composer.addPass(postfx);
  composer.addPass(new OutputPass());

  function resize() {
    const w = innerWidth;
    const h = innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
  }

  return { renderer, scene, camera, composer, bloom, postfx, resize };
}
