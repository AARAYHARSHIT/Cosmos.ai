import * as THREE from 'three';
import { playBeep } from './audio.js';

let scene = null;
let camera = null;
let renderer = null;

let lastTime = 0;
let resizeTimer = null;
let lastFov = 75;

// Mouse parallax state — uses a separate pivot so it doesn't fight GSAP scroll position
const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
let isWarpActive = false;
let warpProgress = 0;

// Separate group for mouse-driven subtle rotation so it never conflicts with scroll-driven camera.position
let cameraRig = null;

export function initScene() {
  if (scene) return scene;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x030014);
  scene.fog = new THREE.FogExp2(0x030014, 0.00035);

  // High-Dynamic Lighting
  const ambientLight = new THREE.AmbientLight(0x4c1d95, 0.45);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 1.3);
  mainLight.position.set(100, 80, 50);
  scene.add(mainLight);

  const rimLight = new THREE.DirectionalLight(0xa855f7, 1.2);
  rimLight.position.set(-100, -50, -100);
  scene.add(rimLight);

  const cyanFill = new THREE.DirectionalLight(0x38bdf8, 0.6);
  cyanFill.position.set(0, -60, 80);
  scene.add(cyanFill);

  // Camera Rig: outer group handles mouse parallax, inner camera handles GSAP scroll position
  cameraRig = new THREE.Group();
  scene.add(cameraRig);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    6000
  );
  camera.position.set(0, 0, 80);
  cameraRig.add(camera);

  // WebGL Renderer with ACESFilmic HDR Tone Mapping
  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const container = document.getElementById('canvas-container');
  if (container) {
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
  } else {
    document.body.appendChild(renderer.domElement);
  }

  // Mouse move listener for smooth camera rotation damping
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
    const deltaTime = Math.min(lastTime === 0 ? 0.016 : elapsedTime - lastTime, 0.1);
    lastTime = elapsedTime;

    // Smooth mouse damping (lerp factor scaled by deltaTime for frame-rate independence)
    const lerpFactor = 1.0 - Math.pow(0.92, deltaTime * 60);
    mouse.x += (mouse.targetX - mouse.x) * lerpFactor;
    mouse.y += (mouse.targetY - mouse.y) * lerpFactor;

    // Smooth warp FOV transition (frame-rate independent)
    const targetWarp = isWarpActive ? 1 : 0;
    const warpLerp = 1.0 - Math.pow(0.88, deltaTime * 60);
    warpProgress += (targetWarp - warpProgress) * warpLerp;

    // Apply mouse parallax to the camera rig (not to camera.position which GSAP controls)
    if (cameraRig) {
      cameraRig.rotation.y = -mouse.x * 0.025;
      cameraRig.rotation.x = mouse.y * 0.025;
    }

    // Only update projection matrix when FOV actually changes
    if (camera) {
      const newFov = 75 + warpProgress * 22;
      if (Math.abs(newFov - lastFov) > 0.01) {
        camera.fov = newFov;
        camera.updateProjectionMatrix();
        lastFov = newFov;
      }
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
