// Snow Background Animation
class SnowBackground {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.count = options.count || 150;
    this.intensity = options.intensity || 1;
    this.wind = options.wind ?? 0.3;
    this.color = options.color || "rgba(255, 255, 255, 0.9)";
    this.speed = options.speed || 1;

    this.canvas = null;
    this.ctx = null;
    this.flakes = [];
    this.width = 0;
    this.height = 0;
    this.dpr = window.devicePixelRatio || 1;
    this.tick = 0;
    this.animationId = 0;
    this.resizeObserver = null;

    this.layers = [
      { speed: 0.3, minSize: 1, maxSize: 2.5, opacity: 0.4 },
      { speed: 0.6, minSize: 2, maxSize: 4, opacity: 0.6 },
      { speed: 1.0, minSize: 3, maxSize: 6, opacity: 0.9 },
    ];

    this.init();
  }

  init() {
    this.canvas = document.createElement("canvas");
    this.canvas.className = "skills-snow-canvas";
    this.container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext("2d");
    if (!this.ctx) return;

    this.resize();
    this.createFlakes();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);
    this.animate();
  }

  resize() {
    if (!this.canvas || !this.ctx) return;
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.dpr = window.devicePixelRatio || 1;

    this.canvas.width = Math.max(1, Math.floor(this.width * this.dpr));
    this.canvas.height = Math.max(1, Math.floor(this.height * this.dpr));
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);
  }

  createFlake(layer, startFromTop = false) {
    const config = this.layers[layer];
    return {
      x: Math.random() * (this.width + 100) - 50,
      y: startFromTop ? -10 - Math.random() * 100 : Math.random() * this.height,
      size: config.minSize + Math.random() * (config.maxSize - config.minSize),
      speed: config.speed * (0.8 + Math.random() * 0.4),
      opacity: config.opacity * (0.8 + Math.random() * 0.2),
      wobbleOffset: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.02,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      layer,
    };
  }

  createFlakes() {
    const total = Math.floor(this.count * this.intensity);
    this.flakes = [];

    for (let i = 0; i < total; i++) {
      const layer = i < total * 0.4 ? 0 : i < total * 0.75 ? 1 : 2;
      this.flakes.push(this.createFlake(layer));
    }

    this.flakes.sort((a, b) => a.layer - b.layer);
  }

  animate() {
    if (!this.ctx) return;
    this.tick += 1;
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (const flake of this.flakes) {
      flake.y += flake.speed * this.speed * 1.5;
      const wobble = Math.sin(this.tick * flake.wobbleSpeed + flake.wobbleOffset) * 0.5;
      flake.x += wobble + this.wind * flake.speed * this.speed;
      flake.rotation += flake.rotationSpeed * this.speed;

      if (flake.y > this.height + 20) {
        flake.y = -10 - Math.random() * 50;
        flake.x = Math.random() * (this.width + 100) - 50;
      }
      if (flake.x < -50) flake.x = this.width + 50;
      if (flake.x > this.width + 50) flake.x = -50;

      this.ctx.save();
      this.ctx.translate(flake.x, flake.y);
      this.ctx.rotate(flake.rotation);
      this.ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
      this.ctx.shadowBlur = flake.size * 2;

      this.ctx.globalAlpha = flake.opacity;
      this.ctx.fillStyle = this.color;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, flake.size, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.globalAlpha = flake.opacity * 0.5;
      this.ctx.fillStyle = "#ffffff";
      this.ctx.beginPath();
      this.ctx.arc(-flake.size * 0.2, -flake.size * 0.2, flake.size * 0.4, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    }

    this.ctx.shadowBlur = 0;
    this.ctx.globalAlpha = 1;
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    cancelAnimationFrame(this.animationId);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.canvas) this.canvas.remove();
  }
}
