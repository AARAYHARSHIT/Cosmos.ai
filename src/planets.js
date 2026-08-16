import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();

// ============================================================================
// 1. ATMOSPHERE RAYLEIGH SCATTERING FRESNEL HALO SHADER
// ============================================================================
const ATMOSPHERE_VERTEX_SHADER = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
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
    float fresnel = dot(vNormal, viewDir);
    fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
    float glow = pow(fresnel, uPower) * uIntensity;
    gl_FragColor = vec4(uColor, glow);
  }
`;

// ============================================================================
// 2. MERIDIAN DYNAMIC FLOWING MAGMA CRUST SHADER
// ============================================================================
const MAGMA_VERTEX_SHADER = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const MAGMA_FRAGMENT_SHADER = `
  uniform float uTime;
  uniform sampler2D uTexture;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  void main() {
    vec2 uv = vUv;

    // Convective magma flow distortion
    float flow = uTime * 0.06;
    float n1 = noise(uv * 10.0 + vec2(flow, flow * 0.5));
    float n2 = noise(uv * 20.0 - vec2(flow * 0.6, flow));
    float magmaFlow = n1 * 0.65 + n2 * 0.35;

    vec4 texColor = texture2D(uTexture, uv + vec2(magmaFlow * 0.02, 0.0));

    // Magma fissure glow
    float fissure = smoothstep(0.40, 0.68, magmaFlow);
    vec3 hotLava = mix(vec3(1.0, 0.2, 0.0), vec3(1.0, 0.85, 0.2), fissure);

    // Dynamic thermal pulse
    float pulse = 0.9 + 0.1 * sin(uTime * 2.0 + uv.y * 8.0);
    vec3 emissiveColor = hotLava * fissure * 2.4 * pulse;

    // Basalt rock lighting
    vec3 lightDir = normalize(vec3(1.0, 0.8, 1.0));
    float diff = max(dot(vNormal, lightDir), 0.15);
    vec3 baseRock = mix(texColor.rgb, vec3(0.14, 0.07, 0.05), 0.35) * diff;

    gl_FragColor = vec4(baseRock + emissiveColor, 1.0);
  }
`;

// ============================================================================
// 3. AZUREA BIOLUMINESCENT OCEAN & NIGHT CITY SHADER
// ============================================================================
const AZUREA_VERTEX_SHADER = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const AZUREA_FRAGMENT_SHADER = `
  uniform sampler2D uDayTexture;
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec3 lightDir = normalize(vec3(1.0, 0.8, 0.9));
    float nDotL = dot(vNormal, lightDir);
    float dayFactor = smoothstep(-0.2, 0.3, nDotL);

    vec4 dayColor = texture2D(uDayTexture, vUv);

    // Specular ocean sun glint
    vec3 viewDir = normalize(-vPosition);
    vec3 halfVector = normalize(lightDir + viewDir);
    float spec = pow(max(dot(vNormal, halfVector), 0.0), 28.0) * 0.75 * dayFactor;

    // Night side bioluminescent city grid
    float nightFactor = 1.0 - dayFactor;
    float cityNoise = sin(vUv.x * 120.0) * cos(vUv.y * 120.0);
    float cityGlow = smoothstep(0.72, 0.95, cityNoise) * nightFactor;
    vec3 bioLight = vec3(0.0, 0.95, 0.85) * cityGlow * 1.6;

    vec3 finalDay = dayColor.rgb * max(nDotL, 0.08) + vec3(spec);
    gl_FragColor = vec4(finalDay + bioLight, 1.0);
  }
`;

// Helper: Generate procedural 3D asteroid rock belt
function create3DAsteroidBelt(count, innerRad, outerRad, colorHex) {
  const group = new THREE.Group();
  const asteroidGeo = new THREE.DodecahedronGeometry(0.45, 1);
  const asteroidMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness: 0.8,
    metalness: 0.3,
  });

  const instanced = new THREE.InstancedMesh(asteroidGeo, asteroidMat, count);
  const dummy = new THREE.Object3D();

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = innerRad + Math.random() * (outerRad - innerRad);
    const height = (Math.random() - 0.5) * 4.0;
    const scale = 0.5 + Math.random() * 1.4;

    dummy.position.set(Math.cos(angle) * dist, height, Math.sin(angle) * dist);
    dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    dummy.scale.setScalar(scale);
    dummy.updateMatrix();
    instanced.setMatrixAt(i, dummy.matrix);
  }

  instanced.instanceMatrix.needsUpdate = true;
  group.add(instanced);
  group.rotation.x = Math.PI / 2.3;
  return group;
}

// Helper: Generate polar auroral ring
function createAuroraRing(radius, colorHex) {
  const auroraGeo = new THREE.RingGeometry(radius * 0.25, radius * 0.42, 48);
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
        float alpha = wave * 0.55;
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

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createPlanets(scene) {
  const planets = [];

  // ==========================================================================
  // 1. MERIDIAN — Scorched Volcanic Lava World (Stationed at z = -380)
  // ==========================================================================
  const meridianGroup = new THREE.Group();
  meridianGroup.position.set(16, 0, -380);
  meridianGroup.scale.setScalar(0.001); // Hidden in Hero

  const meridianGeo = new THREE.SphereGeometry(18, 64, 64);
  const placeholderTex = new THREE.CanvasTexture(document.createElement('canvas'));

  const meridianMagmaMat = new THREE.ShaderMaterial({
    vertexShader: MAGMA_VERTEX_SHADER,
    fragmentShader: MAGMA_FRAGMENT_SHADER,
    uniforms: {
      uTime: { value: 0 },
      uTexture: { value: placeholderTex },
    },
  });

  textureLoader.load('/assets/textures/meridian_diffuse.jpg', (tex) => {
    tex.wrapS = THREE.RepeatWrapping;
    meridianMagmaMat.uniforms.uTexture.value = tex;
  });

  const meridianCore = new THREE.Mesh(meridianGeo, meridianMagmaMat);
  meridianGroup.add(meridianCore);

  // Meridian Atmosphere Halo
  const meridianAtmoMat = new THREE.ShaderMaterial({
    vertexShader: ATMOSPHERE_VERTEX_SHADER,
    fragmentShader: ATMOSPHERE_FRAGMENT_SHADER,
    uniforms: {
      uColor: { value: new THREE.Color(0xff4500) },
      uIntensity: { value: 1.5 },
      uPower: { value: 3.0 },
    },
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
  });
  const meridianAtmo = new THREE.Mesh(new THREE.SphereGeometry(20, 64, 64), meridianAtmoMat);
  meridianGroup.add(meridianAtmo);

  // 3D Physical Asteroid Rock Belt
  const meridianBelt = create3DAsteroidBelt(350, 24, 38, 0x884422);
  meridianGroup.add(meridianBelt);

  // Orbiting Molten Moon
  const moonGeo = new THREE.SphereGeometry(1.8, 32, 32);
  const moonMat = new THREE.MeshStandardMaterial({ color: 0xcc8855, roughness: 0.8 });
  const moonlet1 = new THREE.Mesh(moonGeo, moonMat);
  moonlet1.position.set(34, 6, 0);
  meridianGroup.add(moonlet1);

  meridianGroup.userData = {
    name: 'meridian',
    index: 0,
    core: meridianCore,
    magmaMat: meridianMagmaMat,
    belt: meridianBelt,
    moon: moonlet1,
    rotSpeedY: 0.005,
    rotSpeedX: 0.001,
  };
  scene.add(meridianGroup);

  // ==========================================================================
  // 2. AZUREA — Ocean Super-Earth with Clouds (Stationed at z = -620)
  // ==========================================================================
  const azureaGroup = new THREE.Group();
  azureaGroup.position.set(16, 0, -620);
  azureaGroup.scale.setScalar(0.001); // Hidden in Hero

  const azureaGeo = new THREE.SphereGeometry(20, 64, 64);
  const azureaShaderMat = new THREE.ShaderMaterial({
    vertexShader: AZUREA_VERTEX_SHADER,
    fragmentShader: AZUREA_FRAGMENT_SHADER,
    uniforms: {
      uDayTexture: { value: placeholderTex },
      uTime: { value: 0 },
    },
  });

  textureLoader.load('/assets/textures/azurea_diffuse.jpg', (tex) => {
    tex.wrapS = THREE.RepeatWrapping;
    azureaShaderMat.uniforms.uDayTexture.value = tex;
  });

  const azureaCore = new THREE.Mesh(azureaGeo, azureaShaderMat);
  azureaGroup.add(azureaCore);

  // High-Res Swirling Clouds Layer
  const cloudsGeo = new THREE.SphereGeometry(20.4, 64, 64);
  const cloudsMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
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

  // Azurea Atmospheric Rayleigh Scattering Halo
  const azureaAtmoMat = new THREE.ShaderMaterial({
    vertexShader: ATMOSPHERE_VERTEX_SHADER,
    fragmentShader: ATMOSPHERE_FRAGMENT_SHADER,
    uniforms: {
      uColor: { value: new THREE.Color(0x00f0ff) },
      uIntensity: { value: 1.8 },
      uPower: { value: 2.6 },
    },
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
  });
  const azureaAtmo = new THREE.Mesh(new THREE.SphereGeometry(22.5, 64, 64), azureaAtmoMat);
  azureaGroup.add(azureaAtmo);

  // Orbiting Ocean Moon
  const moonlet2 = new THREE.Mesh(
    new THREE.SphereGeometry(2.6, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0x90e0ef, metalness: 0.3, roughness: 0.3 })
  );
  moonlet2.position.set(-40, 10, 4);
  azureaGroup.add(moonlet2);

  azureaGroup.userData = {
    name: 'azurea',
    index: 1,
    core: azureaCore,
    shaderMat: azureaShaderMat,
    clouds: cloudsMesh,
    atmosphere: azureaAtmo,
    moon: moonlet2,
    rotSpeedY: 0.004,
    rotSpeedX: 0.001,
  };
  scene.add(azureaGroup);

  // ==========================================================================
  // 3. VESPERION — Violet Ringed Giant with Polar Auroras (Stationed at z = -860)
  // ==========================================================================
  const vesperionGroup = new THREE.Group();
  vesperionGroup.position.set(18, 0, -860);
  vesperionGroup.scale.setScalar(0.001); // Hidden in Hero

  const vesperionGeo = new THREE.SphereGeometry(24, 64, 64);
  const vesperionMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x7209b7),
    emissive: new THREE.Color(0x240046),
    emissiveIntensity: 0.45,
    roughness: 0.4,
    metalness: 0.2,
  });

  textureLoader.load('/assets/textures/vesperion_diffuse.jpg', (tex) => {
    tex.wrapS = THREE.RepeatWrapping;
    vesperionMat.map = tex;
    vesperionMat.needsUpdate = true;
  });

  const vesperionCore = new THREE.Mesh(vesperionGeo, vesperionMat);
  vesperionGroup.add(vesperionCore);

  // Polar Aurora Borealis (North and South)
  const northAurora = createAuroraRing(24, new THREE.Color(0x00ffff));
  northAurora.position.y = 23.8;
  northAurora.rotation.x = Math.PI / 2;
  vesperionGroup.add(northAurora);

  const southAurora = createAuroraRing(24, new THREE.Color(0xd8b4fe));
  southAurora.position.y = -23.8;
  southAurora.rotation.x = Math.PI / 2;
  vesperionGroup.add(southAurora);

  // Vesperion Atmosphere Halo
  const vesperionAtmoMat = new THREE.ShaderMaterial({
    vertexShader: ATMOSPHERE_VERTEX_SHADER,
    fragmentShader: ATMOSPHERE_FRAGMENT_SHADER,
    uniforms: {
      uColor: { value: new THREE.Color(0xd8b4fe) },
      uIntensity: { value: 1.6 },
      uPower: { value: 2.8 },
    },
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
  });
  const vesperionAtmo = new THREE.Mesh(new THREE.SphereGeometry(27, 64, 64), vesperionAtmoMat);
  vesperionGroup.add(vesperionAtmo);

  // Concentric Planetary Rings
  const ringTex1 = createConcentricRingTexture(new THREE.Color(0.85, 0.65, 1.0), 16);
  const ring1 = new THREE.Mesh(
    new THREE.RingGeometry(32, 50, 96),
    new THREE.MeshStandardMaterial({
      map: ringTex1,
      color: 0xd8b4fe,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      roughness: 0.4,
    })
  );
  ring1.rotation.x = Math.PI / 2.3;
  vesperionGroup.add(ring1);

  const ringTex2 = createConcentricRingTexture(new THREE.Color(0.6, 0.3, 0.9), 10);
  const ring2 = new THREE.Mesh(
    new THREE.RingGeometry(52, 66, 96),
    new THREE.MeshStandardMaterial({
      map: ringTex2,
      color: 0x9d4edd,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.55,
      roughness: 0.5,
    })
  );
  ring2.rotation.x = Math.PI / 2.3;
  vesperionGroup.add(ring2);

  // 2 Orbiting Moons
  const moonlet3 = new THREE.Mesh(
    new THREE.SphereGeometry(2.0, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0xddbbff, roughness: 0.5 })
  );
  moonlet3.position.set(50, -14, 12);
  vesperionGroup.add(moonlet3);

  const moonlet4 = new THREE.Mesh(
    new THREE.SphereGeometry(1.5, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0xa0e7e5, roughness: 0.4 })
  );
  moonlet4.position.set(-60, 10, -8);
  vesperionGroup.add(moonlet4);

  vesperionGroup.userData = {
    name: 'vesperion',
    index: 2,
    core: vesperionCore,
    northAurora,
    southAurora,
    ring1,
    ring2,
    moon1: moonlet3,
    moon2: moonlet4,
    rotSpeedY: 0.005,
    rotSpeedX: 0.001,
  };
  scene.add(vesperionGroup);

  planets.push(meridianGroup, azureaGroup, vesperionGroup);
  return planets;
}