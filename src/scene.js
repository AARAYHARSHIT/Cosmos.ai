import * as THREE from 'three';
import { playBeep } from './audio.js';

let scene = null;
let camera = null;
let renderer = null;

let lastTime = 0;
let resizeTimer = null;

// Mouse parallax state
const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
let isWarpActive = false;
let warpProgress = 0;

export function initScene() {
  if (scene) return scene;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x02040a);
  scene.fog = new THREE.FogExp2(0x02040a, 0.0008);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x334466, 0.6);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0x00ffdc, 1.2);
  mainLight.position.set(100, 100, 50);
  scene.add(mainLight);

  const rimLight = new THREE.DirectionalLight(0x9d4edd, 1.0);
  rimLight.position.set(-100, -50, -100);
  scene.add(rimLight);

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    5000
  );
  camera.position.set(0, 0, 80);

  // Renderer
  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
    logarithmicDepthBuffer: true,
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const container = document.getElementById('canvas-container');
  if (container) {
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
  } else {
    document.body.appendChild(renderer.domElement);
  }

  // Mouse move listener for subtle camera rotation damping
  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('resize', onWindowResize);

  return scene;
}

function onMouseMove(e) {
  mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
}

export function setWarpMode(active) {
  isWarpActive = !!active;
  if (isWarpActive) {
    playBeep('warp');
  }
}

export function getWarpState() {
  return isWarpActive;
}

export function getScene() {
  return scene;
}

export function getCamera() {
  return camera;
}

export function getRenderer() {
  return renderer;
}

export function animate(callback) {
  const frame = (time) => {
    requestAnimationFrame(frame);

    const elapsedTime = time * 0.001;
    const deltaTime = Math.min(lastTime === 0 ? 0 : elapsedTime - lastTime, 0.1);
    lastTime = elapsedTime;

    // Smooth mouse damping
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    // Smooth warp FOV transition
    const targetWarp = isWarpActive ? 1 : 0;
    warpProgress += (targetWarp - warpProgress) * 0.08;

    if (camera) {
      camera.fov = 75 + warpProgress * 22;
      camera.updateProjectionMatrix();

      // Subtle parallax tilt
      camera.rotation.y = -mouse.x * 0.04;
      camera.rotation.x = mouse.y * 0.04;
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }

    if (typeof callback === 'function') {
      callback(deltaTime, elapsedTime, { mouse, isWarpActive, warpProgress });
    }
  };

  requestAnimationFrame(frame);
}

export function onWindowResize() {
  if (resizeTimer) return;

  resizeTimer = setTimeout(() => {
    resizeTimer = null;

    if (camera) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    }

    if (renderer) {
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
  }, 100);
}

export { scene, camera, renderer };
