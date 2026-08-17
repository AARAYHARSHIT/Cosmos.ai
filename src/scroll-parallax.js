import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { getCamera } from './scene.js';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance = null;

export function initSmoothScroll() {
  if (lenisInstance) return lenisInstance;

  lenisInstance = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.95,
    touchMultiplier: 1.5,
    infinite: false,
  });

  lenisInstance.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenisInstance.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  return lenisInstance;
}

export function setupScrollCamera({ stars, planets = [], geometries = [], nebula } = {}) {
  const camera = getCamera();
  if (!camera) return () => {};

  // Initialize buttery smooth scrolling
  initSmoothScroll();

  const SCRUB_SPEED = 1.2;

  const azurea = planets[0];
  const vesperion = planets[1];

  const ctx = gsap.context(() => {
    // Ensure all 3D foreground objects start completely invisible
    if (azurea) azurea.scale.set(0.0001, 0.0001, 0.0001);
    if (vesperion) vesperion.scale.set(0.0001, 0.0001, 0.0001);
    geometries.forEach((g) => g.scale.set(0.0001, 0.0001, 0.0001));

    // ========================================================================
    // 1. HERO FLIGHT (Camera moves z: 80 -> -40) — Pure stars & cosmic atmosphere
    // ========================================================================
    gsap.timeline({
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: SCRUB_SPEED,
      },
    }).fromTo(
      camera.position,
      { x: 0, y: 0, z: 80 },
      { x: 0, y: 0.4, z: -40, ease: 'none' }
    );

    // ========================================================================
    // 2. NEBULA DISCOVERY (Camera moves z: -40 -> -190)
    //    Dive through volumetric nebula cloud, Azurea begins emerging at end
    // ========================================================================
    const nebulaTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#nebula-discovery',
        start: 'top bottom',
        end: 'bottom top',
        scrub: SCRUB_SPEED,
      },
    });

    nebulaTl.to(camera.position, {
      x: 0,
      y: 0,
      z: -190,
      ease: 'none',
    });

    // Azurea starts scaling up as user scrolls through nebula toward planets
    if (azurea) {
      nebulaTl.fromTo(
        azurea.scale,
        { x: 0.0001, y: 0.0001, z: 0.0001 },
        { x: 1, y: 1, z: 1, ease: 'power2.out' },
        0.5 // Start halfway through nebula discovery
      );
      nebulaTl.fromTo(
        azurea.position,
        { x: 28, y: -10, z: -330 },
        { x: 15, y: 0, z: -290, ease: 'power1.out' },
        0.5
      );
    }

    // ========================================================================
    // 3. PLANETS SHOWCASE (Pinned Horizontal Parallax)
    //    Azurea Prime (Earth) -> Vesperion (Ringed Giant)
    // ========================================================================
    const planetsSection = document.querySelector('#planets-showcase');
    const planetsTrack = document.querySelector('.planets-track');
    const planetCards = document.querySelectorAll('.planet-card');

    if (planetsSection && planetsTrack && planetCards.length > 0) {
      const cardCount = planetCards.length;
      const totalPercent = (cardCount - 1) * 100;

      const planetTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#planets-showcase',
          start: 'top top',
          end: '+=1000',
          pin: true,
          scrub: SCRUB_SPEED,
          anticipatePin: 1,
        },
      });

      // Horizontal track slide
      planetTl.to(planetsTrack, {
        xPercent: -totalPercent,
        ease: 'none',
      }, 0);

      // Camera glides from Azurea focus to Vesperion focus
      planetTl.fromTo(
        camera.position,
        { x: -3.5, y: 0, z: -250 },
        { x: 3.8, y: 0, z: -440, ease: 'none' },
        0
      );

      // Azurea glides off to left and shrinks as we transition across
      if (azurea) {
        planetTl.to(
          azurea.position,
          { x: -28, y: -6, z: -360, ease: 'power1.inOut' },
          0
        );
        planetTl.to(
          azurea.scale,
          { x: 0.25, y: 0.25, z: 0.25, ease: 'power1.in' },
          0.4
        );
      }

      // Vesperion scales up and glides into position on the left
      if (vesperion) {
        planetTl.fromTo(
          vesperion.scale,
          { x: 0.0001, y: 0.0001, z: 0.0001 },
          { x: 1, y: 1, z: 1, ease: 'power2.out' },
          0.25
        );
        planetTl.fromTo(
          vesperion.position,
          { x: -30, y: 8, z: -530 },
          { x: -16, y: 0, z: -480, ease: 'power1.out' },
          0.25
        );
      }
    }

    // Clean exit of planets as we enter Capabilities
    gsap.timeline({
      scrollTrigger: {
        trigger: '#capabilities',
        start: 'top bottom',
        end: 'top 20%',
        scrub: SCRUB_SPEED,
      },
    })
      .to(azurea?.scale || {}, { x: 0.0001, y: 0.0001, z: 0.0001, ease: 'power2.in' }, 0)
      .to(vesperion?.scale || {}, { x: 0.0001, y: 0.0001, z: 0.0001, ease: 'power2.in' }, 0);

    // ========================================================================
    // 4. SAAS CAPABILITIES (Crystalline Quantum Polyhedra in 3D)
    // ========================================================================
    if (document.querySelector('#capabilities')) {
      const capTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#capabilities',
          start: 'top bottom',
          end: 'bottom top',
          scrub: SCRUB_SPEED,
        },
      });

      capTl.to(camera.position, {
        x: 0,
        y: 1.5,
        z: -680,
        ease: 'none',
      }, 0);

      // Reveal floating quantum geometries
      geometries.forEach((geomGroup, idx) => {
        capTl.fromTo(
          geomGroup.scale,
          { x: 0.0001, y: 0.0001, z: 0.0001 },
          { x: 1, y: 1, z: 1, ease: 'back.out(1.4)' },
          0.1 + idx * 0.08
        );
      });

      // Hide geometries on exit
      gsap.timeline({
        scrollTrigger: {
          trigger: '#stats-counter',
          start: 'top bottom',
          end: 'top 30%',
          scrub: SCRUB_SPEED,
        },
      }).to(
        geometries.map((g) => g.scale),
        { x: 0.0001, y: 0.0001, z: 0.0001, ease: 'power2.in' }
      );
    }

    // ========================================================================
    // 5. LIVE TELEMETRY & STATS (Camera z: -680 -> -920)
    // ========================================================================
    if (document.querySelector('#stats-counter')) {
      gsap.timeline({
        scrollTrigger: {
          trigger: '#stats-counter',
          start: 'top bottom',
          end: 'bottom top',
          scrub: SCRUB_SPEED,
        },
      }).to(camera.position, {
        x: 2,
        y: -0.8,
        z: -920,
        ease: 'none',
      });
    }

    // ========================================================================
    // 6. DEEP SPACE ARCHIVE / GALLERY (Camera z: -920 -> -1180)
    // ========================================================================
    if (document.querySelector('#gallery')) {
      gsap.timeline({
        scrollTrigger: {
          trigger: '#gallery',
          start: 'top bottom',
          end: 'bottom top',
          scrub: SCRUB_SPEED,
        },
      }).to(camera.position, {
        x: -1.5,
        y: 0.4,
        z: -1180,
        ease: 'none',
      });
    }

    // ========================================================================
    // 7. PRICING & FOOTER (Camera z: -1180 -> -1420)
    // ========================================================================
    if (document.querySelector('#pricing')) {
      gsap.timeline({
        scrollTrigger: {
          trigger: '#pricing',
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: SCRUB_SPEED,
        },
      }).to(camera.position, {
        x: 0,
        y: -1.8,
        z: -1420,
        ease: 'none',
      });
    }
  });

  return () => {
    ctx.revert();
  };
}

export function setupScrollTriggers() {
  const ctx = gsap.context(() => {
    // ========================================================================
    // 1. HERO PARALLAX & STAGGER
    // ========================================================================
    gsap.timeline({
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom 20%',
        scrub: 1.0,
      },
    })
      .to('#hero .hero-badge', { y: -30, opacity: 0, duration: 0.6 }, 0)
      .to('#hero .hero-title', { y: -50, opacity: 0, duration: 0.8 }, 0)
      .to('#hero .subtitle', { y: -35, opacity: 0, duration: 0.7 }, 0.05)
      .to('#hero .hero-actions', { y: -25, opacity: 0, duration: 0.6 }, 0.1)
      .to('#hero .hero-hud-strip', { y: 30, opacity: 0, duration: 0.8 }, 0)
      .to('#hero .scroll-indicator', { opacity: 0, duration: 0.3 }, 0);

    // ========================================================================
    // 2. NEBULA DISCOVERY ENTRANCE & PARALLAX
    // ========================================================================
    gsap.timeline({
      scrollTrigger: {
        trigger: '#nebula-discovery',
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    })
      .fromTo('#nebula-discovery .nebula-badge', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
      .fromTo('#nebula-discovery h2', { opacity: 0, y: 35 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
      .fromTo('#nebula-discovery .nebula-text', { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.5')
      .fromTo('#nebula-discovery .nebula-controls', { opacity: 0, y: 30, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: 'power3.out' }, '-=0.4');

    // ========================================================================
    // 3. SAAS CAPABILITIES — MULTI-LAYER DEPTH PARALLAX
    //    Columns move at different speeds as you scroll for genuine 3D depth!
    // ========================================================================
    const capCards = gsap.utils.toArray('.capability-card');
    capCards.forEach((card, i) => {
      // Entrance reveal
      gsap.fromTo(
        card,
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          delay: (i % 3) * 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Multi-layer scrub parallax based on column index
      const colIndex = i % 3;
      const yOffset = colIndex === 0 ? -35 : colIndex === 1 ? 0 : -60;

      gsap.to(card, {
        y: yOffset,
        ease: 'none',
        scrollTrigger: {
          trigger: '#capabilities',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      });
    });

    // ========================================================================
    // 4. STATS COUNTER — STAGGERED PARALLAX ENTRY
    // ========================================================================
    gsap.utils.toArray('#stats-counter .stat-card').forEach((card, i) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 35, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.65,
          delay: i * 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Subtle vertical scrub offset
      gsap.to(card, {
        y: (i % 2 === 0 ? -20 : -40),
        ease: 'none',
        scrollTrigger: {
          trigger: '#stats-counter',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      });
    });

    // ========================================================================
    // 5. GALLERY ITEMS — MULTI-SPEED STAGGER
    // ========================================================================
    gsap.utils.toArray('#gallery .gallery-item').forEach((item, i) => {
      gsap.fromTo(
        item,
        { opacity: 0, y: 35, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          delay: (i % 4) * 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // ========================================================================
    // 6. PRICING CARDS — 3D DEPTH STAGGER
    // ========================================================================
    gsap.utils.toArray('.pricing-card').forEach((card, i) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 40, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          delay: i * 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // ========================================================================
    // 7. FOOTER ENTRANCE
    // ========================================================================
    const footerTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#footer',
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });
    footerTl
      .fromTo('#footer .footer-cta-box', { opacity: 0, y: 35 }, { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' })
      .fromTo('#footer .footer-columns', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.55 }, '-=0.35');
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
