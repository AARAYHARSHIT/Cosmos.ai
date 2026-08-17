import * as THREE from 'three';

export function createFloatingGeometry(scene) {
  const config = [
    {
      name: 'icosahedron',
      geometry: new THREE.IcosahedronGeometry(7, 0),
      wireGeometry: new THREE.IcosahedronGeometry(7.25, 0),
      position: new THREE.Vector3(-28, 10, -680),
      color: 0x38bdf8,
      emissive: 0x004455,
      rotSpeed: { x: 0.005, y: 0.008, z: 0.003 },
    },
    {
      name: 'torusKnot',
      geometry: new THREE.TorusKnotGeometry(5, 1.4, 120, 24),
      wireGeometry: new THREE.TorusKnotGeometry(5.15, 1.45, 60, 12),
      position: new THREE.Vector3(28, -8, -700),
      color: 0xc084fc,
      emissive: 0x3b0764,
      rotSpeed: { x: 0.007, y: 0.005, z: 0.006 },
    },
    {
      name: 'octahedron',
      geometry: new THREE.OctahedronGeometry(8, 0),
      wireGeometry: new THREE.OctahedronGeometry(8.3, 0),
      position: new THREE.Vector3(0, 18, -720),
      color: 0x10b981,
      emissive: 0x064e3b,
      rotSpeed: { x: 0.004, y: 0.009, z: 0.002 },
    },
  ];

  const meshes = config.map((cfg) => {
    const group = new THREE.Group();
    group.position.copy(cfg.position);
    group.scale.set(0.0001, 0.0001, 0.0001); // Initially hidden, revealed via parallax

    // Faceted solid core
    const material = new THREE.MeshPhysicalMaterial({
      color: cfg.color,
      emissive: cfg.emissive,
      emissiveIntensity: 0.45,
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
      opacity: 0.45,
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