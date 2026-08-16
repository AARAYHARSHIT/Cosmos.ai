import * as THREE from 'three';

// Atmosphere Fresnel Shader for luminous planetary halos
const ATMOSPHERE_VERTEX_SHADER = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ATMOSPHERE_FRAGMENT_SHADER = `
  uniform vec3 uColor;
  varying vec3 vNormal;
  void main() {
    float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.5);
    gl_FragColor = vec4(uColor, 1.0) * intensity * 1.5;
  }
`;

// Helper to generate planetary ring
function createRing(innerRadius, outerRadius, colorHex, opacity = 0.8) {
  const ringGeo = new THREE.RingGeometry(innerRadius, outerRadius, 64);
  const ringMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    side: THREE.DoubleSide,
    transparent: true,
    opacity,
    roughness: 0.5,
    metalness: 0.2,
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = Math.PI / 2.3;
  return ringMesh;
}

export function createPlanets(scene) {
  const planets = [];

  // 1. Meridian (Molten Scorched World)
  const meridianGroup = new THREE.Group();
  meridianGroup.position.set(0, 0, -350);

  const meridianGeo = new THREE.SphereGeometry(14, 64, 64);
  const meridianMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xff4500),
    emissive: new THREE.Color(0xaa2200),
    emissiveIntensity: 0.6,
    roughness: 0.65,
    metalness: 0.4,
  });
  const meridianCore = new THREE.Mesh(meridianGeo, meridianMat);
  meridianGroup.add(meridianCore);

  // Meridian Molten Asteroid Ring
  const meridianRing = createRing(18, 28, 0xff7733, 0.65);
  meridianGroup.add(meridianRing);

  // Meridian Orbiting Moonlet
  const moonlet1Geo = new THREE.SphereGeometry(1.2, 32, 32);
  const moonlet1Mat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.8 });
  const moonlet1 = new THREE.Mesh(moonlet1Geo, moonlet1Mat);
  moonlet1.position.set(24, 6, 0);
  meridianGroup.add(moonlet1);

  meridianGroup.userData = {
    name: 'meridian',
    index: 0,
    core: meridianCore,
    ring: meridianRing,
    moon: moonlet1,
    rotSpeedY: 0.008,
    rotSpeedX: 0.003,
  };
  scene.add(meridianGroup);
  planets.push(meridianGroup);

  // 2. Azurea (Ocean Super-Earth)
  const azureaGroup = new THREE.Group();
  azureaGroup.position.set(0, 0, -550);

  const azureaGeo = new THREE.SphereGeometry(16, 64, 64);
  const azureaMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x0077b6),
    emissive: new THREE.Color(0x003366),
    emissiveIntensity: 0.4,
    roughness: 0.25,
    metalness: 0.6,
  });
  const azureaCore = new THREE.Mesh(azureaGeo, azureaMat);
  azureaGroup.add(azureaCore);

  // Azurea Atmospheric Fresnel Halo
  const atmosphereGeo = new THREE.SphereGeometry(17.8, 64, 64);
  const atmosphereMat = new THREE.ShaderMaterial({
    vertexShader: ATMOSPHERE_VERTEX_SHADER,
    fragmentShader: ATMOSPHERE_FRAGMENT_SHADER,
    uniforms: {
      uColor: { value: new THREE.Color(0x00f0ff) },
    },
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
  });
  const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
  azureaGroup.add(atmosphereMesh);

  // Azurea Ocean Moon
  const moonlet2Geo = new THREE.SphereGeometry(2.2, 32, 32);
  const moonlet2Mat = new THREE.MeshStandardMaterial({ color: 0x90e0ef, metalness: 0.3, roughness: 0.4 });
  const moonlet2 = new THREE.Mesh(moonlet2Geo, moonlet2Mat);
  moonlet2.position.set(-30, 8, 4);
  azureaGroup.add(moonlet2);

  azureaGroup.userData = {
    name: 'azurea',
    index: 1,
    core: azureaCore,
    atmosphere: atmosphereMesh,
    moon: moonlet2,
    rotSpeedY: 0.005,
    rotSpeedX: 0.002,
  };
  scene.add(azureaGroup);
  planets.push(azureaGroup);

  // 3. Vesperion (Violet Ringed Gas Giant)
  const vesperionGroup = new THREE.Group();
  vesperionGroup.position.set(0, 0, -750);

  const vesperionGeo = new THREE.SphereGeometry(20, 64, 64);
  const vesperionMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x6a0dad),
    emissive: new THREE.Color(0x3a0066),
    emissiveIntensity: 0.5,
    roughness: 0.4,
    metalness: 0.3,
  });
  const vesperionCore = new THREE.Mesh(vesperionGeo, vesperionMat);
  vesperionGroup.add(vesperionCore);

  // Magnificent Dual Rings
  const vesperionRing1 = createRing(26, 42, 0xd8b4fe, 0.75);
  const vesperionRing2 = createRing(44, 52, 0x9d4edd, 0.45);
  vesperionGroup.add(vesperionRing1);
  vesperionGroup.add(vesperionRing2);

  // Orbiting crystalline moons
  const vesperionMoon1 = new THREE.Mesh(
    new THREE.SphereGeometry(1.6, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0xe0aaff, roughness: 0.5 })
  );
  vesperionMoon1.position.set(38, -12, 10);
  vesperionGroup.add(vesperionMoon1);

  vesperionGroup.userData = {
    name: 'vesperion',
    index: 2,
    core: vesperionCore,
    ring1: vesperionRing1,
    ring2: vesperionRing2,
    moon1: vesperionMoon1,
    rotSpeedY: 0.006,
    rotSpeedX: 0.001,
  };
  scene.add(vesperionGroup);
  planets.push(vesperionGroup);

  return planets;
}