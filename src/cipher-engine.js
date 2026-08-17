/**
 * COSMOS.AI Matrix Telemetry Cryptographic Cipher Engine
 * High-performance, subtle & ultra-smooth numeric telemetry text decryption
 */

const CIPHER_GLYPHS = '0123456789ABCDEF';

/**
 * Smoothly decrypts an HTML element's text content with subtle matrix glyph transitions
 * @param {HTMLElement} element - Target DOM element
 * @param {string} [finalText] - Target text to resolve to
 * @param {object} [options] - Configuration options
 */
export function decryptText(element, finalText = null, options = {}) {
  if (!element) return;

  const text = finalText || element.dataset.originalText || element.textContent.trim();
  if (!element.dataset.originalText) {
    element.dataset.originalText = text;
  }

  if (element._cipherAnimId) {
    cancelAnimationFrame(element._cipherAnimId);
  }

  const duration = options.duration || 320; // Silky fast 320ms
  const speed = options.speed || 30;
  const length = text.length;
  const startTime = performance.now();
  let lastGlyphTime = 0;

  function frame(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(1, elapsed / duration);
    
    // Smooth quadratic ease-out resolution
    const easeProgress = 1 - Math.pow(1 - progress, 2);
    const resolvedChars = Math.floor(easeProgress * length);

    if (currentTime - lastGlyphTime > speed || progress >= 1) {
      lastGlyphTime = currentTime;
      
      let output = '';
      for (let i = 0; i < length; i++) {
        const targetChar = text[i];
        
        if (targetChar === ' ' || targetChar === '\n' || targetChar === '%' || targetChar === '°' || targetChar === '/') {
          output += targetChar;
        } else if (i < resolvedChars) {
          output += targetChar;
        } else {
          const randomGlyph = CIPHER_GLYPHS[Math.floor(Math.random() * CIPHER_GLYPHS.length)];
          output += randomGlyph;
        }
      }

      element.textContent = output;
    }

    if (progress < 1) {
      element._cipherAnimId = requestAnimationFrame(frame);
    } else {
      element.textContent = text;
      element._cipherAnimId = null;
      if (options.onComplete) options.onComplete();
    }
  }

  element._cipherAnimId = requestAnimationFrame(frame);
}

/**
 * Initializes selective, subtle telemetry cipher effects (excluding hero & headers)
 */
export function initCipherEngine() {
  // Only target pure technical metric numbers and formulas (EXCLUDING hero and main titles to prevent any sense of glitch)
  const cipherSelectors = [
    '.stat-number',
    '.stream-val',
    '.scan-status-line strong',
    '.hud-reading',
    '#hud-warp-speed'
  ];

  const targets = document.querySelectorAll(cipherSelectors.join(', '));
  targets.forEach(el => {
    if (!el.dataset.originalText) {
      el.dataset.originalText = el.textContent.trim();
    }

    // Interactive Hover Decrypt Trigger
    el.addEventListener('mouseenter', () => {
      decryptText(el, null, { duration: 280, speed: 25 });
    }, { passive: true });
  });

  // Trigger smooth decryption once when scrolling into view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.hasDecrypted) {
        entry.target.dataset.hasDecrypted = 'true';
        decryptText(entry.target, null, { duration: 350, speed: 30 });
      }
    });
  }, {
    rootMargin: '0px 0px -15% 0px',
    threshold: 0.15
  });

  targets.forEach(el => observer.observe(el));
}
