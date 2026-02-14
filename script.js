// Initialize Light Waves Background
document.addEventListener('DOMContentLoaded', () => {
    new LightWavesBackground('hero-bg', {
        colors: ["#0ea5e9", "#8b5cf6", "#06b6d4", "#a855f7", "#0284c7"],
        speed: 1,
        intensity: 0.6
    });

    // Initialize Spotlight Background for About Section
    new SpotlightBackground('about-bg', {
        colors: ["rgba(120, 119, 198, 0.4)", "rgba(59, 130, 246, 0.3)"],
        size: 400,
        blur: 80,
        smoothing: 0.1,
        ambient: true,
        opacity: 1
    });

    // Initialize interactive dot pattern background for Projects Section
    new DotPatternBackground('projects-bg', {
        dotSize: 2,
        gap: 24,
        baseColor: '#404040',
        glowColor: '#22d3ee',
        proximity: 120,
        glowIntensity: 1,
        waveSpeed: 0.5
    });

    // Initialize Snow Background for Skills Section
    new SnowBackground('skills-bg', {
        count: 150,
        intensity: 1,
        wind: 0.3,
        color: 'rgba(255, 255, 255, 0.9)',
        speed: 1
    });

    initWaveGridButton('.wave-grid-btn');
});

function initWaveGridButton(selector) {
    const button = document.querySelector(selector);
    if (!button) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'wave-grid-btn__canvas';
    button.prepend(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gridSize = 14;
    const waveHeight = 8;
    const waveSpeed = 0.9;
    const rgb = { r: 6, g: 182, b: 212 };

    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;
    let animationId = 0;
    let tick = 0;

    const resize = () => {
        const rect = button.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        dpr = window.devicePixelRatio || 1;

        canvas.width = Math.max(1, Math.floor(width * dpr));
        canvas.height = Math.max(1, Math.floor(height * dpr));
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
    };

    const getWaveHeight = (x, z, t) => {
        return (
            Math.sin(x * 0.05 + t) * Math.cos(z * 0.04 + t * 0.8) * waveHeight +
            Math.sin(x * 0.03 - t * 0.5 + z * 0.04) * waveHeight * 0.4 +
            Math.sin((x + z) * 0.03 + t * 1.2) * waveHeight * 0.2
        );
    };

    const project = (x, y, z) => {
        const perspective = 180;
        const cameraY = 30;
        const cameraZ = -40;
        const relZ = z - cameraZ;
        const scale = perspective / (perspective + relZ);

        return {
            x: width / 2 + x * scale,
            y: height * 0.68 + (y - cameraY) * scale
        };
    };

    const animate = () => {
        tick += 0.02 * waveSpeed;

        ctx.fillStyle = '#030712';
        ctx.fillRect(0, 0, width, height);

        const cols = Math.ceil(width / gridSize) + 6;
        const rows = 8;
        const startX = (-cols * gridSize) / 2;
        const startZ = 0;

        for (let row = rows - 1; row >= 0; row--) {
            const z = startZ + row * gridSize;

            ctx.beginPath();
            let firstPoint = true;
            for (let col = 0; col <= cols; col++) {
                const x = startX + col * gridSize;
                const waveY = getWaveHeight(x, z, tick);
                const p = project(x, waveY, z);
                if (firstPoint) {
                    ctx.moveTo(p.x, p.y);
                    firstPoint = false;
                } else {
                    ctx.lineTo(p.x, p.y);
                }
            }

            const rowBrightness = 0.15 + (1 - row / rows) * 0.5;
            ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rowBrightness})`;
            ctx.lineWidth = Math.max(0.4, (1 - row / rows) * 1.1);
            ctx.stroke();

            if (row < rows - 1) {
                for (let col = 0; col <= cols; col++) {
                    const x = startX + col * gridSize;
                    const z2 = z + gridSize;
                    const waveY1 = getWaveHeight(x, z, tick);
                    const waveY2 = getWaveHeight(x, z2, tick);
                    const p1 = project(x, waveY1, z);
                    const p2 = project(x, waveY2, z2);
                    const brightness = 0.12 + (1 - row / rows) * 0.45;

                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${brightness})`;
                    ctx.lineWidth = Math.max(0.35, (1 - row / rows) * 0.9);
                    ctx.stroke();
                }
            }
        }

        animationId = requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(button);
    resize();
    animationId = requestAnimationFrame(animate);

    window.addEventListener('beforeunload', () => {
        cancelAnimationFrame(animationId);
        resizeObserver.disconnect();
    });
}

// Smooth scroll behavior for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add active state to navigation links based on scroll position
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Project card video popup - mouse and touch support
document.querySelectorAll('.project-card').forEach(card => {
    const videoPopup = card.querySelector('.project-video-popup');
    const video = card.querySelector('.project-video');
    
    // Mouse events
    card.addEventListener('mouseenter', () => {
        playVideo();
    });
    
    card.addEventListener('mouseleave', () => {
        stopVideo();
    });
    
    // Touch events for mobile
    card.addEventListener('touchstart', (e) => {
        playVideo();
    }, { passive: true });
    
    card.addEventListener('touchend', () => {
        setTimeout(stopVideo, 2000);
    }, { passive: true });
    
    // Click to show/hide on mobile
    card.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            playVideo();
        }
    });
    
    function playVideo() {
        if (video) {
            video.currentTime = 0;
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('Video playback error:', error);
                });
            }
        }
    }
    
    function stopVideo() {
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
    }
    
    // Cursor pointer on hover
    card.addEventListener('mouseenter', function() {
        this.style.cursor = 'pointer';
    });
});

// Improve touch targets for buttons
document.querySelectorAll('.btn').forEach(btn => {
    if (window.innerWidth <= 768) {
        btn.style.minHeight = '48px';
        btn.style.minWidth = '48px';
    }
});

// Console message
console.log('Welcome to my portfolio! Feel free to inspect the code and reach out if you have any questions.');
