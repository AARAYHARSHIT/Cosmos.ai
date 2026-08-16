import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getCamera } from './scene.js';

gsap.registerPlugin(ScrollTrigger);

let cameraTimeline = null;
let horizontalScrollTrigger = null;

export function setupScrollCamera({ stars, planets = [], geometries = [], nebula } = {}) {
  const camera = getCamera();
  if (!camera) return () => {};

  const ctx = gsap.context(() => {
    // 1. Master Section-Synchronized Camera Choreography Timeline
    // Hero -> Nebula Discovery
    gsap.timeline({
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    }).fromTo(
      camera.position,
      { x: 0, y: 0, z: 80 },
      { x: 0, y: 2, z: -100, ease: 'power1.inOut' }
    );

    // Nebula Discovery: Dive into nebula center
    gsap.timeline({
      scrollTrigger: {
        trigger: '#nebula-discovery',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.2,
      },
    }).to(camera.position, {
      x: 0,
      y: 0,
      z: -260,
      ease: 'power2.inOut',
    });

    // Horizontal Planets Showcase: Camera navigates from Planet 1 -> Planet 2 -> Planet 3
    const planetsSection = document.querySelector('#planets-showcase');
    const planetsTrack = document.querySelector('.planets-track');
    const planetCards = document.querySelectorAll('.planet-card');

    if (planetsSection && planetsTrack && planetCards.length > 0) {
      const cardCount = planetCards.length;
      const totalPercent = (cardCount - 1) * 100;

      // Pin the section and animate horizontal track + camera positions simultaneously!
      const planetTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#planets-showcase',
          start: 'top top',
          end: '+=3500',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          snap: {
            snapTo: 1 / (cardCount - 1),
            duration: { min: 0.2, max: 0.5 },
            delay: 0.1,
            ease: 'power2.out',
          },
        },
      });

      // Track horizontal movement
      planetTl.to(planetsTrack, {
        xPercent: -totalPercent,
        ease: 'none',
      }, 0);

      // Synchronized camera swoop through the 3 planets:
      // Start near Meridian (z = -350) -> Azurea (z = -550) -> Vesperion (z = -750)
      planetTl.fromTo(
        camera.position,
        { x: -14, y: 3, z: -310 },
        { x: 16, y: -2, z: -500, ease: 'power1.inOut' },
        0
      ).to(
        camera.position,
        { x: -18, y: 5, z: -690, ease: 'power1.inOut' },
        0.5
      );
    }

    // Capabilities / Tech Lab: Camera moves through floating crystalline geometries
    if (document.querySelector('#capabilities')) {
      gsap.timeline({
        scrollTrigger: {
          trigger: '#capabilities',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      }).to(camera.position, {
        x: 0,
        y: 4,
        z: -840,
        ease: 'power2.inOut',
      });
    }

    // Telemetry Stats: Camera in dense starfield
    if (document.querySelector('#stats-counter')) {
      gsap.timeline({
        scrollTrigger: {
          trigger: '#stats-counter',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      }).to(camera.position, {
        x: 4,
        y: -3,
        z: -960,
        ease: 'power1.inOut',
      });
    }

    // Gallery / Deep Space Archive: Serene observatory vantage
    if (document.querySelector('#gallery')) {
      gsap.timeline({
        scrollTrigger: {
          trigger: '#gallery',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      }).to(camera.position, {
        x: 0,
        y: 0,
        z: -1080,
        ease: 'power2.inOut',
      });
    }

    // Pricing / Mission Control & Footer
    if (document.querySelector('#pricing')) {
      gsap.timeline({
        scrollTrigger: {
          trigger: '#pricing',
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: 1.2,
        },
      }).to(camera.position, {
        x: 0,
        y: -4,
        z: -1200,
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
        scrub: 0.5,
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
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          delay: (i % 3) * 0.15,
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
        { opacity: 0, y: 40, scale: 0.92 },
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
        { opacity: 0, y: 50, scale: 0.92 },
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
