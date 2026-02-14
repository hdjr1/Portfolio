// Light Waves Background Animation
class LightWavesBackground {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.colors = options.colors || ["#0ea5e9", "#8b5cf6", "#06b6d4", "#a855f7", "#0284c7"];
    this.speed = options.speed || 1;
    this.intensity = options.intensity || 0.6;

    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.container.appendChild(this.canvas);

    this.waves = [];
    this.startTime = Date.now();
    this.animationId = null;

    this.setupCanvas();
    this.initWaves();
    this.startAnimation();

    window.addEventListener("resize", () => this.setupCanvas());
  }

  setupCanvas() {
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.zIndex = "0";
    this.initWaves();
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { r: 255, g: 255, b: 255 };
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };
  }

  initWaves() {
    this.waves = [];
    const waveCount = 5;

    for (let i = 0; i < waveCount; i++) {
      this.waves.push({
        y: this.height * (0.3 + (i / waveCount) * 0.5),
        amplitude: this.height * (0.15 + Math.random() * 0.15),
        frequency: 0.002 + Math.random() * 0.002,
        speed: (0.2 + Math.random() * 0.3) * (i % 2 === 0 ? 1 : -1),
        phase: Math.random() * Math.PI * 2,
        color: this.colors[i % this.colors.length],
        opacity: 0.15 + Math.random() * 0.1,
      });
    }
  }

  draw() {
    const time = ((Date.now() - this.startTime) * 0.001) * this.speed;

    // Dark gradient background
    const bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    bgGradient.addColorStop(0, "#030712");
    bgGradient.addColorStop(0.5, "#0a0f1a");
    bgGradient.addColorStop(1, "#030712");
    this.ctx.fillStyle = bgGradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw ambient glow spots
    this.ctx.globalCompositeOperation = "lighter";

    const glowSpots = [
      {
        x: this.width * 0.2,
        y: this.height * 0.3,
        radius: Math.min(this.width, this.height) * 0.4,
        color: this.colors[0],
      },
      {
        x: this.width * 0.8,
        y: this.height * 0.6,
        radius: Math.min(this.width, this.height) * 0.35,
        color: this.colors[1],
      },
      {
        x: this.width * 0.5,
        y: this.height * 0.8,
        radius: Math.min(this.width, this.height) * 0.3,
        color: this.colors[2],
      },
    ];

    for (const spot of glowSpots) {
      const rgb = this.hexToRgb(spot.color);
      const gradient = this.ctx.createRadialGradient(
        spot.x + Math.sin(time * 0.3) * 50,
        spot.y + Math.cos(time * 0.2) * 30,
        0,
        spot.x + Math.sin(time * 0.3) * 50,
        spot.y + Math.cos(time * 0.2) * 30,
        spot.radius
      );
      gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.08 * this.intensity})`);
      gradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.03 * this.intensity})`);
      gradient.addColorStop(1, "transparent");
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    // Draw flowing waves
    for (const wave of this.waves) {
      const rgb = this.hexToRgb(wave.color);

      this.ctx.beginPath();
      this.ctx.moveTo(0, this.height);

      // Create wave path
      for (let x = 0; x <= this.width; x += 5) {
        const y =
          wave.y +
          Math.sin(x * wave.frequency + time * wave.speed + wave.phase) * wave.amplitude +
          Math.sin(x * wave.frequency * 0.5 + time * wave.speed * 0.7 + wave.phase * 1.3) *
            wave.amplitude *
            0.5;

        if (x === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }

      // Complete the shape
      this.ctx.lineTo(this.width, this.height);
      this.ctx.lineTo(0, this.height);
      this.ctx.closePath();

      // Fill with gradient
      const waveGradient = this.ctx.createLinearGradient(
        0,
        wave.y - wave.amplitude,
        0,
        this.height
      );
      waveGradient.addColorStop(
        0,
        `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${wave.opacity * this.intensity})`
      );
      waveGradient.addColorStop(
        0.3,
        `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${wave.opacity * 0.5 * this.intensity})`
      );
      waveGradient.addColorStop(1, "transparent");

      this.ctx.fillStyle = waveGradient;
      this.ctx.fill();
    }

    // Add subtle top glow
    this.ctx.globalCompositeOperation = "source-over";
    const topGlow = this.ctx.createLinearGradient(0, 0, 0, this.height * 0.4);
    const topGlowColor = this.hexToRgb(this.colors[0]);
    topGlow.addColorStop(
      0,
      `rgba(${topGlowColor.r}, ${topGlowColor.g}, ${topGlowColor.b}, ${0.05 * this.intensity})`
    );
    topGlow.addColorStop(1, "transparent");
    this.ctx.fillStyle = topGlow;
    this.ctx.fillRect(0, 0, this.width, this.height * 0.4);

    this.animationId = requestAnimationFrame(() => this.draw());
  }

  startAnimation() {
    this.animationId = requestAnimationFrame(() => this.draw());
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}
