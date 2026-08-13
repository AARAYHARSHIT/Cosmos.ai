import * as THREE from 'three';

const VERTEX_SHADER = `
  uniform float uTime;
  attribute float aSize;
  attribute float aSeed;
  varying float vAlpha;

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

    float d = noise(pos.xz * 0.08 + aSeed + uTime * 0.05)
            + noise(pos.xy * 0.06 - aSeed + uTime * 0.04);
    pos.xy += (d - 0.5) * 3.0;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    gl_PointSize = aSize * (200.0 / -mv.z);
    vAlpha = 0.6;
  }
`;

const FRAGMENT_SHADER = `
  uniform vec3 uColorCyan;
  uniform vec3 uColorViolet;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv) * 2.0;

    vec3 color = mix(uColorCyan, uColorViolet, d);

    float alpha = smoothstep(1.0, 0.0, d) * vAlpha;
    gl_FragColor = vec4(color * alpha, alpha);
  }
`;

export function createNebula(scene, { count = 800 } = {}) {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const seeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = Math.random() * 80 - 40;
    positions[i * 3 + 1] = Math.random() * 80 - 40;
    positions[i * 3 + 2] = Math.random() * -300 - 200;
    sizes[i] = 6 + Math.random() * 14;
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
      uColorCyan: { value: new THREE.Color().setHSL(190 / 360, 0.9, 0.6) },
      uColorViolet: { value: new THREE.Color().setHSL(270 / 360, 0.9, 0.65) },
    },
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const nebula = new THREE.Points(geometry, material);
  nebula.frustumCulled = false;

  nebula.userData.update = (delta) => {
    material.uniforms.uTime.value += delta;
  };

  scene.add(nebula);
  return nebula;
}