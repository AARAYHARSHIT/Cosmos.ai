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
    // 1. Update Starfield
    if (stars?.userData?.update) {
      stars.userData.update(deltaTime, elapsedTime, state);
    }

    // 2. Update Nebula Volumetric Shader
    if (nebula?.userData?.update) {
      nebula.userData.update(deltaTime, elapsedTime, state);
    }

    // 3. Update Planets Continuous Orbit & Rotation
    if (planets?.length) {
      planets.forEach((planetGroup, idx) => {
        const u = planetGroup.userData;
        if (u.core) {
          u.core.rotation.y += u.rotSpeedY || 0.005;
          u.core.rotation.x += u.rotSpeedX || 0.002;
        }
        if (u.ring) {
          u.ring.rotation.z += 0.004;
        }
        if (u.ring1) {
          u.ring1.rotation.z += 0.003;
        }
        if (u.ring2) {
          u.ring2.rotation.z -= 0.002;
        }
        if (u.moon) {
          const orbitAngle = elapsedTime * (0.8 + idx * 0.3);
          const orbitRadius = 24 + idx * 6;
          u.moon.position.x = Math.cos(orbitAngle) * orbitRadius;
          u.moon.position.z = Math.sin(orbitAngle) * orbitRadius;
        }
        if (u.moon1) {
          const orbitAngle = elapsedTime * 0.6;
          u.moon1.position.x = Math.cos(orbitAngle) * 38;
          u.moon1.position.z = Math.sin(orbitAngle) * 38;
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