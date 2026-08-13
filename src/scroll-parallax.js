import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getCamera } from './scene.js';

gsap.registerPlugin(ScrollTrigger);

export function setupScrollCamera({ stars, planets, geometries } = {}) {
  const camera = getCamera();
  let rafId = null;

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
        const phase = i * 1.3;
        geo.position.y += Math.sin(p * Math.PI * 4 + phase) * 0.4;
      });
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  return () => window.removeEventListener('scroll', onScroll);
}

export function setupScrollTriggers() {
  const ctx = gsap.context(() => {
    gsap.timeline({
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    })
      .fromTo('#hero h1', { opacity: 0 }, { opacity: 1, duration: 1 }, 0)
      .fromTo('#hero .subtitle', { xPercent: 100 }, { xPercent: 0, duration: 1 }, 0);

    gsap.timeline({
      scrollTrigger: {
        trigger: '#nebula-discovery',
        start: 'top center',
        end: '+=2000',
        pin: true,
        scrub: 1,
      },
    })
      .fromTo('#nebula-discovery h2', { opacity: 0, xPercent: -100 }, { opacity: 1, xPercent: 0, duration: 1 }, 0)
      .fromTo('#nebula-discovery .nebula-text', { opacity: 0, xPercent: -100 }, { opacity: 1, xPercent: 0, duration: 1 }, 0.2);

    gsap.utils.toArray('#stats-counter .stat-card').forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, yPercent: 100 },
        {
          opacity: 1,
          yPercent: 0,
          duration: 0.8,
          delay: i * 0.15,
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
          duration: 1,
          delay: i * 0.1,
          ease: 'power2.out',
          scrollTrigger: { trigger: item, start: 'top 85%', toggleActions: 'play none none reverse' },
        }
      );
    });

    const footerTl = gsap.timeline({
      scrollTrigger: { trigger: '#footer', start: 'top 90%', toggleActions: 'play none none reverse' },
    });
    footerTl.fromTo('#footer .cta-button',
      { scale: 1 },
      { scale: 1.05, repeat: -1, yoyo: true, duration: 1.5, ease: 'sine.inOut' }, 0
    ).fromTo('#footer .footer-links a',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: 0.1, duration: 0.6 }, 0.2
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

  const tl = gsap.to(track, {
    xPercent: -66.6,
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: '+=3000',
      pin: true,
      scrub: 1,
      markers: false,
      snap: {
        snapTo: 1 / (cards.length - 1),
        duration: { min: 0.3, max: 0.6 },
        delay: 0.1,
        ease: 'power2.out',
      },
      onLeave: () => ScrollTrigger.refresh(),
    },
  });

  return () => {
    tl.scrollTrigger?.kill();
    tl.kill();
  };
}