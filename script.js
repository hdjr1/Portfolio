document.addEventListener('DOMContentLoaded', () => {
    initCinematicBackground();
    initMobileNavigation();
    initPanelNavigation();
});

function initPanelNavigation() {
    const navCards = document.querySelectorAll('.nav-card[data-target]');
    const backButtons = document.querySelectorAll('.back-btn[data-target]');
    let isAnimating = false;

    function showPanel(targetId) {
        if (isAnimating) return;
        
        const currentPanel = document.querySelector('.content-panel.active');
        const targetPanel = document.getElementById(targetId);
        
        if (!targetPanel || currentPanel === targetPanel) return;
        
        isAnimating = true;
        
        // Exit current panel
        if (currentPanel) {
            currentPanel.classList.remove('active');
            currentPanel.classList.add('exiting');
            
            // Wait for exit animation to complete
            currentPanel.addEventListener('animationend', function handler() {
                currentPanel.removeEventListener('animationend', handler);
                currentPanel.classList.remove('exiting');
                
                // Enter new panel
                targetPanel.classList.add('active');
                
                targetPanel.addEventListener('animationend', function enterHandler() {
                    targetPanel.removeEventListener('animationend', enterHandler);
                    isAnimating = false;
                }, { once: true });
            }, { once: true });
        } else {
            // No current panel, just show target
            targetPanel.classList.add('active');
            targetPanel.addEventListener('animationend', function handler() {
                targetPanel.removeEventListener('animationend', handler);
                isAnimating = false;
            }, { once: true });
        }
    }

    // Nav card click handlers
    navCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = card.getAttribute('data-target');
            showPanel(targetId);
        });
    });

    // Back button click handlers
    backButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('data-target');
            showPanel(targetId);
        });
    });

    // Keyboard navigation (Escape to go back)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const homePanel = document.getElementById('home-panel');
            if (homePanel && !homePanel.classList.contains('active')) {
                showPanel('home-panel');
            }
        }
    });
}

function initMobileNavigation() {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.querySelector('.nav-menu');
    const backdrop = document.querySelector('.nav-backdrop');
    const links = document.querySelectorAll('.nav-link');
    if (!toggle || !menu) return;

    const closeMenu = () => {
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', () => {
        const isOpen = document.body.classList.toggle('nav-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
    });

    if (backdrop) {
        backdrop.addEventListener('click', closeMenu);
    }

    links.forEach((link) => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) closeMenu();
    });
}

function initCinematicBackground() {
    const canvas = document.getElementById('cinematic-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const palette = ['#ffffff', '#e0e0e0', '#d0d0d0', '#c0c0c0'];
    const blobs = [];
    const blobCount = 7;
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;
    let tick = 0;
    let animationId = 0;
    let mouseX = 0;
    let mouseY = 0;

    const resize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        dpr = window.devicePixelRatio || 1;
        canvas.width = Math.max(1, Math.floor(width * dpr));
        canvas.height = Math.max(1, Math.floor(height * dpr));
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        if (blobs.length === 0) {
            for (let index = 0; index < blobCount; index += 1) {
                blobs.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.min(width, height) * (0.12 + Math.random() * 0.1),
                    speedX: (Math.random() - 0.5) * 0.12,
                    speedY: (Math.random() - 0.5) * 0.12,
                    color: palette[index % palette.length],
                    drift: Math.random() * Math.PI * 2,
                });
            }
        }
    };

    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return { r: 0, g: 0, b: 0 };
        return {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        };
    };

    const drawNoise = () => {
        const density = 140;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for (let i = 0; i < density; i += 1) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 1.3;
            ctx.fillRect(x, y, size, size);
        }
    };

    const animate = () => {
        tick += 0.006;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        ctx.globalCompositeOperation = 'lighter';

        for (const blob of blobs) {
            blob.x += blob.speedX + Math.sin(tick + blob.drift) * 0.1;
            blob.y += blob.speedY + Math.cos(tick * 1.2 + blob.drift) * 0.1;

            if (blob.x < -blob.radius) blob.x = width + blob.radius;
            if (blob.x > width + blob.radius) blob.x = -blob.radius;
            if (blob.y < -blob.radius) blob.y = height + blob.radius;
            if (blob.y > height + blob.radius) blob.y = -blob.radius;

            const rgb = hexToRgb(blob.color);
            const px = blob.x + mouseX * 22;
            const py = blob.y + mouseY * 18;
            const gradient = ctx.createRadialGradient(px, py, 0, px, py, blob.radius);
            gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.55)`);
            gradient.addColorStop(0.55, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`);
            gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(px, py, blob.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalCompositeOperation = 'source-over';
        drawNoise();
        animationId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / Math.max(1, width) - 0.5) * 0.7;
        mouseY = (event.clientY / Math.max(1, height) - 0.5) * 0.7;
    }, { passive: true });

    window.addEventListener('resize', resize);
    resize();
    animationId = requestAnimationFrame(animate);

    window.addEventListener('beforeunload', () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', resize);
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

// loader overlay – show for 2s, then fade away
window.addEventListener('load', () => {
    const loader = document.getElementById('page-loader');
    if (loader) {
        document.body.classList.add('opening-active');
        // Wait 5 seconds, then start fading
        setTimeout(() => {
            loader.classList.add('loaded');
            // Remove loader after fade finishes (0.5s transition)
            setTimeout(() => {
                loader.remove();
                document.body.classList.remove('opening-active');
                document.body.classList.add('opening-complete');

                // Animate hero left children one by one
                const heroLeft = document.querySelector('.hero-left');
                if (heroLeft) {
                    heroLeft.querySelectorAll(':scope > *').forEach((el, i) => {
                        el.classList.add('hero-slide-left');
                        el.style.animationDelay = `${i * 0.15}s`;
                    });
                }

                // Animate hero right children one by one
                const navCards = document.querySelectorAll('.home-panel .nav-card');
                const socials = document.querySelector('.home-panel .hero-socials');
                navCards.forEach((card, i) => {
                    card.classList.add('hero-slide-right');
                    card.style.animationDelay = `${i * 0.12}s`;
                });
                if (socials) {
                    socials.classList.add('hero-slide-right');
                    socials.style.animationDelay = `${navCards.length * 0.12}s`;
                }
            }, 300);
        }, 3000);
    }

    // animate nav wrapper immediately
    const nav = document.querySelector('.nav-wrapper');
    if (nav) {
        nav.classList.add('animate-on-scroll', 'visible');
    }
    // hero content fade-in too
    const hero = document.querySelector('.hero-wrapper');
    if (hero) {
        hero.classList.add('animate-on-scroll', 'visible');
    }
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

// scroll-triggered visibility animations
(function() {
    const options = { threshold: 0.15 };
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, options);

    document.querySelectorAll('section').forEach(section => {
        const targets = section.querySelectorAll('.section-title, .container > *');
        targets.forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });
    });
    document.querySelectorAll('.project-card').forEach(card => {
        card.classList.add('animate-on-scroll');
        observer.observe(card);
    });
})();

// Project card media preview - subtle play/pause behavior
document.querySelectorAll('.project-card').forEach(card => {
    const video = card.querySelector('.project-video');

    function playVideo() {
        if (!video) return;
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {});
        }
    }

    function stopVideo() {
        if (!video) return;
        video.pause();
        video.currentTime = 0;
    }

    card.addEventListener('mouseenter', playVideo);
    card.addEventListener('mouseleave', stopVideo);

    card.addEventListener('touchstart', playVideo, { passive: true });
    card.addEventListener('touchend', () => {
        setTimeout(stopVideo, 1500);
    }, { passive: true });
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
