import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();

// Atmosphere Fresnel Halo Shader
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

// Helper: Generate procedural 2048x1024 molten lava / volcanic crust texture
function createProceduralMagmaTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Base scorched dark rock
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#1c0800');
  grad.addColorStop(0.5, '#2e0f03');
  grad.addColorStop(1, '#1c0800');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw intricate glowing magma fissures
  ctx.lineCap = 'round';
  for (let i = 0; i < 400; i++) {
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    ctx.beginPath();
    ctx.moveTo(x, y);

    const length = 40 + Math.random() * 120;
    const branches = 3 + Math.floor(Math.random() * 5);

    ctx.strokeStyle = i % 2 === 0 ? 'rgba(255, 90, 0, 0.75)' : 'rgba(255, 180, 20, 0.85)';
    ctx.lineWidth = 1.5 + Math.random() * 3.5;

    for (let b = 0; b < branches; b++) {
      x += (Math.random() - 0.5) * length;
      y += (Math.random() - 0.5) * length * 0.7;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Add glowing volcanic hotspots
  for (let i = 0; i < 80; i++) {
    const hx = Math.random() * canvas.width;
    const hy = Math.random() * canvas.height;
    const rad = 10 + Math.random() * 30;
    const radGrad = ctx.createRadialGradient(hx, hy, 0, hx, hy, rad);
    radGrad.addColorStop(0, 'rgba(255, 230, 100, 0.9)');
    radGrad.addColorStop(0.3, 'rgba(255, 80, 0, 0.6)');
    radGrad.addColorStop(1, 'rgba(40, 10, 0, 0)');
    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(hx, hy, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Helper: Generate procedural cloud layer with transparency
function createProceduralCloudTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Swirling cloud clusters
  for (let i = 0; i < 350; i++) {
    const cx = Math.random() * canvas.width;
    const cy = 100 + Math.random() * (canvas.height - 200);
    const rad = 25 + Math.random() * 70;

    const cloudGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
    cloudGrad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
    cloudGrad.addColorStop(0.6, 'rgba(220, 240, 255, 0.3)');
    cloudGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = cloudGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Helper: Generate crisp ring texture with concentric Cassini divisions
function createConcentricRingTexture(colorHex, divisionCount = 12) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let x = 0; x < canvas.width; x++) {
    const normalized = x / canvas.width;
    const sinWave = Math.sin(normalized * Math.PI * divisionCount);
    const noiseVal = Math.sin(normalized * 80) * 0.15;
    const alpha = Math.max(0, (0.35 + sinWave * 0.45 + noiseVal) * Math.sin(normalized * Math.PI));

    ctx.fillStyle = `rgba(${colorHex.r * 255}, ${colorHex.g * 255}, ${colorHex.b * 255}, ${alpha})`;
    ctx.fillRect(x, 0, 1, canvas.height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Helper: Generate high-res cratered lunar texture
function createLunarTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#6c757d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 400; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = 2 + Math.random() * 14;

    const craterGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
    craterGrad.addColorStop(0, '#212529');
    craterGrad.addColorStop(0.7, '#495057');
    craterGrad.addColorStop(0.9, '#ced4da');
    craterGrad.addColorStop(1, '#6c757d');

    ctx.fillStyle = craterGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function createPlanets(scene) {
  const planets = [];

  // ==========================================
  // 1. MERIDIAN — Scorched Volcanic Lava World
  // ==========================================
  const meridianGroup = new THREE.Group();
  meridianGroup.position.set(0, 0, -350);

  const meridianGeo = new THREE.SphereGeometry(15, 64, 64);
  const proceduralMagma = createProceduralMagmaTexture();

  const meridianMat = new THREE.MeshStandardMaterial({
    map: proceduralMagma,
    bumpMap: proceduralMagma,
    bumpScale: 0.8,
    emissive: new THREE.Color(0xff3300),
    emissiveMap: proceduralMagma,
    emissiveIntensity: 0.65,
    roughness: 0.6,
    metalness: 0.35,
  });

  // Try loading high-res NASA Venus elevation map over it if available
  textureLoader.load('/assets/textures/meridian_diffuse.jpg', (tex) => {
    tex.wrapS = THREE.RepeatWrapping;
    meridianMat.map = tex;
    meridianMat.needsUpdate = true;
  });

  const meridianCore = new THREE.Mesh(meridianGeo, meridianMat);
  meridianGroup.add(meridianCore);

  // Meridian Atmosphere Halo
  const meridianAtmoMat = new THREE.ShaderMaterial({
    vertexShader: ATMOSPHERE_VERTEX_SHADER,
    fragmentShader: ATMOSPHERE_FRAGMENT_SHADER,
    uniforms: {
      uColor: { value: new THREE.Color(0xff5500) },
      uIntensity: { value: 1.2 },
      uPower: { value: 3.5 },
    },
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
  });
  const meridianAtmo = new THREE.Mesh(new THREE.SphereGeometry(16.5, 64, 64), meridianAtmoMat);
  meridianGroup.add(meridianAtmo);

  // Molten Asteroid Ring with concentric division texture
  const meridianRingTex = createConcentricRingTexture(new THREE.Color(1.0, 0.45, 0.1), 8);
  const meridianRingGeo = new THREE.RingGeometry(19, 32, 80);
  const meridianRingMat = new THREE.MeshStandardMaterial({
    map: meridianRingTex,
    color: 0xff7722,
    emissive: 0xaa3300,
    emissiveIntensity: 0.3,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
    roughness: 0.5,
  });
  const meridianRing = new THREE.Mesh(meridianRingGeo, meridianRingMat);
  meridianRing.rotation.x = Math.PI / 2.2;
  meridianRing.rotation.y = 0.15;
  meridianGroup.add(meridianRing);

  // Orbiting Molten Moon
  const moonTex = createLunarTexture();
  const moon1Mat = new THREE.MeshStandardMaterial({
    map: moonTex,
    color: 0xddaa88,
    roughness: 0.8,
  });
  const moonlet1 = new THREE.Mesh(new THREE.SphereGeometry(1.5, 32, 32), moon1Mat);
  moonlet1.position.set(28, 6, 0);
  meridianGroup.add(moonlet1);

  meridianGroup.userData = {
    name: 'meridian',
    index: 0,
    core: meridianCore,
    ring: meridianRing,
    moon: moonlet1,
    rotSpeedY: 0.006,
    rotSpeedX: 0.001,
  };
  scene.add(meridianGroup);
  planets.push(meridianGroup);

  // ==========================================
  // 2. AZUREA — Ocean Super-Earth with Cloud Layer
  // ==========================================
  const azureaGroup = new THREE.Group();
  azureaGroup.position.set(0, 0, -550);

  const azureaGeo = new THREE.SphereGeometry(17, 64, 64);
  const azureaMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x0a66c2),
    roughness: 0.2,
    metalness: 0.1,
  });

  // Load high-res NASA Blue Marble texture map
  textureLoader.load('/assets/textures/azurea_diffuse.jpg', (tex) => {
    tex.wrapS = THREE.RepeatWrapping;
    azureaMat.map = tex;
    azureaMat.needsUpdate = true;
  });

  const azureaCore = new THREE.Mesh(azureaGeo, azureaMat);
  azureaGroup.add(azureaCore);

  // Rotating High-Res Atmospheric Cloud Layer Mesh
  const cloudTex = createProceduralCloudTexture();
  const cloudsGeo = new THREE.SphereGeometry(17.3, 64, 64);
  const cloudsMat = new THREE.MeshStandardMaterial({
    map: cloudTex,
    transparent: true,
    opacity: 0.75,
    blending: THREE.NormalBlending,
    roughness: 0.9,
  });
  const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
  azureaGroup.add(cloudsMesh);

  // Azurea Atmospheric Fresnel Halo
  const azureaAtmoMat = new THREE.ShaderMaterial({
    vertexShader: ATMOSPHERE_VERTEX_SHADER,
    fragmentShader: ATMOSPHERE_FRAGMENT_SHADER,
    uniforms: {
      uColor: { value: new THREE.Color(0x00f0ff) },
      uIntensity: { value: 1.6 },
      uPower: { value: 2.8 },
    },
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
  });
  const azureaAtmo = new THREE.Mesh(new THREE.SphereGeometry(19, 64, 64), azureaAtmoMat);
  azureaGroup.add(azureaAtmo);

  // Orbiting Crystalline Ocean Moon
  const moon2Mat = new THREE.MeshStandardMaterial({
    map: moonTex,
    color: 0xa0e7e5,
    metalness: 0.2,
    roughness: 0.3,
  });
  const moonlet2 = new THREE.Mesh(new THREE.SphereGeometry(2.4, 32, 32), moon2Mat);
  moonlet2.position.set(-34, 9, 4);
  azureaGroup.add(moonlet2);

  azureaGroup.userData = {
    name: 'azurea',
    index: 1,
    core: azureaCore,
    clouds: cloudsMesh,
    atmosphere: azureaAtmo,
    moon: moonlet2,
    rotSpeedY: 0.004,
    rotSpeedX: 0.001,
  };
  scene.add(azureaGroup);
  planets.push(azureaGroup);

  // ==========================================
  // 3. VESPERION — Violet Ringed Gas Giant
  // ==========================================
  const vesperionGroup = new THREE.Group();
  vesperionGroup.position.set(0, 0, -750);

  const vesperionGeo = new THREE.SphereGeometry(22, 64, 64);
  const vesperionMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x7209b7),
    emissive: new THREE.Color(0x240046),
    emissiveIntensity: 0.4,
    roughness: 0.45,
    metalness: 0.2,
  });

  // Load NASA Cassini Jupiter cylindrical storm map
  textureLoader.load('/assets/textures/vesperion_diffuse.jpg', (tex) => {
    tex.wrapS = THREE.RepeatWrapping;
    vesperionMat.map = tex;
    vesperionMat.needsUpdate = true;
  });

  const vesperionCore = new THREE.Mesh(vesperionGeo, vesperionMat);
  vesperionGroup.add(vesperionCore);

  // Vesperion Atmospheric Purple Aurora Glow
  const vesperionAtmoMat = new THREE.ShaderMaterial({
    vertexShader: ATMOSPHERE_VERTEX_SHADER,
    fragmentShader: ATMOSPHERE_FRAGMENT_SHADER,
    uniforms: {
      uColor: { value: new THREE.Color(0xd8b4fe) },
      uIntensity: { value: 1.4 },
      uPower: { value: 3.0 },
    },
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
  });
  const vesperionAtmo = new THREE.Mesh(new THREE.SphereGeometry(24.5, 64, 64), vesperionAtmoMat);
  vesperionGroup.add(vesperionAtmo);

  // Concentric Planetary Rings with Cassini Divisions
  const vesperionRingTex1 = createConcentricRingTexture(new THREE.Color(0.85, 0.65, 1.0), 16);
  const vesperionRing1 = new THREE.Mesh(
    new THREE.RingGeometry(28, 46, 96),
    new THREE.MeshStandardMaterial({
      map: vesperionRingTex1,
      color: 0xd8b4fe,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      roughness: 0.4,
    })
  );
  vesperionRing1.rotation.x = Math.PI / 2.3;
  vesperionRing1.rotation.y = -0.1;
  vesperionGroup.add(vesperionRing1);

  const vesperionRingTex2 = createConcentricRingTexture(new THREE.Color(0.6, 0.3, 0.9), 10);
  const vesperionRing2 = new THREE.Mesh(
    new THREE.RingGeometry(48, 58, 96),
    new THREE.MeshStandardMaterial({
      map: vesperionRingTex2,
      color: 0x9d4edd,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
      roughness: 0.5,
    })
  );
  vesperionRing2.rotation.x = Math.PI / 2.3;
  vesperionRing2.rotation.y = -0.1;
  vesperionGroup.add(vesperionRing2);

  // Orbiting Moons
  const moonlet3 = new THREE.Mesh(new THREE.SphereGeometry(1.8, 32, 32), moon1Mat);
  moonlet3.position.set(44, -14, 12);
  vesperionGroup.add(moonlet3);

  const moonlet4 = new THREE.Mesh(new THREE.SphereGeometry(1.2, 32, 32), moon2Mat);
  moonlet4.position.set(-52, 10, -8);
  vesperionGroup.add(moonlet4);

  vesperionGroup.userData = {
    name: 'vesperion',
    index: 2,
    core: vesperionCore,
    ring1: vesperionRing1,
    ring2: vesperionRing2,
    moon1: moonlet3,
    moon2: moonlet4,
    rotSpeedY: 0.005,
    rotSpeedX: 0.001,
  };
  scene.add(vesperionGroup);
  planets.push(vesperionGroup);

  return planets;
}