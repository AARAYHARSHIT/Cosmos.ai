import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { getCanvasEngine } from './canvas-engine.js';
import { playSound } from './audio.js';
import { decryptText } from './cipher-engine.js';

gsap.registerPlugin(ScrollTrigger);

// Prevent GSAP ticker from sleeping
gsap.to({}, { duration: 999999, repeat: -1 });

let lenisInstance = null;

// Planet data catalog for real-time telemetry updates
export const PLANET_DATA = {
  azurea: {
    name: 'Azurea Prime',
    type: 'OCEAN SUPER-EARTH',
    badgeClass: 'ocean-badge',
    stageClass: 'planet-azurea-stage',
    dist: '1.12 AU',
    gravity: '0.98 g',
    temp: '19.4 °C',
    biosignature: '94.2%',
    inclination: '14.82°',
    crust: 'Silicate Basin / 92% H₂O',
    pressure: '1.14 bar (Earth Equiv)',
    atmosphereDepth: '280 km Troposphere',
    habitability: 'Class-A Prime (94%)',
    gases: [
      { name: 'H₂O (Water Vapor)', val: '78.4%', fillClass: 'cyan-fill' },
      { name: 'N₂ (Nitrogen)', val: '14.2%', fillClass: 'blue-fill' },
      { name: 'O₂ (Oxygen)', val: '5.8%', fillClass: 'emerald-fill' },
      { name: 'Xe (Rare Xenon)', val: '1.6%', fillClass: 'violet-fill' },
    ]
  },
  vesperion: {
    name: 'Vesperion',
    type: 'RINGED GAS TITAN',
    badgeClass: 'ringed-badge',
    stageClass: 'planet-vesperion-stage',
    dist: '3.45 AU',
    gravity: '2.14 g',
    temp: '-148.0 °C',
    biosignature: '12.8%',
    inclination: '26.40°',
    crust: 'Metallic Hydrogen Core',
    pressure: '48.2 bar (Supercritical)',
    atmosphereDepth: '1,400 km Gas Shroud',
    habitability: 'Class-D Gas Giant',
    gases: [
      { name: 'H₂ (Hydrogen)', val: '86.2%', fillClass: 'violet-fill' },
      { name: 'He (Helium)', val: '11.4%', fillClass: 'cyan-fill' },
      { name: 'CH₄ (Methane)', val: '2.1%', fillClass: 'blue-fill' },
      { name: 'NH₃ (Ammonia)', val: '0.3%', fillClass: 'emerald-fill' },
    ]
  },
  ignis: {
    name: 'Ignis-9',
    type: 'MOLTEN LAVA CORE',
    badgeClass: 'lava-badge',
    stageClass: 'planet-ignis-stage',
    dist: '0.38 AU',
    gravity: '1.42 g',
    temp: '840.5 °C',
    biosignature: '0.0%',
    inclination: '4.12°',
    crust: 'Basaltic Magma & Obsidian',
    pressure: '92.0 bar (Volcanic Outgas)',
    atmosphereDepth: '120 km Sulfur Cloud',
    habitability: 'Class-F Pyros (Hostile)',
    gases: [
      { name: 'SO₂ (Sulfur Dioxide)', val: '64.5%', fillClass: 'lava-fill' },
      { name: 'CO₂ (Carbon Dioxide)', val: '28.1%', fillClass: 'blue-fill' },
      { name: 'N₂ (Nitrogen)', val: '6.2%', fillClass: 'emerald-fill' },
      { name: 'Ar (Argon)', val: '1.2%', fillClass: 'violet-fill' },
    ]
  },
  glacies: {
    name: 'Glacies-X',
    type: 'CRYOGENIC ICE GIANT',
    badgeClass: 'cryo-badge',
    stageClass: 'planet-glacies-stage',
    dist: '6.82 AU',
    gravity: '0.82 g',
    temp: '-212.8 °C',
    biosignature: '41.6%',
    inclination: '31.15°',
    crust: 'Superdense Nitrogen Ice Shell',
    pressure: '0.45 bar (Sub-Surface Liquid)',
    atmosphereDepth: '350 km Diamond Mist',
    habitability: 'Class-C Cryo (Sub-ice Sea)',
    gases: [
      { name: 'N₂ (Nitrogen Ice Gas)', val: '82.0%', fillClass: 'cyan-fill' },
      { name: 'CH₄ (Methane Ice)', val: '12.5%', fillClass: 'blue-fill' },
      { name: 'CO (Carbon Monoxide)', val: '4.2%', fillClass: 'violet-fill' },
      { name: 'H₂O (Sub-ice Vapor)', val: '1.3%', fillClass: 'emerald-fill' },
    ]
  }
};

let currentActivePlanet = 'azurea';

export function getLenis() {
  return lenisInstance;
}

export function switchPlanetUI(planetKey, animateStage = true) {
  const data = PLANET_DATA[planetKey];
  if (!data) return;

  currentActivePlanet = planetKey;

  // Update target labels with cipher decryption
  const nameEl = document.getElementById('planet-target-name');
  const typeEl = document.getElementById('planet-target-type');
  if (nameEl) decryptText(nameEl, data.name, { duration: 380, speed: 20 });
  if (typeEl) {
    typeEl.className = `target-class ${data.badgeClass}`;
    decryptText(typeEl, data.type, { duration: 420, speed: 20 });
  }

  // Update metrics with cipher decryption
  const distEl = document.getElementById('planet-metric-dist');
  const gravEl = document.getElementById('planet-metric-grav');
  const tempEl = document.getElementById('planet-metric-temp');
  const bioEl = document.getElementById('planet-metric-bio');
  const incEl = document.getElementById('stage-orbit-inc');

  if (distEl) decryptText(distEl, data.dist, { duration: 320, speed: 20 });
  if (gravEl) decryptText(gravEl, data.gravity, { duration: 320, speed: 20 });
  if (tempEl) decryptText(tempEl, data.temp, { duration: 320, speed: 20 });
  if (bioEl) decryptText(bioEl, data.biosignature, { duration: 320, speed: 20 });
  if (incEl) decryptText(incEl, data.inclination, { duration: 320, speed: 20 });

  // Update Gas Composition Bars
  data.gases.forEach((g, i) => {
    const valEl = document.getElementById(`gas-val-${i + 1}`);
    const barEl = document.getElementById(`gas-bar-${i + 1}`);
    if (valEl) valEl.textContent = g.val;
    if (barEl) {
      barEl.style.width = g.val;
      barEl.className = `bar-fill ${g.fillClass}`;
    }
  });

  // Update Hologram Planet Sphere Stage
  const sphere = document.getElementById('hologram-planet-core');
  if (sphere) {
    sphere.className = `planet-hologram-sphere ${data.stageClass}`;
    if (animateStage) {
      gsap.fromTo(sphere, 
        { scale: 0.85, rotationY: -45, opacity: 0.7 },
        { scale: 1, rotationY: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.4)' }
      );
    }
  }

  // Update selector card active states
  document.querySelectorAll('.planet-select-card').forEach(card => {
    if (card.getAttribute('data-target-planet') === planetKey) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });

  playSound('radarChirp');
}

export function initSmoothScroll() {
  if (lenisInstance) return lenisInstance;

  lenisInstance = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.95,
    touchMultiplier: 1.5,
    infinite: false,
  });

  const canvasEngine = getCanvasEngine();
  const speedHud = document.getElementById('hud-warp-speed');

  lenisInstance.on('scroll', (e) => {
    ScrollTrigger.update();

    // Feed scroll velocity to 3D Canvas Starfield
    if (canvasEngine && e.velocity) {
      canvasEngine.setScrollVelocity(e.velocity);

      // Update speedometer HUD
      if (speedHud) {
        const vel = Math.abs(e.velocity);
        if (vel > 12) {
          speedHud.textContent = `WARP SPEED: ${(vel * 0.4).toFixed(1)}c [HYPERSPACE]`;
          speedHud.style.color = '#00ffdc';
        } else {
          speedHud.textContent = `VELOCITY: ${(0.85 + vel * 0.05).toFixed(2)}c [STABLE]`;
          speedHud.style.color = 'var(--color-accent-cyan)';
        }
      }
    }
  });

  function raf(time) {
    lenisInstance.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  return lenisInstance;
}

export function setupScrollTriggers() {
  initSmoothScroll();
  const canvasEngine = getCanvasEngine();

  const ctx = gsap.context(() => {
    // 0. Mission Flight Progress Trail Tracking
    const trailSteps = gsap.utils.toArray('.trail-step');
    const sections = gsap.utils.toArray('section');

    sections.forEach((sec, idx) => {
      ScrollTrigger.create({
        trigger: sec,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => updateTrail(idx),
        onEnterBack: () => updateTrail(idx),
      });
    });

    function updateTrail(activeIndex) {
      trailSteps.forEach((step, i) => {
        if (i === activeIndex) {
          step.classList.add('active');
        } else {
          step.classList.remove('active');
        }
      });

      const fill = document.querySelector('.trail-progress-fill');
      if (fill && sections.length > 1) {
        const pct = (activeIndex / (sections.length - 1)) * 100;
        fill.style.height = `${pct}%`;
      }
    }

    // 1. Hero Section Exit
    gsap.timeline({
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom 20%',
        scrub: 0.8,
        onLeave: () => {
          if (canvasEngine) canvasEngine.setAmbientChapter(12, 10, 30);
        },
        onEnterBack: () => {
          if (canvasEngine) canvasEngine.setAmbientChapter(6, 9, 24);
        }
      },
    })
      .to('#hero .story-chapter-badge', { y: -30, opacity: 0, duration: 0.6 }, 0)
      .to('#hero .hero-title', { y: -50, opacity: 0, duration: 0.8 }, 0)
      .to('#hero .subtitle', { y: -35, opacity: 0, duration: 0.7 }, 0.05)
      .to('#hero .hero-actions', { y: -25, opacity: 0, duration: 0.6 }, 0.1)
      .to('#hero .hero-hud-strip', { y: 30, opacity: 0, duration: 0.8 }, 0)
      .to('#hero .hero-telemetry-wing.wing-left', { x: -160, z: -80, opacity: 0, rotationY: 45, duration: 0.7 }, 0)
      .to('#hero .hero-telemetry-wing.wing-right', { x: 160, z: -80, opacity: 0, rotationY: -45, duration: 0.7 }, 0)
      .to('#hero .scroll-indicator', { opacity: 0, duration: 0.3 }, 0);

    // 1.5. Kinetic Typography Parallax Corridor (Bridge 01 -> 02)
    const kineticCorridor = document.querySelector('.hero-nebula-transition-corridor');
    if (kineticCorridor) {
      gsap.to('.track-upper', {
        xPercent: -35,
        scale: 1.15,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-nebula-transition-corridor',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
        }
      });

      gsap.to('.track-lower', {
        xPercent: 35,
        scale: 1.15,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-nebula-transition-corridor',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
        }
      });

      gsap.fromTo('.kinetic-zoom-core',
        { scale: 0.8, opacity: 0.4, z: -100 },
        {
          scale: 1.8,
          opacity: 1,
          z: 120,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.hero-nebula-transition-corridor',
            start: 'top 85%',
            end: 'center center',
            scrub: 0.6,
          }
        }
      );
    }

    // 2. Nebula Discovery Entrance
    gsap.timeline({
      scrollTrigger: {
        trigger: '#nebula-discovery',
        start: 'top 85%',
        toggleActions: 'play none none reverse',
        onEnter: () => {
          if (canvasEngine) canvasEngine.setAmbientChapter(24, 10, 42);
        },
        onLeaveBack: () => {
          if (canvasEngine) canvasEngine.setAmbientChapter(6, 9, 24);
        }
      },
    })
      .from('#nebula-discovery .story-chapter-badge', { opacity: 0, y: 24, duration: 0.6, ease: 'power3.out' })
      .from('#nebula-discovery h2', { opacity: 0, y: 35, duration: 0.7, ease: 'power3.out' }, '-=0.4')
      .from('#nebula-discovery .nebula-text', { opacity: 0, y: 25, duration: 0.7, ease: 'power3.out' }, '-=0.5')
      .from('#nebula-discovery .nebula-controls', { opacity: 0, y: 30, scale: 0.96, duration: 0.65, ease: 'power3.out' }, '-=0.4');

    // 3. Chapter 03: Fluid 3D Planetary Reconnaissance Deck (Continuous Parallax - Zero Pause!)
    const planetsSection = document.querySelector('#planets-showcase');
    if (planetsSection) {
      ScrollTrigger.create({
        trigger: '#planets-showcase',
        start: 'top 75%',
        end: 'bottom 25%',
        onEnter: () => {
          if (canvasEngine) canvasEngine.setAmbientChapter(8, 16, 36);
        },
        onLeaveBack: () => {
          if (canvasEngine) canvasEngine.setAmbientChapter(24, 10, 42);
        }
      });

      // Continuous 3D Parallax on the holographic stage
      gsap.to('.planet-hologram-stage', {
        y: -40,
        rotationY: 25,
        ease: 'none',
        scrollTrigger: {
          trigger: '#planets-showcase',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.0,
        }
      });

      // Left and right telemetry columns glide with parallax depth
      gsap.to('.telemetry-panel', {
        y: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: '#planets-showcase',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
        }
      });

      gsap.to('.planet-selector-deck', {
        y: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: '#planets-showcase',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        }
      });
    }

    // Direct Planet Selector Card Click Handlers
    document.querySelectorAll('.planet-select-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const planetKey = btn.getAttribute('data-target-planet');
        if (planetKey) {
          switchPlanetUI(planetKey, true);
        }
      });
    });

    // 3.5. Chapter 03.5: Quantum Relativity Gateway Parallax Bridge
    const gatewaySection = document.querySelector('#quantum-gateway');
    if (gatewaySection) {
      ScrollTrigger.create({
        trigger: '#quantum-gateway',
        start: 'top 75%',
        end: 'bottom 25%',
        onEnter: () => {
          if (canvasEngine) canvasEngine.setAmbientChapter(4, 28, 32); // Emerald-cyan warp field
        },
        onLeaveBack: () => {
          if (canvasEngine) canvasEngine.setAmbientChapter(8, 16, 36);
        }
      });

      // 3D Astrolabe Ring Parallax Expansion
      gsap.to('.astrolabe-3d-stage', {
        scale: 1.35,
        rotationX: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: '#quantum-gateway',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.0,
        }
      });

      // Left and Right Relativistic Panels glide across screen
      gsap.fromTo('.stream-panel.panel-left',
        { x: -60, opacity: 0.6 },
        {
          x: 0,
          opacity: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '#quantum-gateway',
            start: 'top 80%',
            end: 'center center',
            scrub: 0.8,
          }
        }
      );

      gsap.fromTo('.stream-panel.panel-right',
        { x: 60, opacity: 0.6 },
        {
          x: 0,
          opacity: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '#quantum-gateway',
            start: 'top 80%',
            end: 'center center',
            scrub: 0.8,
          }
        }
      );
    }

    // 4. Capabilities Bento Grid (Chapter 04: Quantum Systems)
    const capSection = document.querySelector('#capabilities');
    if (capSection) {
      ScrollTrigger.create({
        trigger: '#capabilities',
        start: 'top 70%',
        end: 'bottom 30%',
        onEnter: () => {
          if (canvasEngine) canvasEngine.setAmbientChapter(4, 28, 30);
        },
        onLeaveBack: () => {
          if (canvasEngine) canvasEngine.setAmbientChapter(4, 28, 32);
        }
      });

      // Animate the Quantum Core backdrop
      gsap.to('.quantum-flux-ring', {
        rotationZ: 360,
        ease: 'none',
        scrollTrigger: {
          trigger: '#capabilities',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.0,
        }
      });

      gsap.fromTo('.quantum-singularity-core',
        { scale: 0.6, opacity: 0.4 },
        {
          scale: 1.3,
          opacity: 0.9,
          ease: 'none',
          scrollTrigger: {
            trigger: '#capabilities',
            start: 'top 80%',
            end: 'center center',
            scrub: 1.0,
          }
        }
      );
    }

    // Capability Cards: Clean entrance + Parallax vertical float
    const capCards = gsap.utils.toArray('.capability-card');
    capCards.forEach((card, i) => {
      const colIndex = i % 3;
      const yOffset = colIndex === 0 ? -40 : colIndex === 1 ? 0 : -50;

      // Entrance animation
      gsap.from(card, {
        opacity: 0,
        y: 40,
        scale: 0.95,
        duration: 0.6,
        delay: colIndex * 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        },
      });

      // Parallax float
      gsap.to(card, {
        y: yOffset,
        ease: 'none',
        scrollTrigger: {
          trigger: '#capabilities',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.0,
        },
      });
    });

    // 5. Stats Counter Cards (Chapter 05: Sensor Telemetry)
    const statsSection = document.querySelector('#stats-counter');
    if (statsSection) {
      ScrollTrigger.create({
        trigger: '#stats-counter',
        start: 'top 70%',
        end: 'bottom 30%',
        onEnter: () => {
          if (canvasEngine) canvasEngine.setAmbientChapter(6, 20, 48);
        },
        onLeaveBack: () => {
          if (canvasEngine) canvasEngine.setAmbientChapter(4, 28, 30);
        }
      });

      // Animate the Sensor Array backdrop
      gsap.to('.sensor-dish-ring', {
        rotationZ: 180,
        scale: 1.1,
        ease: 'none',
        scrollTrigger: {
          trigger: '#stats-counter',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        }
      });
    }

    gsap.utils.toArray('#stats-counter .stat-card').forEach((card, i) => {
      // Entrance
      gsap.from(card, {
        opacity: 0,
        y: 35,
        scale: 0.94,
        duration: 0.6,
        delay: i * 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        },
      });

      // Parallax float
      gsap.to(card, {
        y: i % 2 === 0 ? -20 : -40,
        ease: 'none',
        scrollTrigger: {
          trigger: '#stats-counter',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.0,
        },
      });
    });

    // 6. Gallery Items (Chapter 06)
    gsap.utils.toArray('#gallery .gallery-item').forEach((item, i) => {
      gsap.from(item, {
        opacity: 0,
        y: 35,
        scale: 0.95,
        duration: 0.6,
        delay: (i % 4) * 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        },
      });
    });

    // 7. Pricing Cards (Chapter 07)
    gsap.utils.toArray('.pricing-card').forEach((card, i) => {
      gsap.from(card, {
        opacity: 0,
        y: 40,
        scale: 0.94,
        duration: 0.7,
        delay: i * 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    });

    // 8. Footer Entrance
    const footerTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#footer',
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });
    footerTl
      .from('#footer .footer-cta-box', { opacity: 0, y: 35, duration: 0.75, ease: 'power3.out' })
      .from('#footer .footer-columns', { opacity: 0, y: 20, duration: 0.55 }, '-=0.35');
  });

  function onResize() {
    ScrollTrigger.refresh();
  }
  window.addEventListener('resize', onResize);

  return () => {
    ctx.revert();
    window.removeEventListener('resize', onResize);
  };
}
