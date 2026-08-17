import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();

// ============================================================================
// 1. REFINED ATMOSPHERIC FRESNEL RIM SHADER (Zero artifacts, camera-safe)
// ============================================================================
const ATMOSPHERE_VERTEX_SHADER = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vPosition = mvPos.xyz;
    gl_Position = projectionMatrix * mvPos;
  }
`;

const ATMOSPHERE_FRAGMENT_SHADER = `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uPower;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec3 viewDir = normalize(-vPosition);
    float fresnel = 1.0 - max(0.0, dot(vNormal, viewDir));
    float glow = pow(fresnel, uPower) * uIntensity;
    
    // Smooth fade at extreme edges
    float alpha = smoothstep(0.0, 0.9, glow);
    gl_FragColor = vec4(uColor, alpha * 0.85);
  }
`;

// Helper: Generate polar auroral ring
function createAuroraRing(radius, colorHex) {
  const auroraGeo = new THREE.RingGeometry(radius * 0.25, radius * 0.38, 48);
  const auroraMat = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor;
      varying vec2 vUv;
      void main() {
        float wave = 0.5 + 0.5 * sin(uTime * 2.5 + vUv.x * 16.0);
        float alpha = wave * 0.45;
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: colorHex },
    },
    side: THREE.DoubleSide,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  return new THREE.Mesh(auroraGeo, auroraMat);
}

// Helper: Generate crisp ring texture with concentric Cassini divisions
function createConcentricRingTexture(colorHex, divisionCount = 14) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let x = 0; x < canvas.width; x++) {
    const normalized = x / canvas.width;
    const sinWave = Math.sin(normalized * Math.PI * divisionCount);
    const noiseVal = Math.sin(normalized * 120) * 0.15;
    const alpha = Math.max(0, (0.35 + sinWave * 0.5 + noiseVal) * Math.sin(normalized * Math.PI));

    ctx.fillStyle = `rgba(${colorHex.r * 255}, ${colorHex.g * 255}, ${colorHex.b * 255}, ${alpha})`;
    ctx.fillRect(x, 0, 1, canvas.height);
  }

  return new THREE.CanvasTexture(canvas);
}

export function createPlanets(scene) {
  const planets = [];

  // ==========================================================================
  // 1. AZUREA — Ocean Super-Earth (Flagship Earth Model)
  // Initially scaled to 0 so it's 100% invisible on start, arrives via parallax!
  // ==========================================================================
  const azureaGroup = new THREE.Group();
  azureaGroup.position.set(16, 0, -300);
  azureaGroup.scale.set(0.0001, 0.0001, 0.0001); // Invisible at start

  const azureaGeo = new THREE.SphereGeometry(18, 64, 64);
  const azureaMat = new THREE.MeshStandardMaterial({
    roughness: 0.35,
    metalness: 0.15,
  });

  textureLoader.load('/assets/textures/azurea_diffuse.jpg', (tex) => {
    tex.wrapS = THREE.RepeatWrapping;
    azureaMat.map = tex;
    azureaMat.needsUpdate = true;
  });

  const azureaCore = new THREE.Mesh(azureaGeo, azureaMat);
  azureaGroup.add(azureaCore);

  // High-Res Swirling Clouds Layer
  const cloudsGeo = new THREE.SphereGeometry(18.35, 64, 64);
  const cloudsMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.75,
    roughness: 0.9,
    blending: THREE.NormalBlending,
  });

  textureLoader.load('/assets/textures/azurea_clouds.jpg', (tex) => {
    tex.wrapS = THREE.RepeatWrapping;
    cloudsMat.map = tex;
    cloudsMat.needsUpdate = true;
  });

  const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
  azureaGroup.add(cloudsMesh);

  // Azurea Atmospheric Rayleigh Scattering Halo (Camera-safe FrontSide)
  const azureaAtmoMat = new THREE.ShaderMaterial({
    vertexShader: ATMOSPHERE_VERTEX_SHADER,
    fragmentShader: ATMOSPHERE_FRAGMENT_SHADER,
    uniforms: {
      uColor: { value: new THREE.Color(0x38bdf8) },
      uIntensity: { value: 0.95 },
      uPower: { value: 3.2 },
    },
    blending: THREE.AdditiveBlending,
    side: THREE.FrontSide,
    transparent: true,
    depthWrite: false,
  });
  const azureaAtmo = new THREE.Mesh(new THREE.SphereGeometry(19.5, 64, 64), azureaAtmoMat);
  azureaGroup.add(azureaAtmo);

  // Orbiting Moon
  const moonlet1 = new THREE.Mesh(
    new THREE.SphereGeometry(2.2, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0xc4b5fd, metalness: 0.2, roughness: 0.6 })
  );
  moonlet1.position.set(-32, 6, 4);
  azureaGroup.add(moonlet1);

  azureaGroup.userData = {
    name: 'azurea',
    index: 0,
    core: azureaCore,
    clouds: cloudsMesh,
    atmosphere: azureaAtmo,
    moon: moonlet1,
    baseScale: 1,
    basePos: new THREE.Vector3(16, 0, -300),
    rotSpeedY: 0.004,
    rotSpeedX: 0.001,
  };
  scene.add(azureaGroup);

  // ==========================================================================
  // 2. VESPERION — Violet Ringed Giant with Polar Auroras
  // Initially scaled to 0 so it's 100% invisible on start, arrives via parallax!
  // ==========================================================================
  const vesperionGroup = new THREE.Group();
  vesperionGroup.position.set(-18, 0, -480);
  vesperionGroup.scale.set(0.0001, 0.0001, 0.0001); // Invisible at start

  const vesperionGeo = new THREE.SphereGeometry(22, 64, 64);
  const vesperionMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x6b21a8),
    roughness: 0.45,
    metalness: 0.15,
  });

  textureLoader.load('/assets/textures/vesperion_diffuse.jpg', (tex) => {
    tex.wrapS = THREE.RepeatWrapping;
    vesperionMat.map = tex;
    vesperionMat.needsUpdate = true;
  });

  const vesperionCore = new THREE.Mesh(vesperionGeo, vesperionMat);
  vesperionGroup.add(vesperionCore);

  // Polar Aurora Borealis (North and South)
  const northAurora = createAuroraRing(22, new THREE.Color(0x38bdf8));
  northAurora.position.y = 21.8;
  northAurora.rotation.x = Math.PI / 2;
  vesperionGroup.add(northAurora);

  const southAurora = createAuroraRing(22, new THREE.Color(0xc084fc));
  southAurora.position.y = -21.8;
  southAurora.rotation.x = Math.PI / 2;
  vesperionGroup.add(southAurora);

  // Vesperion Atmosphere Halo
  const vesperionAtmoMat = new THREE.ShaderMaterial({
    vertexShader: ATMOSPHERE_VERTEX_SHADER,
    fragmentShader: ATMOSPHERE_FRAGMENT_SHADER,
    uniforms: {
      uColor: { value: new THREE.Color(0xc084fc) },
      uIntensity: { value: 0.85 },
      uPower: { value: 3.4 },
    },
    blending: THREE.AdditiveBlending,
    side: THREE.FrontSide,
    transparent: true,
    depthWrite: false,
  });
  const vesperionAtmo = new THREE.Mesh(new THREE.SphereGeometry(23.8, 64, 64), vesperionAtmoMat);
  vesperionGroup.add(vesperionAtmo);

  // Concentric Planetary Rings
  const ringTex1 = createConcentricRingTexture(new THREE.Color(0.8, 0.6, 0.95), 16);
  const ring1 = new THREE.Mesh(
    new THREE.RingGeometry(27, 42, 96),
    new THREE.MeshStandardMaterial({
      map: ringTex1,
      color: 0xc084fc,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      roughness: 0.4,
    })
  );
  ring1.rotation.x = Math.PI / 2.3;
  vesperionGroup.add(ring1);

  const ringTex2 = createConcentricRingTexture(new THREE.Color(0.5, 0.25, 0.8), 10);
  const ring2 = new THREE.Mesh(
    new THREE.RingGeometry(44, 55, 96),
    new THREE.MeshStandardMaterial({
      map: ringTex2,
      color: 0x9333ea,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
      roughness: 0.5,
    })
  );
  ring2.rotation.x = Math.PI / 2.3;
  vesperionGroup.add(ring2);

  // 2 Orbiting Moons
  const moonlet2 = new THREE.Mesh(
    new THREE.SphereGeometry(1.6, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0xddbbff, roughness: 0.5 })
  );
  moonlet2.position.set(42, -10, 8);
  vesperionGroup.add(moonlet2);

  const moonlet3 = new THREE.Mesh(
    new THREE.SphereGeometry(1.3, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0xa0e7e5, roughness: 0.4 })
  );
  moonlet3.position.set(-48, 8, -5);
  vesperionGroup.add(moonlet3);

  vesperionGroup.userData = {
    name: 'vesperion',
    index: 1,
    core: vesperionCore,
    northAurora,
    southAurora,
    ring1,
    ring2,
    moon1: moonlet2,
    moon2: moonlet3,
    baseScale: 1,
    basePos: new THREE.Vector3(-18, 0, -480),
    rotSpeedY: 0.005,
    rotSpeedX: 0.001,
  };
  scene.add(vesperionGroup);

  planets.push(azureaGroup, vesperionGroup);
  return planets;
}