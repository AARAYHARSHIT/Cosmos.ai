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
    // 1. Update Starfield, Skybox, Shooting Stars & Stardust
    if (stars?.userData?.update) {
      stars.userData.update(deltaTime, elapsedTime, state);
    }

    // 2. Update Nebula Volumetric Shader
    if (nebula?.userData?.update) {
      nebula.userData.update(deltaTime, elapsedTime, state);
    }

    // 3. Update Planets Continuous Orbit, Shaders & Moons
    if (planets?.length) {
      planets.forEach((planetGroup, idx) => {
        const u = planetGroup.userData;

        // Core rotation
        if (u.core) {
          u.core.rotation.y += u.rotSpeedY || 0.005;
          u.core.rotation.x += u.rotSpeedX || 0.001;
        }

        // Custom GLSL Shaders Time Update
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

        // 3D Asteroid Belt Rotation
        if (u.belt) {
          u.belt.rotation.z += 0.002;
        }

        // Independent rotating cloud layer
        if (u.clouds) {
          u.clouds.rotation.y += (u.rotSpeedY || 0.004) * 1.5;
          u.clouds.rotation.x += 0.0008;
        }

        // Ring rotations
        if (u.ring1) {
          u.ring1.rotation.z += 0.0025;
        }
        if (u.ring2) {
          u.ring2.rotation.z -= 0.0018;
        }

        // Moon orbital mechanics
        if (u.moon) {
          const orbitAngle = elapsedTime * (0.6 + idx * 0.2);
          const orbitRadius = 30 + idx * 6;
          u.moon.position.x = Math.cos(orbitAngle) * orbitRadius;
          u.moon.position.z = Math.sin(orbitAngle) * orbitRadius;
          u.moon.rotation.y += 0.01;
        }
        if (u.moon1) {
          const orbitAngle = elapsedTime * 0.5;
          u.moon1.position.x = Math.cos(orbitAngle) * 48;
          u.moon1.position.z = Math.sin(orbitAngle) * 48;
          u.moon1.rotation.y += 0.008;
        }
        if (u.moon2) {
          const orbitAngle = -elapsedTime * 0.35 + 1.5;
          u.moon2.position.x = Math.cos(orbitAngle) * 58;
          u.moon2.position.z = Math.sin(orbitAngle) * 58;
          u.moon2.rotation.y += 0.012;
        }
      });
    }

    // 4. Update Floating Quantum Geometries
    if (geometries?.length) {
      geometries.forEach((geomGroup, idx) => {
        const u = geomGroup.userData;
        if (u.rotSpeed) {
          geomGroup.rotation.x += u.rotSpeed.x;
          geomGroup.rotation.y += u.rotSpeed.y;
          geomGroup.rotation.z += u.rotSpeed.z;
        }
        // Floating sinusoidal bobbing
        if (u.basePos) {
          geomGroup.position.y = u.basePos.y + Math.sin(elapsedTime * 1.5 + idx * 2) * 4;
        }
      });
    }
  });
})();