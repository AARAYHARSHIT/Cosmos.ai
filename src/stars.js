import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();

// ============================================================================
// 1. PINPOINT OPTICAL STAR SHADER (Ultra-Sharp, Diamond Clarity)
// ============================================================================
const STAR_VERTEX_SHADER = `
  uniform float uTime;
  uniform float uWarp;
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aTwinkleSpeed;
  attribute float aTwinklePhase;
  varying vec3 vColor;
  varying float vTwinkle;

  void main() {
    vColor = aColor;
    vec3 pos = position;

    // Relativistic Warp displacement along Z
    if (uWarp > 0.01) {
      pos.z += mod(uTime * 600.0 * uWarp + pos.z, 4500.0) - 2250.0;
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Smooth sinusoidal twinkle
    float twinkle = 0.6 + 0.4 * sin(uTime * aTwinkleSpeed + aTwinklePhase);
    vTwinkle = twinkle;

    float sizeFactor = (260.0 / -mvPosition.z);
    gl_PointSize = clamp(aSize * sizeFactor * twinkle * (1.0 + uWarp * 0.7), 1.0, 16.0);
  }
`;

const STAR_FRAGMENT_SHADER = `
  uniform float uWarp;
  varying vec3 vColor;
  varying float vTwinkle;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float dist = length(uv);
    if (dist > 0.5) discard;

    // Crisp optical point with diamond core
    float core = exp(-dist * dist * 48.0);
    float halo = exp(-dist * 8.0) * 0.25;

    // Delicate 4-point diffraction spike
    float spikeH = exp(-abs(uv.y) * 32.0) * exp(-abs(uv.x) * 4.0);
    float spikeV = exp(-abs(uv.x) * 32.0) * exp(-abs(uv.y) * 4.0);
    float spikes = (spikeH + spikeV) * 0.35;

    float intensity = core + halo + spikes;
    vec3 finalColor = vColor * (1.0 + vTwinkle * 0.4 + uWarp * 0.8);

    gl_FragColor = vec4(finalColor, clamp(intensity * vTwinkle, 0.0, 1.0));
  }
`;

// ============================================================================
// 2. CLOSE PROXIMITY LUMINESCENT STARDUST EMBERS
// ============================================================================
const DUST_VERTEX_SHADER = `
  uniform float uTime;
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;
    vec3 pos = position;

    // Gentle 3D floating drift
    pos.x += sin(uTime * 0.3 + pos.z * 0.02) * 4.0;
    pos.y += cos(uTime * 0.25 + pos.x * 0.02) * 4.0;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    gl_PointSize = clamp(aSize * (150.0 / -mv.z), 1.0, 8.0);
    vAlpha = smoothstep(1200.0, 40.0, -mv.z) * 0.55;
  }
`;

const DUST_FRAGMENT_SHADER = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.0, d) * vAlpha;
    gl_FragColor = vec4(vColor * 1.4, alpha);
  }
`;

export function createStarField(scene, { count = 5500 } = {}) {
  const rootGroup = new THREE.Group();

  // --------------------------------------------------------------------------
  // 1. High-Res User-Provided Cosmic Deep Space Celestial Sphere
  // --------------------------------------------------------------------------
  const skyboxGeo = new THREE.SphereGeometry(4500, 64, 64);
  const skyboxMat = new THREE.MeshBasicMaterial({
    side: THREE.BackSide,
    color: 0xffffff,
    transparent: true,
    opacity: 0.95,
  });

  textureLoader.load('/assets/textures/cosmos_bg.jpg', (tex) => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    skyboxMat.map = tex;
    skyboxMat.needsUpdate = true;
  });

  const skyboxMesh = new THREE.Mesh(skyboxGeo, skyboxMat);
  rootGroup.add(skyboxMesh);

  // --------------------------------------------------------------------------
  // 2. High-Precision Starfield Points across the full 4000-unit corridor
  // --------------------------------------------------------------------------
  const starPositions = new Float32Array(count * 3);
  const starColors = new Float32Array(count * 3);
  const starSizes = new Float32Array(count);
  const twinkleSpeeds = new Float32Array(count);
  const twinklePhases = new Float32Array(count);

  const spectralPalette = [
    new THREE.Color(0xffffff), // Pure white (Class A)
    new THREE.Color(0x90e0ef), // Electric cyan-blue (Class O/B)
    new THREE.Color(0x00f0ff), // Cyan Ionized
    new THREE.Color(0xffd166), // Solar Golden (Class G)
    new THREE.Color(0xffaa5e), // Warm Amber (Class K)
    new THREE.Color(0xe0aaff), // Violet M-Dwarf
  ];

  for (let i = 0; i < count; i++) {
    starPositions[i * 3 + 0] = (Math.random() - 0.5) * 900;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 900;
    starPositions[i * 3 + 2] = Math.random() * -4400 + 150;

    const chosenColor = spectralPalette[Math.floor(Math.random() * spectralPalette.length)];
    starColors[i * 3 + 0] = chosenColor.r;
    starColors[i * 3 + 1] = chosenColor.g;
    starColors[i * 3 + 2] = chosenColor.b;

    starSizes[i] = 1.0 + Math.random() * 2.8;
    twinkleSpeeds[i] = 1.2 + Math.random() * 3.5;
    twinklePhases[i] = Math.random() * Math.PI * 2;
  }

  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeo.setAttribute('aColor', new THREE.BufferAttribute(starColors, 3));
  starGeo.setAttribute('aSize', new THREE.BufferAttribute(starSizes, 1));
  starGeo.setAttribute('aTwinkleSpeed', new THREE.BufferAttribute(twinkleSpeeds, 1));
  starGeo.setAttribute('aTwinklePhase', new THREE.BufferAttribute(twinklePhases, 1));

  const starShaderMat = new THREE.ShaderMaterial({
    vertexShader: STAR_VERTEX_SHADER,
    fragmentShader: STAR_FRAGMENT_SHADER,
    uniforms: {
      uTime: { value: 0 },
      uWarp: { value: 0 },
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const starPoints = new THREE.Points(starGeo, starShaderMat);
  starPoints.frustumCulled = false;
  rootGroup.add(starPoints);

  // --------------------------------------------------------------------------
  // 3. Volumetric Stardust Embers (Floating Particle Motes)
  // --------------------------------------------------------------------------
  const dustCount = 1500;
  const dustPositions = new Float32Array(dustCount * 3);
  const dustColors = new Float32Array(dustCount * 3);
  const dustSizes = new Float32Array(dustCount);

  for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3 + 0] = (Math.random() - 0.5) * 350;
    dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 350;
    dustPositions[i * 3 + 2] = Math.random() * -4200 + 100;

    const c = Math.random() > 0.5 ? new THREE.Color(0x00ffdc) : new THREE.Color(0x9d4edd);
    dustColors[i * 3 + 0] = c.r;
    dustColors[i * 3 + 1] = c.g;
    dustColors[i * 3 + 2] = c.b;
    dustSizes[i] = 1.5 + Math.random() * 3.0;
  }

  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  dustGeo.setAttribute('aColor', new THREE.BufferAttribute(dustColors, 3));
  dustGeo.setAttribute('aSize', new THREE.BufferAttribute(dustSizes, 1));

  const dustMat = new THREE.ShaderMaterial({
    vertexShader: DUST_VERTEX_SHADER,
    fragmentShader: DUST_FRAGMENT_SHADER,
    uniforms: { uTime: { value: 0 } },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const dustPoints = new THREE.Points(dustGeo, dustMat);
  dustPoints.frustumCulled = false;
  rootGroup.add(dustPoints);

  // --------------------------------------------------------------------------
  // 4. Shooting Stars / Comets Dynamic Engine
  // --------------------------------------------------------------------------
  const shootingStars = [];
  for (let s = 0; s < 4; s++) {
    const shootGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(6);
    shootGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const shootMat = new THREE.LineBasicMaterial({
      color: 0x90e0ef,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });

    const shootLine = new THREE.Line(shootGeo, shootMat);
    shootLine.frustumCulled = false;
    rootGroup.add(shootLine);

    shootingStars.push({
      mesh: shootLine,
      geo: shootGeo,
      mat: shootMat,
      active: false,
      timer: Math.random() * 3 + s * 2.5,
      head: new THREE.Vector3(),
      tail: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      life: 0,
      maxLife: 1.0,
    });
  }

  // --------------------------------------------------------------------------
  // Render Loop Update
  // --------------------------------------------------------------------------
  rootGroup.userData.update = (delta, time, { warpProgress = 0 } = {}) => {
    // 1. Skybox slow cosmic drift
    skyboxMesh.rotation.y += 0.00012 + warpProgress * 0.002;
    skyboxMesh.rotation.x = Math.sin(time * 0.02) * 0.03;

    // 2. Update Shader Uniforms
    starShaderMat.uniforms.uTime.value = time;
    starShaderMat.uniforms.uWarp.value = warpProgress;
    dustMat.uniforms.uTime.value = time;

    // 3. Update Shooting Stars
    shootingStars.forEach((star) => {
      if (!star.active) {
        star.timer -= delta;
        if (star.timer <= 0) {
          star.active = true;
          star.life = 0;
          star.maxLife = 0.8 + Math.random() * 0.8;

          const startX = (Math.random() - 0.5) * 250;
          const startY = 80 + Math.random() * 60;
          const startZ = -200 - Math.random() * 900;

          star.head.set(startX, startY, startZ);
          star.tail.copy(star.head);

          star.velocity.set(
            (Math.random() - 0.5) * 120 - 80,
            -180 - Math.random() * 100,
            (Math.random() - 0.5) * 80
          );
        }
      } else {
        star.life += delta;
        const progress = star.life / star.maxLife;

        if (progress >= 1) {
          star.active = false;
          star.mat.opacity = 0;
          star.timer = 1.5 + Math.random() * 5;
        } else {
          star.head.addScaledVector(star.velocity, delta);
          star.tail.copy(star.head).subScaledVector(star.velocity, 0.06);

          const posArr = star.geo.attributes.position.array;
          posArr[0] = star.head.x;
          posArr[1] = star.head.y;
          posArr[2] = star.head.z;
          posArr[3] = star.tail.x;
          posArr[4] = star.tail.y;
          posArr[5] = star.tail.z;
          star.geo.attributes.position.needsUpdate = true;

          star.mat.opacity = Math.sin(progress * Math.PI) * 0.95;
        }
      }
    });
  };

  scene.add(rootGroup);
  return rootGroup;
}