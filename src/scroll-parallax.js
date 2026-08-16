import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { getCamera } from './scene.js';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance = null;

export function initSmoothScroll() {
  if (lenisInstance) return lenisInstance;

  lenisInstance = new Lenis({
    duration: 1.0,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.5,
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

  const ctx = gsap.context(() => {
    // 1. Hero -> Nebula Discovery
    gsap.timeline({
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.8,
      },
    }).fromTo(
      camera.position,
      { x: 0, y: 0, z: 80 },
      { x: 0, y: 1, z: -60, ease: 'power1.inOut' }
    );

    // 2. Nebula Discovery: Dive into nebula center
    gsap.timeline({
      scrollTrigger: {
        trigger: '#nebula-discovery',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.0,
      },
    }).to(camera.position, {
      x: 0,
      y: 0,
      z: -200,
      ease: 'power2.inOut',
    });

    // 3. Horizontal Planets Showcase: Synchronized Camera & Card Navigation
    const planetsSection = document.querySelector('#planets-showcase');
    const planetsTrack = document.querySelector('.planets-track');
    const planetCards = document.querySelectorAll('.planet-card');

    if (planetsSection && planetsTrack && planetCards.length > 0) {
      const cardCount = planetCards.length;
      const totalPercent = (cardCount - 1) * 100;

      // Scale in planets smoothly as user enters planets section
      planets.forEach((planetGroup) => {
        gsap.timeline({
          scrollTrigger: {
            trigger: '#planets-showcase',
            start: 'top 80%',
            end: 'top 20%',
            scrub: 0.8,
          },
        }).to(planetGroup.scale, {
          x: 1,
          y: 1,
          z: 1,
          ease: 'power2.out',
        });

        // Scale down planets as user exits showcase into capabilities
        gsap.timeline({
          scrollTrigger: {
            trigger: '#capabilities',
            start: 'top bottom',
            end: 'top 40%',
            scrub: 0.8,
          },
        }).to(planetGroup.scale, {
          x: 0.001,
          y: 0.001,
          z: 0.001,
          ease: 'power2.in',
        });
      });

      // Tight, responsive pin distance (1600px instead of 4200px)
      const planetTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#planets-showcase',
          start: 'top top',
          end: '+=1600',
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          snap: {
            snapTo: 1 / (cardCount - 1),
            duration: { min: 0.2, max: 0.4 },
            delay: 0.05,
            ease: 'power2.out',
          },
        },
      });

      // Track horizontal movement
      planetTl.to(planetsTrack, {
        xPercent: -totalPercent,
        ease: 'none',
      }, 0);

      // Camera smoothly glides from Meridian (z = -380) -> Azurea (z = -620) -> Vesperion (z = -860)
      planetTl.fromTo(
        camera.position,
        { x: -2, y: 0, z: -310 },
        { x: -2, y: 0, z: -550, ease: 'power1.inOut' },
        0
      ).to(
        camera.position,
        { x: -2, y: 0, z: -780, ease: 'power1.inOut' },
        0.5
      );
    }

    // 4. Capabilities / Tech Lab: Scale In Geometries & Camera Move
    if (document.querySelector('#capabilities')) {
      geometries.forEach((geomGroup) => {
        gsap.timeline({
          scrollTrigger: {
            trigger: '#capabilities',
            start: 'top 80%',
            end: 'top 30%',
            scrub: 0.8,
          },
        }).to(geomGroup.scale, {
          x: 1,
          y: 1,
          z: 1,
          ease: 'power2.out',
        });

        gsap.timeline({
          scrollTrigger: {
            trigger: '#stats-counter',
            start: 'top bottom',
            end: 'top top',
            scrub: 0.8,
          },
        }).to(geomGroup.scale, {
          x: 0.001,
          y: 0.001,
          z: 0.001,
          ease: 'power2.in',
        });
      });

      gsap.timeline({
        scrollTrigger: {
          trigger: '#capabilities',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.0,
        },
      }).to(camera.position, {
        x: 0,
        y: 2,
        z: -1140,
        ease: 'power2.inOut',
      });
    }

    // 5. Telemetry Stats: Camera in deep telemetry starfield
    if (document.querySelector('#stats-counter')) {
      gsap.timeline({
        scrollTrigger: {
          trigger: '#stats-counter',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.0,
        },
      }).to(camera.position, {
        x: 2,
        y: -1,
        z: -1420,
        ease: 'power1.inOut',
      });
    }

    // 6. Gallery / Deep Space Archive: Serene observatory vantage
    if (document.querySelector('#gallery')) {
      gsap.timeline({
        scrollTrigger: {
          trigger: '#gallery',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.0,
        },
      }).to(camera.position, {
        x: 0,
        y: 0,
        z: -1720,
        ease: 'power2.inOut',
      });
    }

    // 7. Pricing / Mission Control & Footer
    if (document.querySelector('#pricing')) {
      gsap.timeline({
        scrollTrigger: {
          trigger: '#pricing',
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: 1.0,
        },
      }).to(camera.position, {
        x: 0,
        y: -2,
        z: -2020,
        ease: 'power1.inOut',
      });
    }
  });

  return () => {
    ctx.revert();
  };
}

export function setupScrollTriggers() {
  const ctx = gsap.context(() => {
    // 1. Hero Reveal Animations
    gsap.timeline({
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom 40%',
        scrub: 0.6,
      },
    })
      .to('#hero .hero-content', { opacity: 0, y: -40, duration: 1 }, 0)
      .to('#hero .scroll-indicator', { opacity: 0, duration: 0.3 }, 0);

    // 2. Nebula Discovery Entrance
    gsap.timeline({
      scrollTrigger: {
        trigger: '#nebula-discovery',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    })
      .fromTo('#nebula-discovery .nebula-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('#nebula-discovery h2', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.4')
      .fromTo('#nebula-discovery .nebula-text', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
      .fromTo('#nebula-discovery .nebula-controls', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');

    // 3. SaaS Capabilities Grid
    gsap.utils.toArray('.capability-card').forEach((card, i) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 45, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.75,
          delay: (i % 3) * 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // 4. Stats Counter Cards
    gsap.utils.toArray('#stats-counter .stat-card').forEach((card, i) => {
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

    // 5. Gallery Items with Smooth Zoom and Stagger
    gsap.utils.toArray('#gallery .gallery-item').forEach((item, i) => {
      gsap.fromTo(
        item,
        { opacity: 0, y: 40, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.65,
          delay: (i % 4) * 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // 6. Pricing Cards
    gsap.utils.toArray('.pricing-card').forEach((card, i) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 45, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          delay: i * 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // 7. Footer Entrance
    const footerTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#footer',
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });
    footerTl
      .fromTo('#footer .footer-cta-box', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
      .fromTo('#footer .footer-columns', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');
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
