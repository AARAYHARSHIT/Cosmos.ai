import * as THREE from 'three';

export function createFloatingGeometry(scene) {
  const config = [
    {
      name: 'icosahedron',
      geometry: new THREE.IcosahedronGeometry(4),
      position: new THREE.Vector3(-30, 20, -400),
      h: 190, s: 0.9, l: 0.6,
      baseRotation: new THREE.Euler(0.2, 0.4, 0.1),
    },
    {
      name: 'torusKnot',
      geometry: new THREE.TorusKnotGeometry(3, 0.8, 100, 16),
      position: new THREE.Vector3(30, -15, -600),
      h: 270, s: 0.9, l: 0.65,
      baseRotation: new THREE.Euler(0.6, 0.2, 0.5),
    },
    {
      name: 'octahedron',
      geometry: new THREE.OctahedronGeometry(5),
      position: new THREE.Vector3(0, 25, -800),
      h: 350, s: 0.9, l: 0.65,
      baseRotation: new THREE.Euler(0.3, 0.8, 0.4),
    },
  ];

  const meshes = config.map(({ geometry, position, baseRotation, h, s, l }) => {
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(h / 360, s, l),
      emissive: new THREE.Color().setHSL(h / 360, s, l * 0.45),
      shininess: 120,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.rotation.copy(baseRotation);
    scene.add(mesh);
    return mesh;
  });

  return meshes;
}