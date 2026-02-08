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
