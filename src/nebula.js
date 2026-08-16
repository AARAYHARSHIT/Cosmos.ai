import * as THREE from 'three';

const VERTEX_SHADER = `
  uniform float uTime;
  uniform float uWarp;
  attribute float aSize;
  attribute float aSeed;
  varying float vAlpha;
  varying float vDist;
  varying float vSeed;

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
    vSeed = aSeed;
    vec3 pos = position;

    // Organic volumetric turbulence
    float t = uTime * (0.04 + uWarp * 0.15);
    float n1 = noise(pos.xz * 0.015 + aSeed + t);
    float n2 = noise(pos.xy * 0.02 - aSeed + t * 0.7);
    pos.x += (n1 - 0.5) * 45.0;
    pos.y += (n2 - 0.5) * 35.0;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    float sizeFactor = 380.0 / -mv.z;
    gl_PointSize = clamp(aSize * sizeFactor * (1.0 + uWarp * 0.4), 1.0, 180.0);
    
    // Soft depth fade
    vAlpha = smoothstep(1200.0, 150.0, -mv.z) * 0.65;
    vDist = length(pos.xy) / 280.0;
  }
`;

const FRAGMENT_SHADER = `
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  varying float vAlpha;
  varying float vDist;
  varying float vSeed;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    // Smooth Gaussian particle cloud falloff
    float shape = exp(-d * d * 18.0) * smoothstep(0.5, 0.0, d);

    // Multi-color ionized gradient
    vec3 color = mix(uColor1, uColor2, clamp(d * 1.6 + vDist * 0.7, 0.0, 1.0));
    if (vSeed > 60.0) {
      color = mix(color, uColor3, 0.4);
    }

    float finalAlpha = shape * vAlpha;
    gl_FragColor = vec4(color * 1.3, finalAlpha);
  }
`;

const COLOR_PRESETS = {
  violet: {
    c1: new THREE.Color(0x00ffdc), // Radiant Cyan
    c2: new THREE.Color(0x9d4edd), // Deep Violet
    c3: new THREE.Color(0xff007f), // Hot Magenta
  },
  emerald: {
    c1: new THREE.Color(0x00f5d4), // Emerald Mint
    c2: new THREE.Color(0x0077b6), // Ocean Blue
    c3: new THREE.Color(0x70e000), // Lime Glow
  },
  gold: {
    c1: new THREE.Color(0xffb703), // Amber Gold
    c2: new THREE.Color(0xfb8500), // Solar Orange
    c3: new THREE.Color(0xd00000), // Crimson Red
  },
  cyan: {
    c1: new THREE.Color(0x00ffff), // Pure Cyan
    c2: new THREE.Color(0x4361ee), // Electric Blue
    c3: new THREE.Color(0x3a0ca3), // Deep Indigo
  },
};

export function createNebula(scene, { count = 1800 } = {}) {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const seeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // Spread wide across the field of view in section 2
    positions[i * 3 + 0] = (Math.random() - 0.5) * 600;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 400;
    positions[i * 3 + 2] = Math.random() * -600 - 250;
    sizes[i] = 18 + Math.random() * 45;
    seeds[i] = Math.random() * 100;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    uniforms: {
      uTime: { value: 0 },
      uWarp: { value: 0 },
      uColor1: { value: COLOR_PRESETS.violet.c1 },
      uColor2: { value: COLOR_PRESETS.violet.c2 },
      uColor3: { value: COLOR_PRESETS.violet.c3 },
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const nebula = new THREE.Points(geometry, material);
  nebula.frustumCulled = false;

  nebula.userData.update = (delta, time, { warpProgress = 0 } = {}) => {
    material.uniforms.uTime.value = time;
    material.uniforms.uWarp.value = warpProgress;
  };

  nebula.userData.setPreset = (presetName) => {
    const p = COLOR_PRESETS[presetName] || COLOR_PRESETS.violet;
    material.uniforms.uColor1.value.copy(p.c1);
    material.uniforms.uColor2.value.copy(p.c2);
    material.uniforms.uColor3.value.copy(p.c3);
  };

  scene.add(nebula);
  return nebula;
}