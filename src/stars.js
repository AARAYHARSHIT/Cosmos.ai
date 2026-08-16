import * as THREE from 'three';

export function createStarField(scene, { count = 3500 } = {}) {
  const geometry = new THREE.SphereGeometry(0.08, 6, 6);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
  });

  const stars = new THREE.InstancedMesh(geometry, material, count);

  const starData = [];
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  // Color palette for cosmic stars
  const starColors = [
    new THREE.Color(0xffffff), // Pure white
    new THREE.Color(0xaae8ff), // Blue-white O/B type
    new THREE.Color(0x00ffdc), // Cyan
    new THREE.Color(0xffd166), // Golden yellow G type
    new THREE.Color(0xd8b4fe), // Violet M dwarf
  ];

  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 350;
    const y = (Math.random() - 0.5) * 350;
    const z = Math.random() * -1200 + 100;
    const scale = 0.4 + Math.random() * 1.6;
    const speed = 0.5 + Math.random() * 1.5;
    const twinklePhase = Math.random() * Math.PI * 2;
    const twinkleSpeed = 1.5 + Math.random() * 3.0;

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

  stars.userData.update = (delta, time, { isWarpActive, warpProgress = 0 } = {}) => {
    let matrixChanged = false;

    for (let i = 0; i < count; i++) {
      const s = starData[i];

      // Twinkle pulsation
      const brightness = 0.4 + Math.sin(time * s.twinkleSpeed + s.twinklePhase) * 0.4;
      color.copy(s.baseColor).multiplyScalar(brightness + warpProgress * 0.8);
      stars.setColorAt(i, color);

      // Warp speed movement
      if (warpProgress > 0.01) {
        s.z += (s.speed * 60 + warpProgress * 250) * delta;
        if (s.z > 150) {
          s.z = -1200;
        }

        dummy.position.set(s.x, s.y, s.z);
        // Stretch along Z for streak effect
        const zScale = s.scale * (1 + warpProgress * 18);
        dummy.scale.set(s.scale, s.scale, zScale);
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