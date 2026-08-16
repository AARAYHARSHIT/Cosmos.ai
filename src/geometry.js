import * as THREE from 'three';

export function createFloatingGeometry(scene) {
  const config = [
    {
      name: 'icosahedron',
      geometry: new THREE.IcosahedronGeometry(7, 0),
      wireGeometry: new THREE.IcosahedronGeometry(7.3, 0),
      position: new THREE.Vector3(-45, 25, -450),
      color: 0x00ffdc,
      emissive: 0x005544,
      rotSpeed: { x: 0.005, y: 0.008, z: 0.003 },
    },
    {
      name: 'torusKnot',
      geometry: new THREE.TorusKnotGeometry(5, 1.4, 120, 24),
      wireGeometry: new THREE.TorusKnotGeometry(5.2, 1.45, 60, 12),
      position: new THREE.Vector3(45, -20, -650),
      color: 0xc77dff,
      emissive: 0x4a0e4e,
      rotSpeed: { x: 0.007, y: 0.005, z: 0.006 },
    },
    {
      name: 'octahedron',
      geometry: new THREE.OctahedronGeometry(8, 0),
      wireGeometry: new THREE.OctahedronGeometry(8.4, 0),
      position: new THREE.Vector3(0, 35, -850),
      color: 0xff007f,
      emissive: 0x660033,
      rotSpeed: { x: 0.004, y: 0.009, z: 0.002 },
    },
  ];

  const meshes = config.map((cfg) => {
    const group = new THREE.Group();
    group.position.copy(cfg.position);

    // Faceted solid core
    const material = new THREE.MeshPhysicalMaterial({
      color: cfg.color,
      emissive: cfg.emissive,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.8,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    const solidMesh = new THREE.Mesh(cfg.geometry, material);
    group.add(solidMesh);

    // Glowing holographic wireframe overlay
    const wireMat = new THREE.MeshBasicMaterial({
      color: cfg.color,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const wireMesh = new THREE.Mesh(cfg.wireGeometry, wireMat);
    group.add(wireMesh);

    group.userData = {
      name: cfg.name,
      basePos: cfg.position.clone(),
      rotSpeed: cfg.rotSpeed,
      solidMesh,
      wireMesh,
    };

    scene.add(group);
    return group;
  });

  return meshes;
}