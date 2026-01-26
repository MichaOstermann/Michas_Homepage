// enhancements.js - Interactive features & UI enhancements
// Handles: Navigation, Filters, Bot Widget, Forms, Theme Toggle

class SiteEnhancements {
  constructor() {
    this.initNavigation();
    this.initFilters();
    this.initBotWidget();
    this.initContactForm();
    this.initThemeToggle();
    this.initSmoothScroll();
    this.initTabSystem();
    this.initYear();
  }

  // ============================================
  // NAVIGATION
  // ============================================
  initNavigation() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    const links = document.querySelectorAll('.nav__link');

    if (!toggle || !menu) return;

    // Mobile menu toggle
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !expanded);
      menu.classList.toggle('is-open');
      document.body.classList.toggle('nav-open');
    });

    // Close menu on link click (mobile)
    links.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 768) {
          toggle.setAttribute('aria-expanded', 'false');
          menu.classList.remove('is-open');
          document.body.classList.remove('nav-open');
        }
      });
    });

    // Active link highlighting on scroll
    const sections = document.querySelectorAll('section[id]');
    
    const highlightNav = () => {
      const scrollY = window.pageYOffset;

      sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav__link[href="#${sectionId}"]`);

        if (navLink && scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          links.forEach(l => l.classList.remove('active'));
          navLink.classList.add('active');
        }
      });
    };

    window.addEventListener('scroll', throttle(highlightNav, 100));
    highlightNav(); // Initial check
  }

  // ============================================
  // SMOOTH SCROLL
  // ============================================
  initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
          const offsetTop = target.offsetTop - 80; // Account for fixed header
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // ============================================
  // MUSIC FILTERS
  // ============================================
  initFilters() {
    // Music filters
    const musicFilters = document.querySelectorAll('.playlist .chip[data-filter]');
    const musicCards = document.querySelectorAll('.music-card');

    musicFilters.forEach(filter => {
      filter.addEventListener('click', () => {
        const category = filter.dataset.filter;
        
        // Update active state
        musicFilters.forEach(f => f.setAttribute('aria-pressed', 'false'));
        filter.setAttribute('aria-pressed', 'true');

        // Filter cards
        musicCards.forEach(card => {
          const cardCategory = card.dataset.category;
          
          if (category === 'all' || cardCategory === category) {
            card.style.display = '';
            if (typeof gsap !== 'undefined') {
              gsap.fromTo(card, 
                { opacity: 0, scale: 0.9, y: 20 },
                { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.4)" }
              );
            }
          } else {
            if (typeof gsap !== 'undefined') {
              gsap.to(card, {
                opacity: 0,
                scale: 0.9,
                y: -20,
                duration: 0.3,
                onComplete: () => {
                  card.style.display = 'none';
                }
              });
            } else {
              card.style.display = 'none';
            }
          }
        });
      });
    });

    // Gaming filters
    const gamingFilters = document.querySelectorAll('.filters .chip[data-g]');
    const gamingCards = document.querySelectorAll('.gaming-card');

    gamingFilters.forEach(filter => {
      filter.addEventListener('click', () => {
        const category = filter.dataset.g;
        
        gamingFilters.forEach(f => f.setAttribute('aria-pressed', 'false'));
        filter.setAttribute('aria-pressed', 'true');

        gamingCards.forEach(card => {
          const cardCategory = card.dataset.gc;
          
          if (category === 'all' || cardCategory === category) {
            card.style.display = '';
            if (typeof gsap !== 'undefined') {
              gsap.fromTo(card, 
                { opacity: 0, scale: 0.9 },
                { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.4)" }
              );
            }
          } else {
            if (typeof gsap !== 'undefined') {
              gsap.to(card, {
                opacity: 0,
                scale: 0.9,
                duration: 0.3,
                onComplete: () => card.style.display = 'none'
              });
            } else {
              card.style.display = 'none';
            }
          }
        });
      });
    });
  }

  // ============================================
  // TAB SYSTEM (PowerShell)
  // ============================================
  initTabSystem() {
    const tabs = document.querySelectorAll('.tab[data-tab]');
    const panels = document.querySelectorAll('.tabpanel[data-panel]');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetPanel = tab.dataset.tab;

        // Update tabs
        tabs.forEach(t => {
          t.classList.remove('is-active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');

        // Update panels
        panels.forEach(panel => {
          panel.classList.remove('is-active');
          panel.hidden = true;
        });

        const activePanel = document.querySelector(`[data-panel="${targetPanel}"]`);
        if (activePanel) {
          activePanel.classList.add('is-active');
          activePanel.hidden = false;

          // Animate cards in active panel
          const cards = activePanel.querySelectorAll('.card');
          if (typeof gsap !== 'undefined') {
            gsap.fromTo(cards,
              { opacity: 0, y: 30 },
              { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
            );
          }
        }
      });
    });
  }

  // ============================================
  // BOT WIDGET
  // ============================================
  initBotWidget() {
    const fab = document.getElementById('botFab');
    const panel = document.getElementById('botPanel');
    const closeBtn = document.getElementById('botClose');
    const actionBtns = document.querySelectorAll('[data-bot]');
    const results = document.getElementById('botResults');

    if (!fab || !panel) return;

    // Open bot panel
    fab.addEventListener('click', () => {
      const isHidden = panel.hidden;
      panel.hidden = !isHidden;
      fab.setAttribute('aria-expanded', isHidden);
      
      if (isHidden) {
        if (typeof gsap !== 'undefined') {
          gsap.fromTo(panel,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
          );
        }
      }
    });

    // Close bot panel
    closeBtn?.addEventListener('click', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(panel, {
          y: 20,
          opacity: 0,
          duration: 0.2,
          onComplete: () => {
            panel.hidden = true;
            fab.setAttribute('aria-expanded', 'false');
          }
        });
      } else {
        panel.hidden = true;
        fab.setAttribute('aria-expanded', 'false');
      }
    });

    // Bot actions
    actionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.bot;
        this.handleBotAction(action, results);
      });
    });
  }

  handleBotAction(action, resultsEl) {
    if (!resultsEl) return;

    // Show loading
    resultsEl.innerHTML = '<p class="loading">Lade...</p>';

    setTimeout(() => {
      let content = '';

      switch(action) {
        case 'songs':
          content = `
            <div class="bot-result">
              <h3>Neueste Songs</h3>
              <ul>
                <li>🎵 Neon Skyline (Synth)</li>
                <li>🎵 Late Night Bytes (Lo-Fi)</li>
                <li>🎵 Quantum Drift (Ambient)</li>
              </ul>
              <a href="#music" class="btn btn--glass btn--sm">Alle Songs ansehen</a>
            </div>
          `;
          break;

        case 'scripts':
          content = `
            <div class="bot-result">
              <h3>Letzte Skripte</h3>
              <ul>
                <li>💻 MailStore Analyse</li>
                <li>💻 WSUS Scan</li>
                <li>💻 AD User Creation Tool v4.0</li>
              </ul>
              <a href="#powershell" class="btn btn--glass btn--sm">Alle Skripte ansehen</a>
            </div>
          `;
          break;

        case 'gaming':
          content = `
            <div class="bot-result">
              <h3>Gaming Highlights</h3>
              <ul>
                <li>🎮 Boss Guide: Neon Titan</li>
                <li>🎮 Review: Cyber Drift</li>
                <li>🎮 Clip: Perfect Run</li>
              </ul>
              <a href="#gaming" class="btn btn--glass btn--sm">Zum Gaming-Bereich</a>
            </div>
          `;
          break;
      }

      resultsEl.innerHTML = content;
      
      // Animate result
      if (typeof gsap !== 'undefined') {
        gsap.fromTo('.bot-result',
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4 }
        );
      }
    }, 800);
  }

  // ============================================
  // CONTACT FORM
  // ============================================
  initContactForm() {
    const form = document.getElementById('contactForm');
    const hint = document.getElementById('formHint');

    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const name = formData.get('name');
      const email = formData.get('email');
      const msg = formData.get('msg');

      // Simple validation
      if (!name || !email || !msg) {
        this.showFormHint(hint, 'Bitte fülle alle Felder aus.', 'error');
        return;
      }

      // Simulate sending
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        this.showFormHint(hint, '✓ Nachricht erfolgreich gesendet!', 'success');
        form.reset();

        // Clear hint after 5s
        setTimeout(() => {
          hint.textContent = '';
          hint.className = 'form__hint txt-dim';
        }, 5000);
      }, 1500);
    });
  }

  showFormHint(el, message, type) {
    if (!el) return;
    el.textContent = message;
    el.className = `form__hint txt-dim form__hint--${type}`;
  }

  // ============================================
  // THEME TOGGLE
  // ============================================
  initThemeToggle() {
    const toggles = document.querySelectorAll('#themeToggle, #footerThemeToggle');
    const root = document.documentElement;

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    root.setAttribute('data-theme', savedTheme);

    toggles.forEach(toggle => {
      toggle.setAttribute('aria-pressed', savedTheme === 'light');
      
      toggle.addEventListener('click', () => {
        const currentTheme = root.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        root.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        toggles.forEach(t => {
          t.setAttribute('aria-pressed', newTheme === 'light');
        });

        // Animate transition
        if (typeof gsap !== 'undefined') {
          gsap.fromTo('body',
            { opacity: 0.95 },
            { opacity: 1, duration: 0.3 }
          );
        }
      });
    });
  }

  // ============================================
  // FOOTER YEAR
  // ============================================
  initYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }
}

// ============================================
// INITIALIZE WHEN READY
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Wait for GSAP to load
  const init = () => {
    if (typeof gsap !== 'undefined') {
      new SiteEnhancements();
    } else {
      setTimeout(init, 100);
    }
  };
  
  init();
});

// ============================================
// PERFORMANCE: Lazy load images on scroll
// ============================================
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        imageObserver.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

// ============================================
// PERFORMANCE: Throttle scroll events
// ============================================
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ============================================
// EASTER EGG: Konami Code
// ============================================
let konamiCode = [];
const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
  konamiCode.push(e.key);
  konamiCode = konamiCode.slice(-10);

  if (konamiCode.join(',') === konamiPattern.join(',')) {
    activateEasterEgg();
  }
});

function activateEasterEgg() {
  const alien = document.querySelector('.alien-svg');
  if (!alien || typeof gsap === 'undefined') return;

  // Rainbow color cycle
  let hue = 0;
  const interval = setInterval(() => {
    hue = (hue + 5) % 360;
    document.documentElement.style.setProperty('--neon-cyan', `hsl(${hue}, 100%, 50%)`);
    document.documentElement.style.setProperty('--neon-violet', `hsl(${(hue + 120) % 360}, 100%, 50%)`);
  }, 50);

  // Alien dance
  gsap.to(alien, {
    rotation: 360,
    scale: 1.2,
    duration: 2,
    ease: "elastic.out(1, 0.3)",
    onComplete: () => {
      clearInterval(interval);
      document.documentElement.style.removeProperty('--neon-cyan');
      document.documentElement.style.removeProperty('--neon-violet');
      gsap.to(alien, { rotation: 0, scale: 1, duration: 0.5 });
    }
  });

  console.log('🎮 Easter Egg activated! Konami Code detected!');
}
