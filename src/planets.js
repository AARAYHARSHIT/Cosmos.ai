import * as THREE from 'three';

export function createPlanets(scene) {
  const config = [
    { radius: 8, z: -300, h: 30, s: 0.8, l: 0.6 },
    { radius: 6, z: -500, h: 210, s: 0.7, l: 0.55 },
    { radius: 7, z: -700, h: 280, s: 0.6, l: 0.5 },
  ];

  const planets = config.map((c) => {
    const geometry = new THREE.SphereGeometry(c.radius, 64, 64);
    const color = new THREE.Color().setHSL(c.h / 360, c.s, c.l);
    const material = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.3,
      roughness: 0.7,
      emissive: 0x333333,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, c.z);
    scene.add(mesh);
    return mesh;
  });

  return planets;
}