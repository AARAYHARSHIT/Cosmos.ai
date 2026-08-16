import { animate, stagger } from 'animejs';
import 'animejs/adapters/three';

function setupHeroLetters() {
  const h1 = document.querySelector('#hero h1');
  if (!h1 || h1.dataset.splitDone) return null;

  const text = h1.textContent.trim();
  if (!text) return null;

  h1.innerHTML = text.split('').map(char =>
    char === ' '
      ? '<span class="letter">&nbsp;</span>'
      : `<span class="letter">${char}</span>`
  ).join('');
  h1.dataset.splitDone = 'true';

  const letters = h1.querySelectorAll('.letter');
  if (!letters.length) return null;

  animate(letters, {
    opacity: [0, 1],
    translateY: [30, 0],
    delay: stagger(40),
    duration: 800,
    easing: 'outCubic',
  });

  return null;
}

function setupNebulaText() {
  const textEl = document.querySelector('#nebula-discovery .nebula-text');
  if (!textEl) return null;

  const anim = animate(textEl, {
    translateX: [-60, 0],
    opacity: [0, 1],
    duration: 1000,
    delay: 300,
    easing: 'outCubic',
  });

  return () => anim.pause();
}

function setupStatCounters() {
  const counters = document.querySelectorAll('.stat-number');
  if (!counters.length) return null;

  const anims = Array.from(counters).map((el) => {
    const target = parseInt(el.dataset.target || el.textContent.replace(/,/g, ''), 10) || 0;
    const state = { val: 0 };

    return animate(state, {
      val: target,
      duration: 2000,
      easing: 'outCubic',
      round: 1,
      onUpdate: () => {
        el.textContent = Math.round(state.val).toLocaleString();
      },
    });
  });

  return () => anims.forEach((a) => a.pause());
}

function setupThreeJSAnimations(planets = [], geometries = []) {
  const anims = [];

  planets.forEach((planet, idx) => {
    anims.push(animate(planet, {
      rotateX: idx % 2 === 0 ? 360 : 0,
      rotateY: 360,
      rotateZ: idx % 3 === 0 ? 180 : 0,
      duration: 20000 + idx * 5000,
      loop: true,
      easing: 'linear',
    }));
  });

  geometries.forEach((shape, idx) => {
    const baseY = shape.position.y;
    const baseX = shape.position.x;
    const deltaY = 10;
    const deltaX = Math.sin(idx) * 5;

    anims.push(animate(shape, {
      y: [baseY, baseY + deltaY],
      x: [baseX, baseX + deltaX],
      duration: 8000 + idx * 2000,
      loop: true,
      direction: 'alternate',
      easing: 'inOutSine',
    }));
  });

  return () => anims.forEach((a) => a.pause());
}

function setupHoverAnimations() {
  const cleanups = [];

  document.querySelectorAll('.gallery-item').forEach((item) => {
    const onEnter = () => {
      animate(item, {
        scale: 1.05,
        filter: 'brightness(1.1)',
        duration: 300,
        easing: 'outCubic',
      });
    };
    const onLeave = () => {
      animate(item, {
        scale: 1,
        filter: 'brightness(1)',
        duration: 300,
        easing: 'outCubic',
      });
    };
    item.addEventListener('mouseenter', onEnter);
    item.addEventListener('mouseleave', onLeave);
    cleanups.push(() => {
      item.removeEventListener('mouseenter', onEnter);
      item.removeEventListener('mouseleave', onLeave);
    });
  });

  const cards = document.querySelectorAll('.card');
  if (cards.length) {
    animate(cards, {
      opacity: [0, 1],
      translateY: [20, 0],
      delay: stagger(80),
      duration: 600,
      easing: 'outCubic',
    });
  }

  document.querySelectorAll('.cta-button').forEach((btn) => {
    const anim = animate(btn, {
      scale: [1, 1.08, 1],
      boxShadow: [
        '0 0 0 0 rgba(0, 255, 220, 0.5)',
        '0 0 25px 8px rgba(0, 255, 200, 0.3)',
        '0 0 0 0 rgba(0, 255, 220, 0.5)',
      ],
      duration: 2500,
      loop: true,
      easing: 'inOutQuad',
    });
    cleanups.push(() => anim.pause());
  });

  return () => cleanups.forEach((fn) => fn());
}

export function setupDOMAnimations(planets = [], geometries = []) {
  const cleanups = [
    setupHeroLetters(),
    setupNebulaText(),
    setupStatCounters(),
    setupThreeJSAnimations(planets, geometries),
    setupHoverAnimations(),
  ].filter(Boolean);

  return () => cleanups.forEach((fn) => fn());
}
