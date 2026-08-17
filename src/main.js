import { initScene, animate } from './scene.js';
import { createStarField } from './stars.js';
import { createPlanets } from './planets.js';
import { createFloatingGeometry } from './geometry.js';
import { createNebula } from './nebula.js';
import { setupScrollCamera, setupScrollTriggers } from './scroll-parallax.js';
import { setupDOMAnimations } from './dom-animations.js';
import './styles/index.css';

(function init() {
  const scene = initScene();

  const stars = createStarField(scene);
  const planets = createPlanets(scene);
  const geometries = createFloatingGeometry(scene);
  const nebula = createNebula(scene);

  setupScrollCamera({ stars, planets, geometries, nebula });
  setupScrollTriggers();
  setupDOMAnimations({ planets, geometries, nebula });

  animate((deltaTime, elapsedTime, state) => {
    // 1. Update Starfield, Shooting Stars & Stardust
    if (stars?.userData?.update) {
      stars.userData.update(deltaTime, elapsedTime, state);
    }

    // 2. Update Nebula Volumetric Shader
    if (nebula?.userData?.update) {
      nebula.userData.update(deltaTime, elapsedTime, state);
    }

    // 3. Update Planets — all rotations are delta-time scaled for frame-rate independence
    if (planets?.length) {
      planets.forEach((planetGroup, idx) => {
        const u = planetGroup.userData;

        // Core smooth rotation (delta-time scaled)
        if (u.core) {
          u.core.rotation.y += (u.rotSpeedY || 0.005) * deltaTime * 60;
          u.core.rotation.x += (u.rotSpeedX || 0.001) * deltaTime * 60;
        }

        // GLSL Shader time uniforms
        if (u.magmaMat?.uniforms?.uTime) {
          u.magmaMat.uniforms.uTime.value = elapsedTime;
        }
        if (u.shaderMat?.uniforms?.uTime) {
          u.shaderMat.uniforms.uTime.value = elapsedTime;
        }
        if (u.northAurora?.material?.uniforms?.uTime) {
          u.northAurora.material.uniforms.uTime.value = elapsedTime;
        }
        if (u.southAurora?.material?.uniforms?.uTime) {
          u.southAurora.material.uniforms.uTime.value = elapsedTime;
        }

        // 3D Asteroid Belt Rotation (delta-time scaled)
        if (u.belt) {
          u.belt.rotation.z += 0.002 * deltaTime * 60;
        }

        // Independent rotating cloud layer (delta-time scaled)
        if (u.clouds) {
          u.clouds.rotation.y += (u.rotSpeedY || 0.004) * 1.5 * deltaTime * 60;
          u.clouds.rotation.x += 0.0008 * deltaTime * 60;
        }

        // Ring rotations (delta-time scaled)
        if (u.ring1) {
          u.ring1.rotation.z += 0.0025 * deltaTime * 60;
        }
        if (u.ring2) {
          u.ring2.rotation.z -= 0.0018 * deltaTime * 60;
        }

        // Moon orbital mechanics (already time-based via elapsedTime, just need smoother self-rotation)
        if (u.moon) {
          const orbitAngle = elapsedTime * (0.5 + idx * 0.15);
          const orbitRadius = 30 + idx * 8;
          u.moon.position.x = Math.cos(orbitAngle) * orbitRadius;
          u.moon.position.z = Math.sin(orbitAngle) * orbitRadius;
          u.moon.rotation.y += 0.008 * deltaTime * 60;
        }
        if (u.moon1) {
          const orbitAngle = elapsedTime * 0.4;
          u.moon1.position.x = Math.cos(orbitAngle) * 44;
          u.moon1.position.z = Math.sin(orbitAngle) * 44;
          u.moon1.rotation.y += 0.006 * deltaTime * 60;
        }
        if (u.moon2) {
          const orbitAngle = -elapsedTime * 0.3 + 1.5;
          u.moon2.position.x = Math.cos(orbitAngle) * 54;
          u.moon2.position.z = Math.sin(orbitAngle) * 54;
          u.moon2.rotation.y += 0.009 * deltaTime * 60;
        }
      });
    }

    // 4. Update Floating Quantum Geometries (delta-time scaled)
    if (geometries?.length) {
      geometries.forEach((geomGroup, idx) => {
        const u = geomGroup.userData;
        if (u.rotSpeed) {
          geomGroup.rotation.x += u.rotSpeed.x * deltaTime * 60;
          geomGroup.rotation.y += u.rotSpeed.y * deltaTime * 60;
          geomGroup.rotation.z += u.rotSpeed.z * deltaTime * 60;
        }
        // Floating sinusoidal bobbing
        if (u.basePos) {
          geomGroup.position.y = u.basePos.y + Math.sin(elapsedTime * 1.2 + idx * 2) * 3.5;
        }
      });
    }
  });
})();