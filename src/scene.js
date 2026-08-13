import * as THREE from 'three';

let scene = null;
let camera = null;
let renderer = null;

let lastTime = 0;
let resizeTimer = null;

export function initScene() {
  if (scene) return scene;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x030609);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    5000
  );

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    logarithmicDepthBuffer: true,
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const container = document.getElementById('canvas-container');
  if (container) {
    container.appendChild(renderer.domElement);
  } else {
    document.body.appendChild(renderer.domElement);
  }

  window.addEventListener('resize', onWindowResize);

  return scene;
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

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }

    if (typeof callback === 'function') {
      callback(deltaTime, elapsedTime);
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
