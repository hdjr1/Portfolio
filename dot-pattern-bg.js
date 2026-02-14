// Dot Pattern Background Animation
class DotPatternBackground {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.dotSize = options.dotSize || 2;
    this.gap = options.gap || 24;
    this.baseColor = this.hexToRgb(options.baseColor || "#404040");
    this.glowColor = this.hexToRgb(options.glowColor || "#22d3ee");
    this.proximity = options.proximity || 120;
    this.glowIntensity = options.glowIntensity ?? 1;
    this.waveSpeed = options.waveSpeed ?? 0.5;

    this.canvas = null;
    this.ctx = null;
    this.dots = [];
    this.mouse = { x: -1000, y: -1000 };
    this.startTime = Date.now();
    this.animationId = 0;
    this.resizeObserver = null;
    this.interactionSurface =
      this.container.closest(".projects") || this.container.parentElement || this.container;

    this.handleMouseMove = (e) => this.onMouseMove(e);
    this.handleMouseLeave = () => this.onMouseLeave();

    this.init();
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }

  init() {
    this.canvas = document.createElement("canvas");
    this.canvas.className = "projects-dot-canvas";
    this.container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext("2d");
    if (!this.ctx) return;

    this.resizeObserver = new ResizeObserver(() => this.buildGrid());
    this.resizeObserver.observe(this.container);

    this.interactionSurface.addEventListener("mousemove", this.handleMouseMove, { passive: true });
    this.interactionSurface.addEventListener("mouseleave", this.handleMouseLeave, {
      passive: true,
    });

    this.buildGrid();
    this.draw();
  }

  onMouseMove(e) {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
  }

  onMouseLeave() {
    this.mouse = { x: -1000, y: -1000 };
  }

  buildGrid() {
    if (!this.canvas || !this.ctx) return;

    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);

    const cellSize = this.dotSize + this.gap;
    const cols = Math.ceil(rect.width / cellSize) + 1;
    const rows = Math.ceil(rect.height / cellSize) + 1;
    const offsetX = (rect.width - (cols - 1) * cellSize) / 2;
    const offsetY = (rect.height - (rows - 1) * cellSize) / 2;

    this.dots = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        this.dots.push({
          x: offsetX + col * cellSize,
          y: offsetY + row * cellSize,
          baseOpacity: 0.3 + Math.random() * 0.2,
        });
      }
    }
  }

  draw() {
    if (!this.canvas || !this.ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = this.canvas.width / dpr;
    const height = this.canvas.height / dpr;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, width, height);

    const mx = this.mouse.x;
    const my = this.mouse.y;
    const proxSq = this.proximity * this.proximity;
    const time = (Date.now() - this.startTime) * 0.001 * this.waveSpeed;

    for (const dot of this.dots) {
      const dx = dot.x - mx;
      const dy = dot.y - my;
      const distSq = dx * dx + dy * dy;

      const wave = Math.sin(dot.x * 0.02 + dot.y * 0.02 + time) * 0.5 + 0.5;
      const waveOpacity = dot.baseOpacity + wave * 0.15;
      const waveScale = 1 + wave * 0.2;

      let opacity = waveOpacity;
      let scale = waveScale;
      let r = this.baseColor.r;
      let g = this.baseColor.g;
      let b = this.baseColor.b;
      let glow = 0;

      if (distSq < proxSq) {
        const dist = Math.sqrt(distSq);
        const t = 1 - dist / this.proximity;
        const eased = t * t * (3 - 2 * t);
        r = Math.round(this.baseColor.r + (this.glowColor.r - this.baseColor.r) * eased);
        g = Math.round(this.baseColor.g + (this.glowColor.g - this.baseColor.g) * eased);
        b = Math.round(this.baseColor.b + (this.glowColor.b - this.baseColor.b) * eased);
        opacity = Math.min(1, waveOpacity + eased * 0.7);
        scale = waveScale + eased * 0.8;
        glow = eased * this.glowIntensity;
      }

      const radius = (this.dotSize / 2) * scale;

      if (glow > 0) {
        const gradient = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, radius * 4);
        gradient.addColorStop(
          0,
          `rgba(${this.glowColor.r}, ${this.glowColor.g}, ${this.glowColor.b}, ${glow * 0.4})`
        );
        gradient.addColorStop(
          0.5,
          `rgba(${this.glowColor.r}, ${this.glowColor.g}, ${this.glowColor.b}, ${glow * 0.1})`
        );
        gradient.addColorStop(1, `rgba(${this.glowColor.r}, ${this.glowColor.g}, ${this.glowColor.b}, 0)`);
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      ctx.fill();
    }

    this.animationId = requestAnimationFrame(() => this.draw());
  }

  destroy() {
    cancelAnimationFrame(this.animationId);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    this.interactionSurface.removeEventListener("mousemove", this.handleMouseMove);
    this.interactionSurface.removeEventListener("mouseleave", this.handleMouseLeave);
    if (this.canvas) this.canvas.remove();
  }
}
