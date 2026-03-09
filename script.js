document.addEventListener('DOMContentLoaded', () => {
    initCinematicBackground();
    initPanelNavigation();
    initProjectVideoPreview();
    initProjectPagination();
});

function initPanelNavigation() {
    const navCards = document.querySelectorAll('.nav-card[data-target]');
    const backButtons = document.querySelectorAll('.back-btn[data-target]');
    let isAnimating = false;

    function updateActiveNavCard(targetId) {
        navCards.forEach((card) => {
            const cardTarget = card.getAttribute('data-target');
            const isActiveCard = targetId !== 'home-panel' && cardTarget === targetId;
            card.classList.toggle('is-active', isActiveCard);
        });
    }

    function showPanel(targetId) {
        if (isAnimating) return;

        const currentPanel = document.querySelector('.content-panel.active');
        const targetPanel = document.getElementById(targetId);

        if (!targetPanel || currentPanel === targetPanel) return;

        updateActiveNavCard(targetId);

        isAnimating = true;

        if (currentPanel) {
            currentPanel.classList.remove('active');
            currentPanel.classList.add('exiting');

            currentPanel.addEventListener('animationend', function onExit() {
                currentPanel.classList.remove('exiting');

                targetPanel.classList.add('active');
                targetPanel.addEventListener('animationend', function onEnter() {
                    isAnimating = false;
                }, { once: true });
            }, { once: true });
            return;
        }

        targetPanel.classList.add('active');
        targetPanel.addEventListener('animationend', function onEnter() {
            isAnimating = false;
        }, { once: true });
    }

    navCards.forEach((card) => {
        card.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = card.getAttribute('data-target');
            showPanel(targetId);
        });
    });

    backButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = button.getAttribute('data-target');
            showPanel(targetId);
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;

        const homePanel = document.getElementById('home-panel');
        if (homePanel && !homePanel.classList.contains('active')) {
            showPanel('home-panel');
        }
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

        if (blobs.length > 0) return;

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

function initProjectVideoPreview() {
    document.querySelectorAll('.project-item').forEach((card) => {
        const video = card.querySelector('.project-video');

        function playVideo() {
            if (!video) return;
            const playPromise = video.play();
            if (playPromise !== undefined) playPromise.catch(() => {});
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
            setTimeout(stopVideo, 2000);
        }, { passive: true });
    });
}

function initProjectPagination() {
    const projectsPanel = document.getElementById('projects-panel');
    const prevButton = document.getElementById('projects-prev');
    const nextButton = document.getElementById('projects-next');
    const indicator = document.getElementById('projects-page-indicator');
    if (!projectsPanel || !prevButton || !nextButton || !indicator) return;

    const items = Array.from(projectsPanel.querySelectorAll('.project-item'));
    if (items.length === 0) return;

    const pageSize = 2;
    const totalPages = Math.ceil(items.length / pageSize);
    let currentPage = 0;

    const renderPage = () => {
        const start = currentPage * pageSize;
        const end = start + pageSize;

        items.forEach((item, index) => {
            const visible = index >= start && index < end;
            item.style.display = visible ? 'flex' : 'none';
        });

        indicator.textContent = `${currentPage + 1} / ${totalPages}`;
        prevButton.disabled = currentPage === 0;
        nextButton.disabled = currentPage === totalPages - 1;
    };

    prevButton.addEventListener('click', () => {
        if (currentPage === 0) return;
        currentPage -= 1;
        renderPage();
    });

    nextButton.addEventListener('click', () => {
        if (currentPage >= totalPages - 1) return;
        currentPage += 1;
        renderPage();
    });

    renderPage();
}

function startLoaderSequence() {
    const loader = document.getElementById('page-loader');
    if (!loader || loader.dataset.started) return;
    loader.dataset.started = 'true';

    setTimeout(() => {
        loader.classList.add('loaded');

        setTimeout(() => {
            loader.remove();

            const heroLeft = document.querySelector('.hero-left');
            if (heroLeft) {
                heroLeft.querySelectorAll(':scope > *').forEach((el, i) => {
                    el.classList.add('hero-slide-left');
                    el.style.animationDelay = `${i * 0.15}s`;
                });
            }

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

window.addEventListener('load', startLoaderSequence);
window.addEventListener('pageshow', (event) => {
    if (event.persisted) startLoaderSequence();
});
