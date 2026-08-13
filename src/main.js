import { initScene, animate } from './scene.js';
import { createStarField } from './stars.js';
import { createPlanets } from './planets.js';
import { createFloatingGeometry } from './geometry.js';
import { createNebula } from './nebula.js';
import { setupScrollCamera, setupScrollTriggers, setupHorizontalScroll } from './scroll-parallax.js';
import { setupDOMAnimations } from './dom-animations.js';
import './styles/index.css';

(function init() {
  const scene = initScene();

  const stars = createStarField(scene);
  const planets = createPlanets(scene);
  const geometries = createFloatingGeometry(scene);
  const nebula = createNebula(scene);

  setupScrollCamera({ stars, planets, geometries });
  setupScrollTriggers();
  setupHorizontalScroll();
  setupDOMAnimations(planets, geometries);

  animate((deltaTime) => {
    if (nebula?.userData?.update) {
      nebula.userData.update(deltaTime);
    }
  });
})();