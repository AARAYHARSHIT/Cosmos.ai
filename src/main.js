import { initCanvasEngine } from './canvas-engine.js';
import { setupScrollTriggers } from './scroll-parallax.js';
import { setupDOMAnimations } from './dom-animations.js';
import './styles/index.css';

(function init() {
  // 1. Initialize 60FPS 3D Canvas Flight & Warp Engine
  initCanvasEngine();

  // 2. Initialize GSAP Scroll Parallax & Planetary Reconnaissance Timeline
  setupScrollTriggers();

  // 3. Initialize DOM UI Interactions (modals, terminals, tabs, card tilts)
  setupDOMAnimations();
})();