import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getCamera } from './scene.js';

gsap.registerPlugin(ScrollTrigger);

const geometryBasePosition = new Map();

export function setupScrollCamera({ stars, planets, geometries } = {}) {
  const camera = getCamera();
  let rafId = null;

  geometries?.forEach((geo) => {
    geometryBasePosition.set(geo.uuid, {
      x: geo.position.x,
      y: geo.position.y,
      z: geo.position.z,
    });
  });

  function onScroll() {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0
        ? Math.min(Math.max(window.scrollY / maxScroll, 0), 1)
        : 0;
      applyParallax(progress);
    });
  }

  function applyParallax(p) {
    camera.position.z = -p * 200 + 50;
    camera.lookAt(0, 0, 0);

    if (stars) {
      stars.position.z = -p * 40;
    }

    if (planets?.length) {
      planets.forEach((planet, i) => {
        const depth = Math.abs(planet.position.z);
        const strength = (depth / 800) * 12;
        planet.position.x = Math.sin(p * Math.PI * 2 + i) * strength;
      });
    }

    if (geometries?.length) {
      geometries.forEach((geo, i) => {
        const base = geometryBasePosition.get(geo.uuid);
        if (!base) return;
        const phase = i * 1.3;
        geo.position.y = base.y + Math.sin(p * Math.PI * 4 + phase) * 0.4;
        geo.position.x = base.x + Math.cos(p * Math.PI * 3 + phase) * 0.2;
      });
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  return () => {
    window.removeEventListener('scroll', onScroll);
    geometryBasePosition.clear();
  };
}

export function setupScrollTriggers() {
  const ctx = gsap.context(() => {
    const heroTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    });
    heroTl
      .fromTo('#hero h1', { opacity: 0 }, { opacity: 1, duration: 1 }, 0)
      .fromTo('#hero .subtitle', { xPercent: 100, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 1 }, 0);

    gsap.timeline({
      scrollTrigger: {
        trigger: '#nebula-discovery',
        start: 'top center',
        end: '+=2000',
        pin: true,
        scrub: 1,
      },
    })
      .fromTo('#nebula-discovery h2', { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 1 }, 0)
      .fromTo('#nebula-discovery .nebula-text', { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 1 }, 0.2);

    gsap.utils.toArray('#stats-counter .stat-card').forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 40, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          delay: i * 0.15,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none reverse' },
        }
      );
    });

    gsap.utils.toArray('#gallery .gallery-item').forEach((item, i) => {
      gsap.fromTo(item,
        { clipPath: 'circle(0% at 50% 50%)', opacity: 0 },
        {
          clipPath: 'circle(150% at 50% 50%)',
          opacity: 1,
          duration: 0.8,
          delay: i * 0.1,
          ease: 'power2.out',
          scrollTrigger: { trigger: item, start: 'top 85%', toggleActions: 'play none none reverse' },
        }
      );
    });

    const footerTl = gsap.timeline({
      scrollTrigger: { trigger: '#footer', start: 'top 85%', toggleActions: 'play none none reverse' },
    });
    footerTl.fromTo('#footer .cta-button',
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.8, ease: 'power3.out' }, 0
    ).fromTo('#footer .footer-links a',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out' }, 0.2
    );
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

export function setupHorizontalScroll() {
  const section = document.querySelector('.planets-section');
  if (!section) return () => {};

  const track = section.querySelector('.planets-track');
  if (!track) return () => {};

  const cards = track.querySelectorAll('.planet-card');
  if (!cards.length) return () => {};

  const cardCount = cards.length;
  const totalPercent = (cardCount - 1) * 100;

  const tl = gsap.to(track, {
    xPercent: -totalPercent,
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: '+=4000',
      pin: true,
      scrub: 1,
      snap: {
        snapTo: 1 / (cardCount - 1),
        duration: { min: 0.3, max: 0.6 },
        delay: 0.1,
        ease: 'power2.out',
      },
    },
  });

  return () => {
    tl.scrollTrigger?.kill();
    tl.kill();
  };
}
