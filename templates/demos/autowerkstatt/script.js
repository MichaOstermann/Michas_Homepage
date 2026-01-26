// ═════════════════════════════════════════════════════════════
// KFZ WERKSTATT TEMPLATE - INTERACTIVE SCRIPT
// © 2025 Michael Ostermann
// ═════════════════════════════════════════════════════════════

(function() {
    'use strict';

    // ===== 1. STATS COUNTER ANIMATION =====
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
                element.textContent = end.toLocaleString('de-DE');
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toLocaleString('de-DE');
            }
        }, 16);
    }

    // ===== 2. SCROLL REVEAL ANIMATIONS =====
    function initScrollReveal() {
        const elements = document.querySelectorAll('.service-card, .team-card, .feature-item');
        
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

    // ===== 3. SMOOTH SCROLL =====
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const navHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = target.offsetTop - navHeight;
                    window.scrollTo({ 
                        top: targetPosition, 
                        behavior: 'smooth' 
                    });
                }
            });
        });
    }

    // ===== 4. NAVBAR SCROLL EFFECT =====
    function initNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 100) {
                navbar.style.padding = '0.5rem 0';
                navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.3)';
            } else {
                navbar.style.padding = '1rem 0';
                navbar.style.boxShadow = 'none';
            }

            lastScroll = currentScroll;
        });
    }

    // ===== 5. MOBILE MENU TOGGLE =====
    function initMobileMenu() {
        const toggle = document.getElementById('navToggle');
        const menu = document.getElementById('navMenu');

        if (toggle && menu) {
            toggle.addEventListener('click', () => {
                menu.classList.toggle('active');
                toggle.classList.toggle('active');
            });

            // Close menu when clicking a link
            menu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    menu.classList.remove('active');
                    toggle.classList.remove('active');
                });
            });
        }
    }

    // ===== 6. FORM HANDLING =====
    function initContactForm() {
        const form = document.querySelector('.contact-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const notification = document.createElement('div');
            notification.innerHTML = '✅ Vielen Dank! Wir melden uns schnellstmöglich bei Ihnen.';
            notification.style.cssText = `
                position: fixed;
                top: 100px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #27AE60 0%, #229954 100%);
                color: white;
                padding: 1.5rem 3rem;
                border-radius: 15px;
                font-weight: 700;
                font-size: 1.1rem;
                z-index: 999999;
                box-shadow: 0 10px 40px rgba(39, 174, 96, 0.5);
                animation: slideDown 0.5s ease-out;
            `;

            document.body.appendChild(notification);

            setTimeout(() => {
                notification.style.animation = 'fadeOut 0.5s ease-in';
                setTimeout(() => notification.remove(), 500);
            }, 4000);

            form.reset();
        });
    }

    // ===== 7. BUTTON RIPPLE EFFECT =====
    function initButtonRipple() {
        const buttons = document.querySelectorAll('.btn, button');
        
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

    // ===== 8. PARALLAX EFFECT =====
    function initParallax() {
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    const hero = document.querySelector('.hero');
                    
                    if (hero) {
                        hero.style.backgroundPositionY = `${scrolled * 0.5}px`;
                    }
                    
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // ===== 9. SERVICE CARDS HOVER SOUND EFFECT =====
    function initServiceCardEffects() {
        const cards = document.querySelectorAll('.service-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            });
        });
    }

    // ===== 10. CURSOR TRAIL EFFECT =====
    function initCursorTrail() {
        const coords = { x: 0, y: 0 };
        const circles = [];
        const colors = ['#E74C3C', '#F39C12', '#27AE60'];

        for (let i = 0; i < 12; i++) {
            const circle = document.createElement('div');
            circle.style.cssText = `
                position: fixed;
                width: ${8 - i * 0.5}px;
                height: ${8 - i * 0.5}px;
                border-radius: 50%;
                background: ${colors[i % colors.length]};
                pointer-events: none;
                z-index: 99999;
                transition: all 0.1s ease;
                opacity: ${1 - i * 0.08};
            `;
            circles.push(circle);
            document.body.appendChild(circle);
        }

        document.addEventListener('mousemove', (e) => {
            coords.x = e.clientX;
            coords.y = e.clientY;
        });

        function animateCircles() {
            let x = coords.x;
            let y = coords.y;

            circles.forEach((circle, index) => {
                circle.style.left = x - 4 + 'px';
                circle.style.top = y - 4 + 'px';
                circle.style.transform = `scale(${(circles.length - index) / circles.length})`;

                const nextCircle = circles[index + 1] || circles[0];
                x += (parseInt(nextCircle.style.left || x) - x) * 0.3;
                y += (parseInt(nextCircle.style.top || y) - y) * 0.3;
            });

            requestAnimationFrame(animateCircles);
        }

        animateCircles();
    }

    // ===== 11. SECTION FADE IN ON SCROLL =====
    function initSectionFade() {
        const sections = document.querySelectorAll('section');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        sections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            section.style.transition = 'all 0.8s ease-out';
            observer.observe(section);
        });
    }

    // ===== 12. ACTIVE NAV LINK HIGHLIGHT =====
    function initActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-menu a');

        window.addEventListener('scroll', () => {
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (pageYOffset >= (sectionTop - 100)) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').includes(current)) {
                    link.classList.add('active');
                }
            });
        });
    }

    // ===== INITIALIZATION =====
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        console.log('%c🔧 KFZ WERKSTATT TEMPLATE', 'background: #E74C3C; color: white; font-size: 20px; padding: 10px; font-weight: bold;');
        console.log('%c© 2025 Michael Ostermann', 'font-size: 14px; color: #F39C12; font-weight: bold;');

        // Initialize all features
        animateStats();
        initScrollReveal();
        initSmoothScroll();
        initNavbarScroll();
        initMobileMenu();
        initContactForm();
        initButtonRipple();
        initParallax();
        initServiceCardEffects();
        initCursorTrail();
        initSectionFade();
        initActiveNavLink();

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



