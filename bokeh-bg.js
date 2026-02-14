// Bokeh Background Animation
class BokehBackground {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.count = options.count || 25;
    this.minSize = options.minSize || 50;
    this.maxSize = options.maxSize || 200;
    this.speed = options.speed || 1;
    this.colors = options.colors || [
      "rgba(255, 200, 120, 0.3)",
      "rgba(255, 180, 100, 0.25)",
      "rgba(255, 220, 150, 0.2)",
      "rgba(255, 160, 80, 0.25)",
      "rgba(255, 240, 200, 0.2)",
    ];

    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.zIndex = "0";
    this.container.appendChild(this.canvas);

    this.orbs = [];
    this.tick = 0;
    this.animationId = null;
    this.resizeObserver = null;

    this.setupCanvas();
    this.createOrbs();
    this.startAnimation();

    window.addEventListener("resize", () => this.setupCanvas());
  }

  setupCanvas() {
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  createOrb() {
    const size = this.minSize + Math.random() * (this.maxSize - this.minSize);
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: (Math.random() - 0.5) * 0.3 * this.speed,
      vy: (Math.random() - 0.5) * 0.3 * this.speed,
      size,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      opacity: 0.15 + Math.random() * 0.2,
      pulseOffset: Math.random() * Math.PI * 2,
      pulseSpeed: 0.005 + Math.random() * 0.01,
    };
  }

  createOrbs() {
    this.orbs = Array.from({ length: this.count }, () => this.createOrb());
    // Sort by size for depth (smaller = further back, draw first)
    this.orbs.sort((a, b) => a.size - b.size);
  }

  parseColorOpacity(color, opacity) {
    // Parse rgba color and replace opacity value
    return color.replace(/[\d.]+\)$/, `${opacity})`);
  }

  animate() {
    this.tick++;
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (const orb of this.orbs) {
      // Gentle movement
      orb.x += orb.vx;
      orb.y += orb.vy;

      // Soft wrap at edges
      if (orb.x < -orb.size / 2) orb.x = this.width + orb.size / 2;
      if (orb.x > this.width + orb.size / 2) orb.x = -orb.size / 2;
      if (orb.y < -orb.size / 2) orb.y = this.height + orb.size / 2;
      if (orb.y > this.height + orb.size / 2) orb.y = -orb.size / 2;

      // Subtle pulse
      const pulse = Math.sin(this.tick * orb.pulseSpeed + orb.pulseOffset) * 0.1 + 1;
      const currentSize = orb.size * pulse;

      // Draw soft bokeh circle with gradient
      const gradient = this.ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, currentSize / 2);

      gradient.addColorStop(0, this.parseColorOpacity(orb.color, orb.opacity * 1.2));
      gradient.addColorStop(0.4, this.parseColorOpacity(orb.color, orb.opacity));
      gradient.addColorStop(0.7, this.parseColorOpacity(orb.color, orb.opacity * 0.5));
      gradient.addColorStop(1, this.parseColorOpacity(orb.color, 0));

      this.ctx.beginPath();
      this.ctx.arc(orb.x, orb.y, currentSize / 2, 0, Math.PI * 2);
      this.ctx.fillStyle = gradient;
      this.ctx.fill();

      // Subtle rim highlight
      this.ctx.beginPath();
      this.ctx.arc(orb.x, orb.y, currentSize / 2 - 2, 0, Math.PI * 2);
      this.ctx.strokeStyle = this.parseColorOpacity(orb.color, orb.opacity * 0.3);
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  startAnimation() {
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}
