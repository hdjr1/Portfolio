// Spotlight Background Animation
class SpotlightBackground {
  constructor(containerId, options = {}) {
    this.bgContainer = document.getElementById(containerId);
    if (!this.bgContainer) return;

    // Get the parent section for event listening
    this.container = this.bgContainer.parentElement;
    
    this.colors = Array.isArray(options.colors) ? options.colors : [options.colors || "rgba(120, 119, 198, 0.3)"];
    this.size = options.size || 400;
    this.blur = options.blur || 80;
    this.smoothing = options.smoothing || 0.1;
    this.ambient = options.ambient !== false;
    this.opacity = options.opacity || 1;

    this.spotlights = [];
    this.positions = [];
    this.lastMouseMove = Date.now();
    this.animationTick = 0;
    this.animationId = null;

    this.initSpotlights();
    this.createSpotlightElements();
    this.startAnimation();

    // Attach listeners to parent section
    this.container.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    this.container.addEventListener("touchmove", (e) => this.handleTouchMove(e), { passive: true });
  }

  initSpotlights() {
    const rect = this.container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    this.spotlights = this.colors.map((_, i) => ({
      x: centerX + (i - (this.colors.length - 1) / 2) * 50,
      y: centerY,
      targetX: centerX + (i - (this.colors.length - 1) / 2) * 50,
      targetY: centerY,
    }));

    this.positions = this.spotlights.map(s => ({ x: s.x, y: s.y }));
  }

  createSpotlightElements() {
    this.spotlightDivs = this.colors.map((color, i) => {
      const div = document.createElement("div");
      div.className = "spotlight-layer";
      div.style.position = "absolute";
      div.style.inset = "0";
      div.style.pointerEvents = "none";
      div.style.opacity = this.opacity;
      div.style.filter = `blur(${this.blur}px)`;
      div.style.willChange = "background";
      div.style.mixBlendMode = "screen";
      this.bgContainer.appendChild(div);
      return { div, color };
    });

    // Add base gradient
    const baseGradient = document.createElement("div");
    baseGradient.style.position = "absolute";
    baseGradient.style.inset = "0";
    baseGradient.style.pointerEvents = "none";
    baseGradient.style.opacity = "0.5";
    baseGradient.style.background = "radial-gradient(ellipse at 50% 50%, rgba(30, 30, 50, 0.3) 0%, transparent 70%)";
    baseGradient.style.zIndex = "1";
    this.bgContainer.appendChild(baseGradient);

    // Add vignette
    const vignette = document.createElement("div");
    vignette.style.position = "absolute";
    vignette.style.inset = "0";
    vignette.style.pointerEvents = "none";
    vignette.style.background = "radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(10,10,10,0.8) 100%)";
    vignette.style.zIndex = "2";
    this.bgContainer.appendChild(vignette);
  }

  lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  handleMouseMove(e) {
    const rect = this.container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.lastMouseMove = Date.now();

    this.spotlights = this.spotlights.map((spotlight, i) => ({
      ...spotlight,
      targetX: x + (i - (this.colors.length - 1) / 2) * 30,
      targetY: y + (i - (this.colors.length - 1) / 2) * 20,
    }));
  }

  handleTouchMove(e) {
    if (!e.touches[0]) return;

    const rect = this.container.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;

    this.lastMouseMove = Date.now();

    this.spotlights = this.spotlights.map((spotlight, i) => ({
      ...spotlight,
      targetX: x + (i - (this.colors.length - 1) / 2) * 30,
      targetY: y + (i - (this.colors.length - 1) / 2) * 20,
    }));
  }

  animate() {
    this.animationTick++;
    const now = Date.now();
    const timeSinceMouseMove = now - this.lastMouseMove;
    const isAmbient = this.ambient && timeSinceMouseMove > 2000;

    const rect = this.container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    this.spotlights = this.spotlights.map((spotlight, i) => {
      let { x, y, targetX, targetY } = spotlight;

      // Ambient drift when no mouse activity
      if (isAmbient) {
        const offset = i * 0.5;
        targetX = width / 2 + Math.sin(this.animationTick * 0.005 + offset) * (width * 0.2);
        targetY = height / 2 + Math.cos(this.animationTick * 0.003 + offset) * (height * 0.15);
      }

      // Smooth interpolation
      x = this.lerp(x, targetX, this.smoothing);
      y = this.lerp(y, targetY, this.smoothing);

      return { x, y, targetX, targetY };
    });

    this.positions = this.spotlights.map(s => ({ x: s.x, y: s.y }));

    // Update spotlight elements
    this.spotlightDivs.forEach((spotlight, i) => {
      const pos = this.positions[i];
      spotlight.div.style.background = `radial-gradient(${this.size}px circle at ${pos.x}px ${pos.y}px, ${spotlight.color}, transparent 70%)`;
    });

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
