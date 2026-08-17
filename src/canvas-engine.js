/**
 * COSMOS.AI — Native 60FPS Canvas 3D Flight & Warp Starfield Engine
 * Zero WebGL overhead, guaranteed 60fps on all devices.
 * Features 3D depth projected stars, dynamic hyperspace warp streaks,
 * mouse parallax reactivity, and procedural atmospheric dust.
 */

class CanvasFlightEngine {
  constructor(canvasId = 'starfield-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = canvasId;
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100vw';
      this.canvas.style.height = '100vh';
      this.canvas.style.zIndex = '0';
      this.canvas.style.pointerEvents = 'none';
      document.body.prepend(this.canvas);
    }
    this.ctx = this.canvas.getContext('2d', { alpha: true });

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.numStars = 650;
    this.stars = [];
    this.fov = 300;
    this.baseSpeed = 0.8;
    this.currentSpeed = 0.8;
    this.targetSpeed = 0.8;
    this.scrollVelocity = 0;

    // Mouse parallax
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;

    // Shooting stars
    this.meteors = [];

    // Nebula ambient colors
    this.ambientColor = { r: 6, g: 9, b: 24, a: 0.95 };
    this.targetAmbientColor = { r: 6, g: 9, b: 24, a: 0.95 };

    this.init();
  }

  init() {
    this.resize();
    this.initStars();
    this.bindEvents();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  initStars() {
    this.stars = [];
    for (let i = 0; i < this.numStars; i++) {
      this.stars.push(this.createStar());
    }
  }

  createStar(initialZ = null) {
    const spread = Math.max(this.width, this.height) * 1.6;
    return {
      x: (Math.random() - 0.5) * spread,
      y: (Math.random() - 0.5) * spread,
      z: initialZ !== null ? initialZ : Math.random() * 1000 + 1,
      pz: initialZ !== null ? initialZ : 1000,
      size: Math.random() * 1.5 + 0.5,
      hue: Math.random() > 0.8 ? (Math.random() > 0.5 ? 190 : 270) : 0,
      brightness: Math.random() * 0.7 + 0.3,
    };
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    window.addEventListener('mousemove', (e) => {
      this.targetMouseX = (e.clientX / this.width - 0.5) * 50;
      this.targetMouseY = (e.clientY / this.height - 0.5) * 50;
    });

    // Spontaneous meteors
    setInterval(() => {
      if (Math.random() > 0.3 && this.meteors.length < 3) {
        this.createMeteor();
      }
    }, 3500);
  }

  createMeteor() {
    const startX = Math.random() * this.width;
    const startY = Math.random() * (this.height * 0.4);
    const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.4;
    const speed = Math.random() * 12 + 10;
    const length = Math.random() * 120 + 80;

    this.meteors.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      length,
      opacity: 1,
      decay: Math.random() * 0.02 + 0.015,
      color: Math.random() > 0.5 ? '#00ffdc' : '#c084fc'
    });
  }

  setScrollVelocity(vel) {
    this.scrollVelocity = Math.abs(vel);
  }

  setAmbientChapter(r, g, b) {
    this.targetAmbientColor = { r, g, b, a: 0.95 };
  }

  animate() {
    // Smooth mouse interpolation
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    // Smooth speed interpolation based on scroll velocity
    const warpMultiplier = Math.min(this.scrollVelocity * 0.14, 16);
    this.targetSpeed = this.baseSpeed + warpMultiplier;
    this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.1;
    this.scrollVelocity *= 0.92; // Decay

    // Smooth ambient background color shift
    this.ambientColor.r += (this.targetAmbientColor.r - this.ambientColor.r) * 0.03;
    this.ambientColor.g += (this.targetAmbientColor.g - this.ambientColor.g) * 0.03;
    this.ambientColor.b += (this.targetAmbientColor.b - this.ambientColor.b) * 0.03;

    // Clear canvas
    this.ctx.fillStyle = `rgb(${Math.round(this.ambientColor.r)}, ${Math.round(this.ambientColor.g)}, ${Math.round(this.ambientColor.b)})`;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw ambient cosmic nebula dust clouds
    this.drawNebulaDust();

    // Render stars
    const cx = this.width / 2 + this.mouseX;
    const cy = this.height / 2 + this.mouseY;
    const isWarping = this.currentSpeed > 3.0;

    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];
      star.pz = star.z;
      star.z -= this.currentSpeed;

      if (star.z <= 0) {
        Object.assign(star, this.createStar(1000));
        star.pz = 1000;
      }

      const k = this.fov / star.z;
      const x = star.x * k + cx;
      const y = star.y * k + cy;

      if (x < -50 || x > this.width + 50 || y < -50 || y > this.height + 50) {
        Object.assign(star, this.createStar(1000));
        continue;
      }

      const pk = this.fov / star.pz;
      const px = star.x * pk + cx;
      const py = star.y * pk + cy;

      const alpha = Math.min((1 - star.z / 1000) * star.brightness, 1);
      const size = Math.max(star.size * (1 - star.z / 1000) * 2, 0.6);

      if (isWarping) {
        // Hyperspace warp streak
        this.ctx.beginPath();
        this.ctx.moveTo(px, py);
        this.ctx.lineTo(x, y);
        const grad = this.ctx.createLinearGradient(px, py, x, y);
        if (star.hue === 190) {
          grad.addColorStop(0, `rgba(0, 255, 220, 0)`);
          grad.addColorStop(1, `rgba(0, 255, 220, ${alpha})`);
        } else if (star.hue === 270) {
          grad.addColorStop(0, `rgba(192, 132, 252, 0)`);
          grad.addColorStop(1, `rgba(192, 132, 252, ${alpha})`);
        } else {
          grad.addColorStop(0, `rgba(255, 255, 255, 0)`);
          grad.addColorStop(1, `rgba(255, 255, 255, ${alpha})`);
        }
        this.ctx.strokeStyle = grad;
        this.ctx.lineWidth = size * (this.currentSpeed * 0.35);
        this.ctx.stroke();
      } else {
        // Standard high-definition glowing star
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        if (star.hue === 190) {
          this.ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
          this.ctx.shadowColor = '#38bdf8';
          this.ctx.shadowBlur = 4;
        } else if (star.hue === 270) {
          this.ctx.fillStyle = `rgba(192, 132, 252, ${alpha})`;
          this.ctx.shadowColor = '#a855f7';
          this.ctx.shadowBlur = 4;
        } else {
          this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          this.ctx.shadowColor = '#ffffff';
          this.ctx.shadowBlur = size > 1.8 ? 6 : 0;
        }
        this.ctx.fill();
        this.ctx.shadowBlur = 0; // Reset
      }
    }

    // Render meteors
    this.renderMeteors();

    requestAnimationFrame(this.animate);
  }

  drawNebulaDust() {
    const grad1 = this.ctx.createRadialGradient(
      this.width * 0.2 + this.mouseX * 0.5,
      this.height * 0.3 + this.mouseY * 0.5,
      10,
      this.width * 0.2,
      this.height * 0.3,
      this.width * 0.6
    );
    grad1.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
    grad1.addColorStop(0.6, 'rgba(56, 189, 248, 0.02)');
    grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');

    this.ctx.fillStyle = grad1;
    this.ctx.fillRect(0, 0, this.width, this.height);

    const grad2 = this.ctx.createRadialGradient(
      this.width * 0.8 - this.mouseX * 0.5,
      this.height * 0.7 - this.mouseY * 0.5,
      10,
      this.width * 0.8,
      this.height * 0.7,
      this.width * 0.65
    );
    grad2.addColorStop(0, 'rgba(168, 85, 247, 0.07)');
    grad2.addColorStop(0.5, 'rgba(168, 85, 247, 0.015)');
    grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');

    this.ctx.fillStyle = grad2;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  renderMeteors() {
    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      m.x += m.vx;
      m.y += m.vy;
      m.opacity -= m.decay;

      if (m.opacity <= 0 || m.x > this.width + 100 || m.y > this.height + 100) {
        this.meteors.splice(i, 1);
        continue;
      }

      const tailX = m.x - (m.vx / Math.hypot(m.vx, m.vy)) * m.length;
      const tailY = m.y - (m.vy / Math.hypot(m.vx, m.vy)) * m.length;

      const grad = this.ctx.createLinearGradient(tailX, tailY, m.x, m.y);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(0.7, `${m.color}${Math.floor(m.opacity * 180).toString(16).padStart(2, '0')}`);
      grad.addColorStop(1, `rgba(255, 255, 255, ${m.opacity})`);

      this.ctx.beginPath();
      this.ctx.moveTo(tailX, tailY);
      this.ctx.lineTo(m.x, m.y);
      this.ctx.strokeStyle = grad;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Meteor head glow
      this.ctx.beginPath();
      this.ctx.arc(m.x, m.y, 2, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${m.opacity})`;
      this.ctx.shadowColor = m.color;
      this.ctx.shadowBlur = 8;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }
  }
}

let engineInstance = null;

export function initCanvasEngine() {
  if (!engineInstance) {
    engineInstance = new CanvasFlightEngine('starfield-canvas');
  }
  return engineInstance;
}

export function getCanvasEngine() {
  return engineInstance;
}
