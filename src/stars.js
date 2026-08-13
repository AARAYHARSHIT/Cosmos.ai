import * as THREE from 'three';

export function createStarField(scene, { count = 3000 } = {}) {
  const geometry = new THREE.SphereGeometry(0.05, 8, 8);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const stars = new THREE.InstancedMesh(geometry, material, count);

  const opacities = new Float32Array(count);
  stars.userData.opacities = opacities;

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  for (let i = 0; i < count; i++) {
    dummy.position.set(
      Math.random() * 200 - 100,
      Math.random() * 200 - 100,
      Math.random() * -900 - 100
    );
    dummy.updateMatrix();
    stars.setMatrixAt(i, dummy.matrix);

    opacities[i] = 0.3 + Math.random() * 0.7;
    color.setScalar(opacities[i]);
    stars.setColorAt(i, color);
  }

  stars.instanceMatrix.needsUpdate = true;
  stars.instanceColor.needsUpdate = true;
  stars.frustumCulled = false;

  scene.add(stars);
  return stars;
}