import * as THREE from 'three';

const VERTEX_SHADER = `
  uniform float uTime;
  uniform float uWarp;
  attribute float aSize;
  attribute float aSeed;
  varying float vAlpha;
  varying float vDist;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  void main() {
    vec3 pos = position;

    // Volumetric swirl noise
    float t = uTime * (0.05 + uWarp * 0.2);
    float n1 = noise(pos.xz * 0.04 + aSeed + t);
    float n2 = noise(pos.xy * 0.05 - aSeed + t * 0.8);
    pos.x += (n1 - 0.5) * 12.0;
    pos.y += (n2 - 0.5) * 12.0;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    float sizeFactor = 280.0 / -mv.z;
    gl_PointSize = aSize * sizeFactor * (1.0 + uWarp * 0.5);
    vAlpha = smoothstep(600.0, 50.0, -mv.z) * 0.85;
    vDist = length(pos.xy) / 90.0;
  }
`;

const FRAGMENT_SHADER = `
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  varying float vAlpha;
  varying float vDist;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv) * 2.0;
    if (d > 1.0) discard;

    vec3 color = mix(uColor1, uColor2, clamp(d * 0.8 + vDist * 0.5, 0.0, 1.0));

    float alpha = smoothstep(1.0, 0.0, d) * vAlpha;
    gl_FragColor = vec4(color * (1.0 + (1.0 - d) * 0.8), alpha);
  }
`;

const COLOR_PRESETS = {
  violet: { c1: new THREE.Color(0x00ffdc), c2: new THREE.Color(0x9d4edd) },
  emerald: { c1: new THREE.Color(0x00f5d4), c2: new THREE.Color(0x0077b6) },
  gold: { c1: new THREE.Color(0xffb703), c2: new THREE.Color(0xd00000) },
  cyan: { c1: new THREE.Color(0x00ffff), c2: new THREE.Color(0x4361ee) },
};

export function createNebula(scene, { count = 1200 } = {}) {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const seeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 140;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 140;
    positions[i * 3 + 2] = Math.random() * -450 - 150;
    sizes[i] = 12 + Math.random() * 28;
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
    },
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const nebula = new THREE.Points(geometry, material);
  nebula.frustumCulled = false;

  nebula.userData.update = (delta, time, { warpProgress = 0 } = {}) => {
    material.uniforms.uTime.value += delta;
    material.uniforms.uWarp.value = warpProgress;
  };

  nebula.userData.setPreset = (presetName) => {
    const p = COLOR_PRESETS[presetName] || COLOR_PRESETS.violet;
    material.uniforms.uColor1.value.copy(p.c1);
    material.uniforms.uColor2.value.copy(p.c2);
  };

  scene.add(nebula);
  return nebula;
}