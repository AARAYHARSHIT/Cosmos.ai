import * as THREE from 'three';

// ============================================================================
// 1. PINPOINT DIAMOND STAR SHADER (Crisp, Ultra-Sharp, Multi-Depth Twinkle)
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

    // Relativistic Warp displacement
    if (uWarp > 0.01) {
      pos.z += mod(uTime * 650.0 * uWarp + pos.z, 4000.0) - 2000.0;
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Crisp sinusoidal twinkle
    float twinkle = 0.7 + 0.3 * sin(uTime * aTwinkleSpeed + aTwinklePhase);
    vTwinkle = twinkle;

    // Razor-sharp point size (capped to avoid blurry bokeh blobs)
    float sizeFactor = (200.0 / -mvPosition.z);
    gl_PointSize = clamp(aSize * sizeFactor * twinkle * (1.0 + uWarp * 0.5), 1.0, 4.5);
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

    // Razor-sharp Gaussian core
    float core = exp(-dist * dist * 64.0);

    // Subtle 4-point cross flare
    float spikeH = exp(-abs(uv.y) * 42.0) * exp(-abs(uv.x) * 6.0);
    float spikeV = exp(-abs(uv.x) * 42.0) * exp(-abs(uv.y) * 6.0);
    float spikes = (spikeH + spikeV) * 0.35;

    float intensity = core + spikes;
    vec3 finalColor = vColor * (1.0 + vTwinkle * 0.4 + uWarp * 0.6);

    gl_FragColor = vec4(finalColor, clamp(intensity * (0.85 + vTwinkle * 0.15), 0.0, 1.0));
  }
`;

// ============================================================================
// 2. ELEGANT FLOATING STARDUST EMBERS (Subtle, Clean Depth Layer)
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
    pos.x += sin(uTime * 0.25 + pos.z * 0.02) * 3.0;
    pos.y += cos(uTime * 0.2 + pos.x * 0.02) * 3.0;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    gl_PointSize = clamp(aSize * (120.0 / -mv.z), 1.0, 3.5);
    vAlpha = smoothstep(1200.0, 50.0, -mv.z) * 0.45;
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
    gl_FragColor = vec4(vColor * 1.2, alpha);
  }
`;

export function createStarField(scene, { count = 6000 } = {}) {
  const rootGroup = new THREE.Group();

  // --------------------------------------------------------------------------
  // 1. High-Precision Pinpoint Starfield Points (Deep layered cosmos)
  // --------------------------------------------------------------------------
  const starPositions = new Float32Array(count * 3);
  const starColors = new Float32Array(count * 3);
  const starSizes = new Float32Array(count);
  const twinkleSpeeds = new Float32Array(count);
  const twinklePhases = new Float32Array(count);

  const spectralPalette = [
    new THREE.Color(0xffffff), // Diamond white
    new THREE.Color(0xd8b4fe), // Ethereal violet
    new THREE.Color(0x7dd3fc), // Electric sky cyan
    new THREE.Color(0xa5b4fc), // Indigo starlight
    new THREE.Color(0xfde68a), // Soft gold
  ];

  for (let i = 0; i < count; i++) {
    starPositions[i * 3 + 0] = (Math.random() - 0.5) * 1000;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
    starPositions[i * 3 + 2] = Math.random() * -3800 + 120;

    const chosenColor = spectralPalette[Math.floor(Math.random() * spectralPalette.length)];
    starColors[i * 3 + 0] = chosenColor.r;
    starColors[i * 3 + 1] = chosenColor.g;
    starColors[i * 3 + 2] = chosenColor.b;

    starSizes[i] = 0.8 + Math.random() * 1.5; // Pinpoint crisp
    twinkleSpeeds[i] = 1.0 + Math.random() * 2.8;
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
  // 2. Floating Stardust Embers (Microscopic, Smooth Depth Layer)
  // --------------------------------------------------------------------------
  const dustCount = 900;
  const dustPositions = new Float32Array(dustCount * 3);
  const dustColors = new Float32Array(dustCount * 3);
  const dustSizes = new Float32Array(dustCount);

  for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3 + 0] = (Math.random() - 0.5) * 350;
    dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 350;
    dustPositions[i * 3 + 2] = Math.random() * -3600 + 80;

    const c = Math.random() > 0.5 ? new THREE.Color(0xa855f7) : new THREE.Color(0x38bdf8);
    dustColors[i * 3 + 0] = c.r;
    dustColors[i * 3 + 1] = c.g;
    dustColors[i * 3 + 2] = c.b;
    dustSizes[i] = 1.0 + Math.random() * 1.4;
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
  // 3. Shooting Stars Dynamic Engine
  // --------------------------------------------------------------------------
  const shootingStars = [];
  for (let s = 0; s < 3; s++) {
    const shootGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(6);
    shootGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const shootMat = new THREE.LineBasicMaterial({
      color: 0xc084fc,
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
      timer: Math.random() * 3 + s * 3.0,
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
    // 1. Update Shader Uniforms
    starShaderMat.uniforms.uTime.value = time;
    starShaderMat.uniforms.uWarp.value = warpProgress;
    dustMat.uniforms.uTime.value = time;

    // 2. Update Shooting Stars
    shootingStars.forEach((star) => {
      if (!star.active) {
        star.timer -= delta;
        if (star.timer <= 0) {
          star.active = true;
          star.life = 0;
          star.maxLife = 0.8 + Math.random() * 0.7;

          const startX = (Math.random() - 0.5) * 200;
          const startY = 60 + Math.random() * 40;
          const startZ = -150 - Math.random() * 600;

          star.head.set(startX, startY, startZ);
          star.tail.copy(star.head);

          star.velocity.set(
            (Math.random() - 0.5) * 100 - 60,
            -150 - Math.random() * 80,
            (Math.random() - 0.5) * 60
          );
        }
      } else {
        star.life += delta;
        const progress = star.life / star.maxLife;

        if (progress >= 1) {
          star.active = false;
          star.mat.opacity = 0;
          star.timer = 2.0 + Math.random() * 5;
        } else {
          star.head.addScaledVector(star.velocity, delta);
          star.tail.copy(star.head).subScaledVector(star.velocity, 0.05);

          const posArr = star.geo.attributes.position.array;
          posArr[0] = star.head.x;
          posArr[1] = star.head.y;
          posArr[2] = star.head.z;
          posArr[3] = star.tail.x;
          posArr[4] = star.tail.y;
          posArr[5] = star.tail.z;
          star.geo.attributes.position.needsUpdate = true;

          star.mat.opacity = Math.sin(progress * Math.PI) * 0.9;
        }
      }
    });
  };

  scene.add(rootGroup);
  return rootGroup;
}