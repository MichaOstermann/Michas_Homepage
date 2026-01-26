// ═════════════════════════════════════════════════════════════
// KINDERGARTEN TEMPLATE - INTERACTIVE SCRIPT
// © 2025 Michael Ostermann
// ═════════════════════════════════════════════════════════════

(function() {
    'use strict';

    // ===== 1. FLOATING BUBBLES =====
    function initBubbles() {
        const container = document.querySelector('.bubbles-container');
        if (!container) return;

        const bubbleCount = 20;
        const colors = ['#FFD93D', '#FF6B35', '#6BCF7F', '#FFB4B4', '#A8E6CF', '#FFFFFF'];

        for (let i = 0; i < bubbleCount; i++) {
            const bubble = document.createElement('div');
            const size = Math.random() * 60 + 20;
            const left = Math.random() * 100;
            const duration = Math.random() * 10 + 10;
            const delay = Math.random() * 5;
            const color = colors[Math.floor(Math.random() * colors.length)];

            bubble.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                bottom: -100px;
                left: ${left}%;
                opacity: 0.3;
                animation: floatUp ${duration}s ease-in ${delay}s infinite;
                box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
            `;

            container.appendChild(bubble);
        }

        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatUp {
                0% {
                    transform: translateY(0) translateX(0) scale(1);
                    opacity: 0.3;
                }
                50% {
                    opacity: 0.5;
                }
                100% {
                    transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px) scale(0.8);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ===== 2. STATS COUNTER ANIMATION =====
    function animateStats() {
        const stats = document.querySelectorAll('.stat-number');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.getAttribute('data-target'));
                    animateValue(entry.target, 0, target, 2000);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        stats.forEach(stat => observer.observe(stat));
    }

    function animateValue(element, start, end, duration) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                element.textContent = end;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }

    // ===== 3. SCROLL REVEAL ANIMATIONS =====
    function initScrollReveal() {
        const elements = document.querySelectorAll('.feature-card, .team-card, .schedule-item');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        elements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(50px)';
            el.style.transition = 'all 0.6s ease-out';
            observer.observe(el);
        });
    }

    // ===== 4. GALLERY LOADING =====
    function loadGallery() {
        const gallery = document.getElementById('gallery-grid');
        if (!gallery) return;

        // ECHTE FREIE BILDER VON UNSPLASH - Kindergarten & Kinder
        const images = [
            {
                url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80',
                title: '🎨 Kreativraum - Malen & Basteln'
            },
            {
                url: 'https://images.unsplash.com/photo-1587616211892-534b9ed2f90e?w=800&q=80',
                title: '🧸 Spielzimmer - Freies Spielen'
            },
            {
                url: 'https://images.unsplash.com/photo-1601159480942-b7860aebf70c?w=800&q=80',
                title: '🌳 Außenbereich - Naturerlebnis'
            },
            {
                url: 'https://images.unsplash.com/photo-1560417192-63019cb27bdb?w=800&q=80',
                title: '🏃 Bewegungsraum - Sport & Toben'
            },
            {
                url: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&q=80',
                title: '🍎 Essensbereich - Gesunde Ernährung'
            },
            {
                url: 'https://images.unsplash.com/photo-1609909543619-34782456c89f?w=800&q=80',
                title: '😴 Ruheraum - Entspannung'
            },
            {
                url: 'https://images.unsplash.com/photo-1503919436814-8c0d2a7c4cc6?w=800&q=80',
                title: '📚 Leseecke - Geschichten entdecken'
            },
            {
                url: 'https://images.unsplash.com/photo-1602701778085-1265dd2c019e?w=800&q=80',
                title: '🎭 Rollenspielbereich - Fantasie leben'
            },
            {
                url: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=800&q=80',
                title: '🔬 Forscherecke - Experimentieren'
            }
        ];

        images.forEach((img, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.style.animationDelay = `${index * 0.1}s`;
            item.innerHTML = `
                <img src="${img.url}" alt="${img.title}">
                <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 1rem; background: linear-gradient(transparent, rgba(0,0,0,0.7)); color: white; font-weight: 700;">
                    ${img.title}
                </div>
            `;
            gallery.appendChild(item);
        });
    }

    // ===== 5. FORM HANDLING =====
    function initContactForm() {
        const form = document.querySelector('.contact-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const notification = document.createElement('div');
            notification.innerHTML = '✅ Vielen Dank! Wir melden uns in Kürze bei Ihnen.';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #6BCF7F 0%, #4CAF50 100%);
                color: white;
                padding: 1.5rem 3rem;
                border-radius: 15px;
                font-weight: 700;
                font-size: 1.1rem;
                z-index: 999999;
                box-shadow: 0 10px 40px rgba(76, 175, 80, 0.5);
                animation: slideDown 0.5s ease-out;
            `;

            document.body.appendChild(notification);

            setTimeout(() => {
                notification.style.animation = 'fadeOut 0.5s ease-in';
                setTimeout(() => notification.remove(), 500);
            }, 3000);

            form.reset();
        });
    }

    // ===== 6. BUTTON RIPPLE EFFECT =====
    function initButtonRipple() {
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.6);
                    top: ${y}px;
                    left: ${x}px;
                    pointer-events: none;
                    animation: ripple 0.6s ease-out;
                `;

                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);

                setTimeout(() => ripple.remove(), 600);
            });
        });

        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                0% { transform: scale(0); opacity: 1; }
                100% { transform: scale(4); opacity: 0; }
            }
            @keyframes slideDown {
                from { transform: translateX(-50%) translateY(-100px); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    // ===== 7. SMOOTH SCROLL =====
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    // ===== 8. PARALLAX EFFECT =====
    function initParallax() {
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    const hero = document.querySelector('.hero');
                    
                    if (hero) {
                        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
                    }
                    
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // ===== 9. SECTION HOVER EFFECTS =====
    function initSectionEffects() {
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            section.addEventListener('mouseenter', function() {
                this.style.transition = 'all 0.3s ease';
            });
        });
    }

    // ===== 10. CURSOR GLOW =====
    function initCursorGlow() {
        const glow = document.createElement('div');
        glow.className = 'cursor-glow';
        glow.style.cssText = `
            position: fixed;
            width: 200px;
            height: 200px;
            background: radial-gradient(circle, rgba(255,217,61,0.3) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transform: translate(-50%, -50%);
            transition: all 0.1s ease;
            mix-blend-mode: screen;
        `;
        document.body.appendChild(glow);

        document.addEventListener('mousemove', (e) => {
            glow.style.left = e.clientX + 'px';
            glow.style.top = e.clientY + 'px';
        });
    }

    // ===== INITIALIZATION =====
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        console.log('%c🎨 KINDERGARTEN TEMPLATE', 'background: #FFD93D; color: #2C3E50; font-size: 20px; padding: 10px; font-weight: bold;');
        console.log('%c© 2025 Michael Ostermann', 'font-size: 14px; color: #FF6B35; font-weight: bold;');

        // Initialize all features
        initBubbles();
        animateStats();
        initScrollReveal();
        loadGallery();
        initContactForm();
        initButtonRipple();
        initSmoothScroll();
        initParallax();
        initSectionEffects();
        initCursorGlow();

        // Initialize CMS if available
        if (typeof initInlineCMS === 'function') {
            initInlineCMS();
        }

        // Initialize Copyright Protection if available
        if (typeof initCopyrightProtection === 'function') {
            initCopyrightProtection();
        }
    }

    init();

})();

// ═════════════════════════════════════════════════════════════
// © 2025 Michael Ostermann - https://mcgv.de
// ═════════════════════════════════════════════════════════════

