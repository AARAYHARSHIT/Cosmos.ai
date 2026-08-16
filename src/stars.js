import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();

// Helper: Generate crisp optical star flare point texture with 4-point cross diffraction spikes
function createStarPointTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const cx = 64;
  const cy = 64;

  ctx.clearRect(0, 0, 128, 128);

  // Soft spherical core glow
  const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
  coreGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  coreGrad.addColorStop(0.15, 'rgba(200, 240, 255, 0.9)');
  coreGrad.addColorStop(0.5, 'rgba(100, 200, 255, 0.3)');
  coreGrad.addColorStop(1, 'rgba(0, 150, 255, 0)');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 40, 0, Math.PI * 2);
  ctx.fill();

  // Horizontal diffraction spike
  const hGrad = ctx.createLinearGradient(0, cy, 128, cy);
  hGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  hGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
  hGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = hGrad;
  ctx.fillRect(0, cy - 1, 128, 2);

  // Vertical diffraction spike
  const vGrad = ctx.createLinearGradient(cx, 0, cx, 128);
  vGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  vGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
  vGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = vGrad;
  ctx.fillRect(cx - 1, 0, 2, 128);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createStarField(scene, { count = 3500 } = {}) {
  // 1. High-Res 4K Deep Space Milky Way Panoramic Celestial Sphere
  const skyboxGeo = new THREE.SphereGeometry(2200, 64, 64);
  const skyboxMat = new THREE.MeshBasicMaterial({
    side: THREE.BackSide,
    color: 0x223344,
    transparent: true,
    opacity: 0.85,
  });

  textureLoader.load('/assets/textures/milkyway_bg.jpg', (tex) => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    skyboxMat.map = tex;
    skyboxMat.color.setHex(0xffffff);
    skyboxMat.needsUpdate = true;
  });

  const skyboxMesh = new THREE.Mesh(skyboxGeo, skyboxMat);
  scene.add(skyboxMesh);

  // 2. High-Precision Optical Instanced Stars
  const starPointTex = createStarPointTexture();
  const geometry = new THREE.PlaneGeometry(0.5, 0.5);
  const material = new THREE.MeshBasicMaterial({
    map: starPointTex,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const stars = new THREE.InstancedMesh(geometry, material, count);

  const starData = [];
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  // Multi-spectral star color classifications
  const starColors = [
    new THREE.Color(0xffffff), // Pure white (Class A)
    new THREE.Color(0xaae8ff), // Electric blue-white (Class O/B)
    new THREE.Color(0x00ffdc), // Cyan (Ionized)
    new THREE.Color(0xffd166), // Golden yellow (Class G Solar)
    new THREE.Color(0xff9f1c), // Amber orange (Class K)
    new THREE.Color(0xd8b4fe), // Violet dwarf
  ];

  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 400;
    const y = (Math.random() - 0.5) * 400;
    const z = Math.random() * -1400 + 100;
    const scale = 0.8 + Math.random() * 2.2;
    const speed = 0.8 + Math.random() * 2.0;
    const twinklePhase = Math.random() * Math.PI * 2;
    const twinkleSpeed = 1.2 + Math.random() * 2.8;

    const baseColor = starColors[Math.floor(Math.random() * starColors.length)].clone();

    starData.push({
      baseX: x,
      baseY: y,
      baseZ: z,
      x,
      y,
      z,
      scale,
      speed,
      twinklePhase,
      twinkleSpeed,
      baseColor,
    });

    dummy.position.set(x, y, z);
    dummy.scale.setScalar(scale);
    dummy.updateMatrix();
    stars.setMatrixAt(i, dummy.matrix);
    stars.setColorAt(i, baseColor);
  }

  stars.instanceMatrix.needsUpdate = true;
  stars.instanceColor.needsUpdate = true;
  stars.frustumCulled = false;

  stars.userData.update = (delta, time, { warpProgress = 0 } = {}) => {
    // Slowly rotate background skybox
    skyboxMesh.rotation.y += 0.0001 + warpProgress * 0.001;
    skyboxMesh.rotation.x = Math.sin(time * 0.02) * 0.05;

    let matrixChanged = false;

    for (let i = 0; i < count; i++) {
      const s = starData[i];

      // Twinkle pulsation
      const brightness = 0.5 + Math.sin(time * s.twinkleSpeed + s.twinklePhase) * 0.45;
      color.copy(s.baseColor).multiplyScalar(brightness + warpProgress * 1.2);
      stars.setColorAt(i, color);

      // Warp speed movement
      if (warpProgress > 0.01) {
        s.z += (s.speed * 80 + warpProgress * 320) * delta;
        if (s.z > 150) {
          s.z = -1400;
        }

        dummy.position.set(s.x, s.y, s.z);
        // Stretch along Z/Y for motion streak
        const zScale = s.scale * (1 + warpProgress * 22);
        dummy.scale.set(s.scale, s.scale, zScale);
        dummy.lookAt(s.x, s.y, s.z + 10);
        dummy.updateMatrix();
        stars.setMatrixAt(i, dummy.matrix);
        matrixChanged = true;
      }
    }

    stars.instanceColor.needsUpdate = true;
    if (matrixChanged) {
      stars.instanceMatrix.needsUpdate = true;
    }
  };

  scene.add(stars);
  return stars;
}