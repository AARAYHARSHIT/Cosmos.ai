import { animate, stagger } from 'animejs';
import { playBeep, toggleAudio, getAudioState } from './audio.js';
import { setWarpMode, getWarpState } from './scene.js';
import { showToast } from './toast.js';
import { openTerminal, initTerminal } from './terminal.js';

// Gallery dataset with astronomical parameters
export const GALLERY_DATA = [
  {
    id: 'carina',
    title: 'Carina Interstellar Nebula',
    category: 'nebula',
    image: '/assets/gallery/carina_nebula.jpg',
    distance: '7,500 light-years',
    constellation: 'Carina',
    type: 'Diffuse Ionized Gas Cloud',
    magnitude: '+1.0',
    description: 'A colossal stellar nursery containing dynamic pillars of ionized hydrogen, gas, and dark dust where massive infant stars ignite.',
    coordinates: 'RA 10h 45m 08s | Dec -59° 52′ 04″',
  },
  {
    id: 'andromeda',
    title: 'Andromeda Spiral Galaxy (M31)',
    category: 'galaxy',
    image: '/assets/gallery/andromeda_galaxy.jpg',
    distance: '2.537 million light-years',
    constellation: 'Andromeda',
    type: 'Barred Spiral Galaxy',
    magnitude: '+3.44',
    description: 'The nearest major galactic neighbor to the Milky Way, containing over one trillion stars arranged in majestic swirling stellar arms.',
    coordinates: 'RA 00h 42m 44s | Dec +41° 16′ 09″',
  },
  {
    id: 'supernova',
    title: 'Supernova Shockwave Remnant',
    category: 'phenomena',
    image: '/assets/gallery/supernova_remnant.jpg',
    distance: '11,000 light-years',
    constellation: 'Cassiopeia',
    type: 'Supernova Remnant (Type II)',
    magnitude: '+6.8',
    description: 'Expanding supersonic shockwave filaments glowing in electric cyan and purple x-ray emissions following a cataclysmic stellar explosion.',
    coordinates: 'RA 23h 23m 24s | Dec +58° 48′ 54″',
  },
  {
    id: 'kepler',
    title: 'Kepler-186f Habitable Exoplanet',
    category: 'exoplanet',
    image: '/assets/gallery/kepler_exoplanet.jpg',
    distance: '582 light-years',
    constellation: 'Cygnus',
    type: 'Earth-size Goldilocks Planet',
    magnitude: '+14.6',
    description: 'An Earth-sized world orbiting in the habitable zone of an M-dwarf star, with atmospheric nitrogen-water vapor and bioluminescent oceans.',
    coordinates: 'RA 19h 54m 36s | Dec +43° 57′ 18″',
  },
  {
    id: 'pulsar',
    title: 'Relativistic Pulsar Magnetar',
    category: 'phenomena',
    image: '/assets/gallery/pulsar_core.jpg',
    distance: '10,000 light-years',
    constellation: 'Sagittarius',
    type: 'Ultra-dense Neutron Star',
    magnitude: '+16.2',
    description: 'A rapidly spinning neutron star spinning at 716 rotations/sec, shooting relativistic particle beams along hyper-strong magnetic poles.',
    coordinates: 'RA 17h 48m 05s | Dec -24° 46′ 47″',
  },
  {
    id: 'blackhole',
    title: 'Messier 87 Singularity Event Horizon',
    category: 'galaxy',
    image: '/assets/gallery/black_hole_singularity.jpg',
    distance: '53.5 million light-years',
    constellation: 'Virgo',
    type: 'Supermassive Black Hole (6.5B M☉)',
    magnitude: '+8.6',
    description: 'Direct optical capture of gravitational photon ring lensing surrounding a 6.5 billion solar mass event horizon.',
    coordinates: 'RA 12h 30m 49s | Dec +12° 23′ 28″',
  },
  {
    id: 'nursery',
    title: 'Pillars of Creation (Eagle Nebula)',
    category: 'nebula',
    image: '/assets/gallery/stellar_nursery.jpg',
    distance: '7,000 light-years',
    constellation: 'Serpens',
    type: 'Photoevaporating Gas Pillars',
    magnitude: '+6.0',
    description: 'Iconic elephant trunks of interstellar gas and dust sculpting newly formed proto-stars under extreme ultraviolet stellar winds.',
    coordinates: 'RA 18h 18m 48s | Dec -13° 49′ 00″',
  },
  {
    id: 'solar',
    title: 'Extreme Stellar Corona Flare',
    category: 'phenomena',
    image: '/assets/gallery/solar_corona.jpg',
    distance: '1 Astronomical Unit',
    constellation: 'Solar System',
    type: 'Magnetic Reconnection Eruption',
    magnitude: '-26.74',
    description: 'High-energy coronal mass ejection looping along twisted magnetic flux tubes at temperatures exceeding 10 million Kelvin.',
    coordinates: 'RA 00h 00m 00s | Dec +00° 00′ 00″',
  },
];

export function setupDOMAnimations({ planets = [], geometries = [], nebula } = {}) {
  setupHeroLetters();
  setupNavbarAndControls();
  setupNebulaControls(nebula);
  setupPlanetCardInteractions(planets);
  setupStatCounters();
  setupLiveTelemetrySparkline();
  setupGallery();
  setupPricing();
  setupCheckoutModal();
  setupNewsletter();
  setup3DCardTilt();
  initTerminal({
    toggleWarpDrive: (val) => setWarpMode(val),
    isWarpActive: () => getWarpState(),
    setWarpDrive: (val) => {
      setWarpMode(val);
      updateWarpButtonUI(val);
    },
    setNebulaColor: (preset) => nebula?.userData?.setPreset?.(preset),
  });
}

function setupHeroLetters() {
  const h1 = document.querySelector('#hero h1');
  if (!h1 || h1.dataset.splitDone) return;

  const text = h1.textContent.trim();
  h1.innerHTML = text.split('').map(char =>
    char === ' '
      ? '<span class="letter">&nbsp;</span>'
      : `<span class="letter">${char}</span>`
  ).join('');
  h1.dataset.splitDone = 'true';

  const letters = h1.querySelectorAll('.letter');
  if (letters.length) {
    animate(letters, {
      opacity: [0, 1],
      translateY: [40, 0],
      delay: stagger(35, { start: 200 }),
      duration: 900,
      easing: 'outCubic',
    });
  }

  const badge = document.querySelector('#hero .hero-badge');
  if (badge) {
    animate(badge, {
      opacity: [0, 1],
      scale: [0.9, 1],
      duration: 800,
      easing: 'outBack',
    });
  }
}

function updateWarpButtonUI(isActive) {
  const warpBtn = document.getElementById('warp-toggle-btn');
  if (warpBtn) {
    if (isActive) {
      warpBtn.classList.add('active');
      warpBtn.innerHTML = '<span class="btn-icon">⚡</span><span>Warp 9.9 Active</span>';
    } else {
      warpBtn.classList.remove('active');
      warpBtn.innerHTML = '<span class="btn-icon">⚡</span><span>Engage Warp</span>';
    }
  }
}

function setupNavbarAndControls() {
  // Warp Drive Toggle
  const warpBtn = document.getElementById('warp-toggle-btn');
  if (warpBtn) {
    warpBtn.addEventListener('click', () => {
      const nextState = !getWarpState();
      setWarpMode(nextState);
      updateWarpButtonUI(nextState);
      showToast(nextState ? 'Hyperspace propulsion engaged (Warp 9.9)' : 'Sublight cruise mode resumed', {
        title: 'Propulsion Telemetry',
        type: 'warp',
      });
    });
  }

  // Audio Toggle
  const audioBtn = document.getElementById('audio-toggle-btn');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      const isEnabled = toggleAudio();
      if (isEnabled) {
        audioBtn.classList.add('active');
        audioBtn.innerHTML = '<span class="btn-icon">🔊</span><span>Audio ON</span>';
        showToast('Deep space procedural harmonic synthesizer activated', { title: 'Acoustic Synthesizer', type: 'success' });
      } else {
        audioBtn.classList.remove('active');
        audioBtn.innerHTML = '<span class="btn-icon">🔇</span><span>Audio Muted</span>';
        showToast('Acoustic synthesizer muted', { title: 'Acoustic Synthesizer', type: 'info' });
      }
    });
  }

  // Terminal Console Button
  const terminalBtns = document.querySelectorAll('.open-terminal-btn');
  terminalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      openTerminal();
    });
  });

  // ScrollSpy Active Link Tracking
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  function updateScrollSpy() {
    let currentId = '';
    const scrollPos = window.scrollY + window.innerHeight * 0.35;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateScrollSpy, { passive: true });
  updateScrollSpy();

  // Button Click Feedback Sounds
  document.querySelectorAll('button, .nav-links a, .footer-links a').forEach(el => {
    el.addEventListener('mouseenter', () => playBeep('hover'));
    el.addEventListener('click', () => playBeep('click'));
  });
}

function setupNebulaControls(nebula) {
  const chips = document.querySelectorAll('.nebula-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const preset = chip.dataset.preset || 'violet';
      if (nebula?.userData?.setPreset) {
        nebula.userData.setPreset(preset);
      }
      playBeep('activate');
      showToast(`Nebula quantum resonance tuned to: ${preset.toUpperCase()}`, { title: 'Spectroscopy Matrix', type: 'info' });
    });
  });
}

function setupPlanetCardInteractions(planets) {
  const scanButtons = document.querySelectorAll('.planet-scan-btn');
  scanButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetPlanet = btn.dataset.planet || 'azurea';
      playBeep('activate');
      showToast(`Full multispectral scan initiated on ${targetPlanet.toUpperCase()}`, { title: 'Planetary Radar', type: 'scan' });

      btn.textContent = 'Scanning...';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = 'Scan Complete ✓';
        setTimeout(() => {
          btn.textContent = 'Perform Surface Scan';
          btn.disabled = false;
        }, 2000);
      }, 1000);
    });
  });
}

function setupStatCounters() {
  const counters = document.querySelectorAll('.stat-number');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = 'true';
        const target = parseInt(entry.target.dataset.target || '0', 10);
        const state = { val: 0 };

        animate(state, {
          val: target,
          duration: 2200,
          easing: 'outExpo',
          onUpdate: () => {
            entry.target.textContent = Math.round(state.val).toLocaleString();
          },
        });
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(c => observer.observe(c));
}

function setupLiveTelemetrySparkline() {
  const canvas = document.getElementById('telemetry-sparkline');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const points = new Array(30).fill(50);

  function draw() {
    // Add new random jitter
    const last = points[points.length - 1];
    const next = Math.max(15, Math.min(85, last + (Math.random() - 0.49) * 15));
    points.shift();
    points.push(next);

    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, w, h);

    // Gradient stroke
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, 'rgba(0, 255, 220, 0.2)');
    grad.addColorStop(1, 'rgba(157, 78, 221, 1)');

    ctx.beginPath();
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.5;

    const step = w / (points.length - 1);
    points.forEach((p, i) => {
      const x = i * step;
      const y = h - (p / 100) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Pulse dot at current point
    const currentY = h - (next / 100) * h;
    ctx.beginPath();
    ctx.fillStyle = '#00ffdc';
    ctx.arc(w - 2, currentY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Update coordinate text
    const coordEl = document.getElementById('live-quantum-ping');
    if (coordEl) {
      coordEl.textContent = `${(next * 12.4).toFixed(1)} GHz`;
    }

    setTimeout(draw, 100);
  }

  draw();
}

function setupGallery() {
  const grid = document.querySelector('.gallery-grid');
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const searchInput = document.getElementById('gallery-search-input');
  const lightboxModal = document.getElementById('lightbox-modal');

  if (!grid) return;

  // Render gallery cards dynamically from local dataset
  function renderGallery(items) {
    grid.innerHTML = '';

    if (items.length === 0) {
      grid.innerHTML = `
        <div class="gallery-empty">
          <div class="empty-icon">🔭</div>
          <p>No astronomical objects found matching your query.</p>
        </div>
      `;
      return;
    }

    items.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'gallery-item';
      card.dataset.id = item.id;
      card.dataset.category = item.category;

      card.innerHTML = `
        <div class="gallery-img-wrapper">
          <div class="gallery-skeleton"></div>
          <img src="${item.image}" alt="${item.title}" loading="lazy" decoding="async"
               onload="this.classList.add('loaded'); this.previousElementSibling.style.display='none';"
               onerror="this.style.display='none';" />
          <div class="gallery-overlay">
            <div class="gallery-badge">${item.category.toUpperCase()}</div>
            <h3 class="gallery-title">${item.title}</h3>
            <div class="gallery-meta">
              <span>📍 ${item.distance}</span>
              <span>✨ Mag ${item.magnitude}</span>
            </div>
            <button class="gallery-inspect-btn" type="button">Inspect High-Res 🔍</button>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        openLightbox(item);
      });

      grid.appendChild(card);
    });
  }

  renderGallery(GALLERY_DATA);

  // Category Filters
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.category || 'all';
      filterGallery(cat, searchInput?.value || '');
      playBeep('click');
    });
  });

  // Search Input Filter
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const activeBtn = document.querySelector('.gallery-filter-btn.active');
      const cat = activeBtn?.dataset.category || 'all';
      filterGallery(cat, searchInput.value);
    });
  }

  function filterGallery(category, query) {
    const q = query.toLowerCase().trim();
    const filtered = GALLERY_DATA.filter(item => {
      const matchesCat = category === 'all' || item.category === category;
      const matchesQuery = !q || item.title.toLowerCase().includes(q) ||
                           item.constellation.toLowerCase().includes(q) ||
                           item.description.toLowerCase().includes(q) ||
                           item.type.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
    renderGallery(filtered);
  }

  // Lightbox Modal Wiring
  function openLightbox(item) {
    if (!lightboxModal) return;

    const img = lightboxModal.querySelector('.lightbox-image');
    const title = lightboxModal.querySelector('.lightbox-title');
    const category = lightboxModal.querySelector('.lightbox-category');
    const desc = lightboxModal.querySelector('.lightbox-desc');
    const distance = lightboxModal.querySelector('.lb-distance');
    const constellation = lightboxModal.querySelector('.lb-constellation');
    const type = lightboxModal.querySelector('.lb-type');
    const coords = lightboxModal.querySelector('.lb-coords');
    const copyCoordsBtn = lightboxModal.querySelector('.lb-copy-coords-btn');

    if (img) img.src = item.image;
    if (title) title.textContent = item.title;
    if (category) category.textContent = item.category.toUpperCase();
    if (desc) desc.textContent = item.description;
    if (distance) distance.textContent = item.distance;
    if (constellation) constellation.textContent = item.constellation;
    if (type) type.textContent = item.type;
    if (coords) coords.textContent = item.coordinates;

    if (copyCoordsBtn) {
      copyCoordsBtn.onclick = () => {
        navigator.clipboard.writeText(item.coordinates).then(() => {
          showToast(`Coordinates copied to clipboard: ${item.coordinates}`, { title: 'Telemetry Clipboard', type: 'success' });
        });
      };
    }

    lightboxModal.classList.add('active');
    playBeep('activate');
  }

  const closeLb = lightboxModal?.querySelector('.modal-close');
  if (closeLb) {
    closeLb.addEventListener('click', () => {
      lightboxModal.classList.remove('active');
      playBeep('click');
    });
  }

  lightboxModal?.addEventListener('click', (e) => {
    if (e.target === lightboxModal) {
      lightboxModal.classList.remove('active');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal?.classList.contains('active')) {
      lightboxModal.classList.remove('active');
    }
  });
}

function setupPricing() {
  const billingToggle = document.getElementById('billing-toggle');
  const priceValues = document.querySelectorAll('.price-val');
  const periodLabels = document.querySelectorAll('.price-period');

  if (billingToggle) {
    billingToggle.addEventListener('change', () => {
      const isAnnual = billingToggle.checked;
      playBeep('click');

      priceValues.forEach(el => {
        const monthly = el.dataset.monthly;
        const annual = el.dataset.annual;
        el.textContent = isAnnual ? annual : monthly;
      });

      periodLabels.forEach(el => {
        el.textContent = isAnnual ? '/mo, billed annually' : '/month';
      });

      showToast(isAnnual ? 'Annual billing active: 20% discount applied!' : 'Monthly billing active', {
        title: 'Subscription Engine',
        type: 'info',
      });
    });
  }
}

function setupCheckoutModal() {
  const checkoutModal = document.getElementById('checkout-modal');
  const planButtons = document.querySelectorAll('.pricing-cta-btn');
  const planNameDisplay = document.getElementById('checkout-plan-name');
  const planPriceDisplay = document.getElementById('checkout-plan-price');
  const form = document.getElementById('checkout-form');
  const closeBtn = checkoutModal?.querySelector('.modal-close');

  planButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.pricing-card');
      const name = card?.querySelector('.plan-name')?.textContent || 'Voyager Pro';
      const price = card?.querySelector('.price-val')?.textContent || '$49';

      if (planNameDisplay) planNameDisplay.textContent = name;
      if (planPriceDisplay) planPriceDisplay.textContent = price;

      if (checkoutModal) {
        checkoutModal.classList.add('active');
        playBeep('activate');
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      checkoutModal?.classList.remove('active');
      playBeep('click');
    });
  }

  checkoutModal?.addEventListener('click', (e) => {
    if (e.target === checkoutModal) {
      checkoutModal.classList.remove('active');
    }
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Authorizing Quantum Keys...';

      setTimeout(() => {
        checkoutModal?.classList.remove('active');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirm Deep Space License';
        form.reset();
        showToast('Mission license authorized! Welcome aboard COSMOS.AI', {
          title: 'Subscription Activated',
          type: 'success',
        });
      }, 1200);
    });
  }
}

function setupNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value) {
        showToast(`Telemetry dispatch confirmed for ${input.value}`, {
          title: 'Dispatch Frequency Locked',
          type: 'success',
        });
        input.value = '';
      }
    });
  }
}

function setup3DCardTilt() {
  const cards = document.querySelectorAll('.card, .capability-card, .pricing-card, .stat-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const rotX = -(y / (rect.height / 2)) * 6;
      const rotY = (x / (rect.width / 2)) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
    });
  });
}
