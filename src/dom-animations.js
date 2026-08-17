import { animate, stagger } from 'animejs';
import { playBeep, toggleAudio, getAudioState, playSound } from './audio.js';
import { showToast } from './toast.js';
import { openTerminal, initTerminal } from './terminal.js';
import { getLenis, PLANET_DATA } from './scroll-parallax.js';
import { getCanvasEngine } from './canvas-engine.js';
import { initCipherEngine, decryptText } from './cipher-engine.js';

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

export function setupDOMAnimations() {
  setupCyberCursor();
  initCipherEngine();
  setupHeroLetters();
  setupNavbarAndControls();
  setupCardSpotlightSheen();
  setupStatCounters();
  setupLiveTelemetrySparkline();
  setupGallery();
  setupPricing();
  setupCheckoutModal();
  setupNewsletter();
  setup3DCardTilt();
  initTerminal({
    toggleWarpDrive: (val) => {},
    isWarpActive: () => false,
    setWarpDrive: (val) => {
      updateWarpButtonUI(val);
    },
    setNebulaColor: (preset) => {},
  });
}

function setupCyberCursor() {
  const cursor = document.getElementById('cyber-cursor');
  if (!cursor) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  let isVisible = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isVisible) {
      isVisible = true;
      cursor.style.opacity = '1';
    }
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    isVisible = false;
    cursor.style.opacity = '0';
  });

  window.addEventListener('mousedown', () => {
    cursor.classList.add('clicking');
  });

  window.addEventListener('mouseup', () => {
    cursor.classList.remove('clicking');
  });

  // Interactive Target Locking
  const interactiveSelector = 'a, button, .card, .planet-select-card, input, select, .trail-step, .tesseract-cube';
  document.querySelectorAll(interactiveSelector).forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hovering');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hovering');
    });
  });

  function renderCursor() {
    cursorX += (mouseX - cursorX) * 0.22;
    cursorY += (mouseY - cursorY) * 0.22;
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);
}

function setupCardSpotlightSheen() {
  const cards = document.querySelectorAll('.card, .capability-card, .stat-card, .pricing-card, .stream-panel');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    }, { passive: true });
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
      translateY: [35, 0],
      delay: stagger(30, { start: 150 }),
      duration: 800,
      easing: 'outCubic',
    });
  }

  const badge = document.querySelector('#hero .hero-badge');
  if (badge) {
    animate(badge, {
      opacity: [0, 1],
      scale: [0.92, 1],
      duration: 700,
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
    let isWarpActive = false;
    warpBtn.addEventListener('click', () => {
      isWarpActive = !isWarpActive;
      const canvasEngine = getCanvasEngine();
      if (isWarpActive) {
        warpBtn.classList.add('active');
        warpBtn.style.color = '#00ffdc';
        if (canvasEngine) canvasEngine.setScrollVelocity(50);
        playSound('warp');
        showToast('HYPERSPACE PROPULSION ENGAGED: 12.4c', { title: 'Warp Drive', type: 'scan' });
      } else {
        warpBtn.classList.remove('active');
        warpBtn.style.color = '';
        if (canvasEngine) canvasEngine.setScrollVelocity(0);
        playBeep('click');
        showToast('Sub-light cruising restored', { title: 'Warp Drive', type: 'info' });
      }
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

  // Dynamic Sliding Nav Indicator Pill
  const navContainer = document.querySelector('.nav-links');
  const navPill = document.querySelector('.nav-indicator-pill');
  const navLinks = document.querySelectorAll('.nav-links a');

  function updateNavPill(activeLink) {
    if (!activeLink || !navPill || !navContainer) return;
    const linkRect = activeLink.getBoundingClientRect();
    const containerRect = navContainer.getBoundingClientRect();
    const left = linkRect.left - containerRect.left;
    const width = linkRect.width;

    navPill.style.left = `${left}px`;
    navPill.style.width = `${width}px`;
    navPill.style.opacity = '1';
  }

  navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => updateNavPill(link));
  });

  navContainer?.addEventListener('mouseleave', () => {
    const activeLink = document.querySelector('.nav-links a.active');
    if (activeLink) updateNavPill(activeLink);
  });

  // IntersectionObserver for High-Performance ScrollSpy
  const sections = document.querySelectorAll('section[id], footer[id]');

  const scrollSpyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
              updateNavPill(link);
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    },
    { rootMargin: '-25% 0px -35% 0px', threshold: 0 }
  );

  sections.forEach((s) => scrollSpyObserver.observe(s));

  // Initial pill position
  const initialActive = document.querySelector('.nav-links a.active');
  if (initialActive) setTimeout(() => updateNavPill(initialActive), 150);

  // Cinematic Warp-Jump Navigation with Lenis
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      e.preventDefault();
      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      const canvasEngine = getCanvasEngine();
      if (canvasEngine) {
        // Hyperspace speed impulse
        canvasEngine.setScrollVelocity(45);
        setTimeout(() => canvasEngine.setScrollVelocity(0), 900);
      }

      playSound('warp');

      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(targetEl, {
          duration: 1.3,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          onComplete: () => {
            playBeep('activate');
          }
        });
      } else {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Button Click Feedback Sounds
  document.querySelectorAll('button, .nav-links a, .footer-links a').forEach(el => {
    el.addEventListener('mouseenter', () => playBeep('hover'), { passive: true });
    el.addEventListener('click', () => playBeep('click'));
  });
}

function setupNebulaControls() {
  const chips = document.querySelectorAll('.nebula-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const preset = chip.dataset.preset || 'violet';
      const canvasEngine = getCanvasEngine();

      if (preset === 'violet') {
        if (canvasEngine) canvasEngine.setAmbientChapter(28, 12, 45);
      } else if (preset === 'emerald') {
        if (canvasEngine) canvasEngine.setAmbientChapter(8, 35, 25);
      } else if (preset === 'cyan') {
        if (canvasEngine) canvasEngine.setAmbientChapter(6, 30, 48);
      } else if (preset === 'gold') {
        if (canvasEngine) canvasEngine.setAmbientChapter(42, 28, 8);
      }

      playBeep('activate');
      showToast(`Nebula quantum resonance tuned to: ${preset.toUpperCase()}`, { title: 'Spectroscopy Matrix', type: 'info' });
    });
  });
}

function setupPlanetCardInteractions() {
  const mainScanBtn = document.getElementById('main-planet-scan-btn');
  const scanModal = document.getElementById('planet-scan-modal');
  const modalClose = scanModal?.querySelector('.modal-close');
  const modalCloseBtn = scanModal?.querySelector('.modal-close-btn');

  function openScanModal(planetKey = 'azurea') {
    const data = PLANET_DATA[planetKey] || PLANET_DATA.azurea;
    
    // Update Modal Data
    const nameEl = document.getElementById('scan-modal-planet-name');
    const crustEl = document.getElementById('scan-res-crust');
    const presEl = document.getElementById('scan-res-pres');
    const atmoEl = document.getElementById('scan-res-atmo');
    const habEl = document.getElementById('scan-res-hab');
    const spherePreview = document.getElementById('scan-sphere-preview');

    if (nameEl) nameEl.textContent = `${data.name} — Surface Scan`;
    if (crustEl) crustEl.textContent = data.crust;
    if (presEl) presEl.textContent = data.pressure;
    if (atmoEl) atmoEl.textContent = data.atmosphereDepth;
    if (habEl) habEl.textContent = data.habitability;
    if (spherePreview) {
      spherePreview.className = `scan-sphere-render orb-${planetKey}`;
    }

    if (scanModal) {
      scanModal.classList.add('active');
      playSound('warp');
      showToast(`High-resolution LiDAR radar locked onto ${data.name}`, { title: 'Spectra Radar', type: 'scan' });
    }
  }

  if (mainScanBtn) {
    mainScanBtn.addEventListener('click', () => {
      const activeCard = document.querySelector('.planet-select-card.active');
      const planetKey = activeCard?.getAttribute('data-target-planet') || 'azurea';
      openScanModal(planetKey);
    });
  }

  [modalClose, modalCloseBtn].forEach(btn => {
    btn?.addEventListener('click', () => {
      scanModal?.classList.remove('active');
      playBeep('click');
    });
  });

  scanModal?.addEventListener('click', (e) => {
    if (e.target === scanModal) {
      scanModal.classList.remove('active');
    }
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
          duration: 1800,
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

// Zero-reflow lightweight telemetry sparkline
function setupLiveTelemetrySparkline() {
  const canvas = document.getElementById('telemetry-sparkline');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const points = new Array(30).fill(50);
  let canvasW = 600;
  let canvasH = 70;

  function resizeCanvas() {
    canvasW = canvas.width = canvas.offsetWidth || 600;
    canvasH = canvas.height = canvas.offsetHeight || 70;
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  const coordEl = document.getElementById('live-quantum-ping');

  function draw() {
    const last = points[points.length - 1];
    const next = Math.max(15, Math.min(85, last + (Math.random() - 0.49) * 14));
    points.shift();
    points.push(next);

    ctx.clearRect(0, 0, canvasW, canvasH);

    // Gradient stroke
    const grad = ctx.createLinearGradient(0, 0, canvasW, 0);
    grad.addColorStop(0, 'rgba(0, 255, 220, 0.2)');
    grad.addColorStop(1, 'rgba(157, 78, 221, 1)');

    ctx.beginPath();
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.5;

    const step = canvasW / (points.length - 1);
    points.forEach((p, i) => {
      const x = i * step;
      const y = canvasH - (p / 100) * canvasH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Pulse dot at current point
    const currentY = canvasH - (next / 100) * canvasH;
    ctx.beginPath();
    ctx.fillStyle = '#00ffdc';
    ctx.arc(canvasW - 3, currentY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    if (coordEl) {
      coordEl.textContent = `${(next * 12.4).toFixed(1)} GHz`;
    }

    setTimeout(draw, 120);
  }

  draw();
}

function setupGallery() {
  const grid = document.querySelector('.gallery-grid');
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const searchInput = document.getElementById('gallery-search-input');
  const lightboxModal = document.getElementById('lightbox-modal');

  if (!grid) return;

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

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.category || 'all';
      filterGallery(cat, searchInput?.value || '');
      playBeep('click');
    });
  });

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

// Ultra-performant 3D Card Tilt with cached rects (Zero synchronous layout reflows)
function setup3DCardTilt() {
  const cards = document.querySelectorAll('.card, .capability-card, .pricing-card, .stat-card');

  cards.forEach(card => {
    let rect = null;

    card.addEventListener('mouseenter', () => {
      rect = card.getBoundingClientRect();
    }, { passive: true });

    card.addEventListener('mousemove', (e) => {
      if (!rect) rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const rotX = -(y / (rect.height / 2)) * 5;
      const rotY = (x / (rect.width / 2)) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      rect = null;
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
    }, { passive: true });
  });
}
