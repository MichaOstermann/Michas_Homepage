// ═════════════════════════════════════════════════════════════
// TIERHEIM TEMPLATE - INTERACTIVE SCRIPT
// © 2025 Michael Ostermann
// ═════════════════════════════════════════════════════════════

(function() {
    'use strict';

    // ===== TIER-DATEN =====
    const animals = [
        {
            id: 1,
            name: 'Luna',
            type: 'hunde',
            breed: 'Golden Retriever Mix',
            age: '3 Jahre',
            gender: 'Weiblich',
            image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&q=80',
            description: 'Luna ist eine freundliche und verspielte Hündin, die es liebt mit Kindern zu spielen.',
            badge: 'NEU'
        },
        {
            id: 2,
            name: 'Max',
            type: 'hunde',
            breed: 'Deutscher Schäferhund',
            age: '5 Jahre',
            gender: 'Männlich',
            image: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=800&q=80',
            description: 'Max ist ein treuer Begleiter, der ein aktives Zuhause sucht.',
            badge: ''
        },
        {
            id: 3,
            name: 'Bella',
            type: 'katzen',
            breed: 'Europäisch Kurzhaar',
            age: '2 Jahre',
            gender: 'Weiblich',
            image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&q=80',
            description: 'Bella ist eine verschmuste Katze, die gerne Streicheleinheiten bekommt.',
            badge: 'NEU'
        },
        {
            id: 4,
            name: 'Felix',
            type: 'katzen',
            breed: 'Maine Coon Mix',
            age: '4 Jahre',
            gender: 'Männlich',
            image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80',
            description: 'Felix ist ein ruhiger Kater, der ein gemütliches Zuhause sucht.',
            badge: ''
        },
        {
            id: 5,
            name: 'Rocky',
            type: 'hunde',
            breed: 'Jack Russell Terrier',
            age: '6 Jahre',
            gender: 'Männlich',
            image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80',
            description: 'Rocky ist ein energiegeladener kleiner Hund mit viel Charakter.',
            badge: ''
        },
        {
            id: 6,
            name: 'Mimi',
            type: 'katzen',
            breed: 'Siam Mix',
            age: '1 Jahr',
            gender: 'Weiblich',
            image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=800&q=80',
            description: 'Mimi ist eine junge, verspielte Katze, die gerne klettert.',
            badge: 'NEU'
        },
        {
            id: 7,
            name: 'Hoppel',
            type: 'kleintiere',
            breed: 'Zwergkaninchen',
            age: '2 Jahre',
            gender: 'Männlich',
            image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800&q=80',
            description: 'Hoppel ist ein freundliches Kaninchen, das gerne Gesellschaft hat.',
            badge: ''
        },
        {
            id: 8,
            name: 'Charlie',
            type: 'hunde',
            breed: 'Beagle Mix',
            age: '4 Jahre',
            gender: 'Männlich',
            image: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=800&q=80',
            description: 'Charlie ist ein fröhlicher Hund, der gerne spazieren geht.',
            badge: ''
        },
        {
            id: 9,
            name: 'Schnurri',
            type: 'kleintiere',
            breed: 'Meerschweinchen',
            age: '1 Jahr',
            gender: 'Weiblich',
            image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&q=80',
            description: 'Schnurri ist ein niedliches Meerschweinchen, das mit Artgenossen leben möchte.',
            badge: 'NEU'
        }
    ];

    // ===== ERFOLGSGESCHICHTEN =====
    const stories = [
        {
            name: 'Bruno findet sein Glück',
            before: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80',
            after: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&q=80',
            description: 'Bruno kam als Fundhund zu uns und hat nun eine liebevolle Familie gefunden, die ihn nie mehr hergeben möchte! ❤️'
        },
        {
            name: 'Whiskers neues Zuhause',
            before: 'https://images.unsplash.com/photo-1529257414772-1960b7bea4eb?w=400&q=80',
            after: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&q=80',
            description: 'Whiskers war sehr schüchtern, aber in ihrem neuen Zuhause blüht sie richtig auf! Eine echte Erfolgsgeschichte. 😊'
        },
        {
            name: 'Buddy & seine Menschen',
            before: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=400&q=80',
            after: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=800&q=80',
            description: 'Buddy wurde ausgesetzt und fand bei uns Zuflucht. Heute lebt er glücklich mit seiner neuen Familie! 🐕'
        }
    ];

    // ===== 1. FLOATING PAWS =====
    function initFloatingPaws() {
        const container = document.querySelector('.paws-container');
        if (!container) return;

        const pawCount = 15;
        const pawEmojis = ['🐾', '🐾', '🐾'];

        for (let i = 0; i < pawCount; i++) {
            const paw = document.createElement('div');
            const size = Math.random() * 40 + 20;
            const left = Math.random() * 100;
            const duration = Math.random() * 15 + 15;
            const delay = Math.random() * 10;
            const emoji = pawEmojis[Math.floor(Math.random() * pawEmojis.length)];

            paw.textContent = emoji;
            paw.style.cssText = `
                position: absolute;
                font-size: ${size}px;
                bottom: -100px;
                left: ${left}%;
                opacity: 0.3;
                animation: floatUp ${duration}s ease-in ${delay}s infinite;
            `;

            container.appendChild(paw);
        }

        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatUp {
                0% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 0.3;
                }
                50% {
                    opacity: 0.5;
                }
                100% {
                    transform: translateY(-100vh) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ===== 2. STATS COUNTER =====
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

    // ===== 3. TIERE LADEN =====
    function loadAnimals(filter = 'all') {
        const grid = document.getElementById('animalsGrid');
        if (!grid) return;

        grid.innerHTML = '';

        const filtered = filter === 'all' ? animals : animals.filter(a => a.type === filter);

        filtered.forEach((animal, index) => {
            const card = document.createElement('div');
            card.className = 'animal-card';
            card.style.opacity = '0';
            card.style.transform = 'translateY(50px)';
            card.style.transition = 'all 0.6s ease-out';
            
            card.innerHTML = `
                <div class="animal-image" style="background-image: url('${animal.image}')">
                    ${animal.badge ? `<div class="animal-badge">${animal.badge}</div>` : ''}
                </div>
                <div class="animal-content">
                    <h3 class="animal-name">${animal.name}</h3>
                    <p class="animal-info">${animal.breed} • ${animal.age} • ${animal.gender}</p>
                    <p class="animal-description">${animal.description}</p>
                    <button class="btn btn-primary" onclick="alert('Kontaktieren Sie uns für ${animal.name}!')">Mehr erfahren</button>
                </div>
            `;

            grid.appendChild(card);

            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    // ===== 4. FILTER TABS =====
    function initFilterTabs() {
        const buttons = document.querySelectorAll('.filter-btn');
        
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                buttons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                const filter = this.getAttribute('data-filter');
                loadAnimals(filter);
            });
        });
    }

    // ===== 5. ERFOLGSGESCHICHTEN LADEN =====
    function loadStories() {
        const grid = document.getElementById('storiesGrid');
        if (!grid) return;

        stories.forEach((story, index) => {
            const card = document.createElement('div');
            card.className = 'story-card';
            card.style.opacity = '0';
            card.style.transform = 'translateY(50px)';
            card.style.transition = 'all 0.6s ease-out';
            
            card.innerHTML = `
                <div class="story-images">
                    <div class="story-img" style="background-image: url('${story.before}')"></div>
                    <div class="story-img" style="background-image: url('${story.after}')"></div>
                </div>
                <div class="story-content">
                    <h3>${story.name}</h3>
                    <p>${story.description}</p>
                </div>
            `;

            grid.appendChild(card);

            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 150);
        });
    }

    // ===== 6. SMOOTH SCROLL =====
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

    // ===== 7. NAVBAR SCROLL =====
    function initNavbarScroll() {
        const navbar = document.querySelector('.navbar');

        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 100) {
                navbar.style.padding = '0.5rem 0';
                navbar.style.boxShadow = '0 5px 30px rgba(255, 107, 157, 0.3)';
            } else {
                navbar.style.padding = '1rem 0';
                navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
            }
        });
    }

    // ===== 8. MOBILE MENU =====
    function initMobileMenu() {
        const toggle = document.getElementById('navToggle');
        const menu = document.getElementById('navMenu');

        if (toggle && menu) {
            toggle.addEventListener('click', () => {
                menu.classList.toggle('active');
                toggle.classList.toggle('active');
            });

            menu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    menu.classList.remove('active');
                    toggle.classList.remove('active');
                });
            });
        }
    }

    // ===== 9. FORM HANDLING =====
    function initContactForm() {
        const form = document.querySelector('.contact-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const notification = document.createElement('div');
            notification.innerHTML = '❤️ Vielen Dank! Wir melden uns schnellstmöglich bei Ihnen.';
            notification.style.cssText = `
                position: fixed;
                top: 100px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #FF6B9D 0%, #FF1493 100%);
                color: white;
                padding: 1.5rem 3rem;
                border-radius: 20px;
                font-weight: 700;
                font-size: 1.1rem;
                z-index: 999999;
                box-shadow: 0 10px 40px rgba(255, 107, 157, 0.5);
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

    // ===== 10. SCROLL REVEAL =====
    function initScrollReveal() {
        const elements = document.querySelectorAll('.service-card, .step-card, .help-card, .team-card, .value-item');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 50);
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

    // ===== 11. BUTTON RIPPLE =====
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

    // ===== 12. PARALLAX =====
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

    // ===== INITIALIZATION =====
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        console.log('%c🐾 TIERHEIM TEMPLATE', 'background: #FF6B9D; color: white; font-size: 20px; padding: 10px; font-weight: bold;');
        console.log('%c© 2025 Michael Ostermann', 'font-size: 14px; color: #4ECDC4; font-weight: bold;');

        // Initialize all features
        initFloatingPaws();
        animateStats();
        loadAnimals();
        initFilterTabs();
        loadStories();
        initSmoothScroll();
        initNavbarScroll();
        initMobileMenu();
        initContactForm();
        initScrollReveal();
        initButtonRipple();
        initParallax();

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



