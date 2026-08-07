import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

export async function initExperience3D(containerId, modelUrl) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const w = container.clientWidth;
  const h = container.clientHeight;

  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
  camera.position.set(0, 0, 4.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  
  const hemi = new THREE.HemisphereLight('#aebbdd', '#080910', 0.5);
  scene.add(hemi);

  const rimCool = new THREE.PointLight('#dde6ff', 20, 16, 2);
  rimCool.position.set(-2, 2, -2);
  scene.add(rimCool);

  const rimWarm = new THREE.PointLight('#ffd9a5', 18, 16, 2);
  rimWarm.position.set(2, 2, -2);
  scene.add(rimWarm);

  const fill = new THREE.PointLight('#8593bb', 6, 18, 2);
  fill.position.set(2, 1, 4);
  scene.add(fill);

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  
  let bust = null;
  try {
    const gltf = await loader.loadAsync(modelUrl);
    bust = gltf.scene;
    
    const box = new THREE.Box3().setFromObject(bust);
    const sizeV = box.getSize(new THREE.Vector3());
    const s = 2.4 / sizeV.y; 
    bust.scale.setScalar(s);
    box.setFromObject(bust);
    const center = box.getCenter(new THREE.Vector3());
    bust.position.x -= center.x;
    bust.position.z -= center.z;
    bust.position.y -= box.min.y + 1.2; 
    
    bust.traverse((o) => {
      if (o.isMesh && o.material) {
        o.material.envMapIntensity = 0.5;
      }
    });

    scene.add(bust);
  } catch (err) {
    console.error('Erro ao carregar modelo da timeline', err);
  }

  let targetRotX = 0;
  let targetRotY = 0;
  
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width * 2 - 1;
    const ny = -(e.clientY - rect.top) / rect.height * 2 + 1;
    targetRotY = nx * 0.3;
    targetRotX = -ny * 0.15;
  });

  container.addEventListener('mouseleave', () => {
    targetRotX = 0;
    targetRotY = 0;
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    const t = clock.getElapsedTime();

    if (bust) {
      bust.rotation.y += (targetRotY + Math.sin(t * 0.2) * 0.1 - bust.rotation.y) * dt * 3.0;
      bust.rotation.x += (targetRotX - bust.rotation.x) * dt * 3.0;
    }

    renderer.render(scene, camera);
  }
  
  animate();

  window.addEventListener('resize', () => {
    const nw = container.clientWidth;
    const nh = container.clientHeight;
    renderer.setSize(nw, nh);
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
  });
}
