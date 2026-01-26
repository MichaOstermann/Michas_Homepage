// CODE & BEATS - Interactive Features
// Modern ES6+ JavaScript

(function() {
  'use strict';

  // ============================================
  // 1. MOBILE NAVIGATION
  // ============================================

  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('is-active');
      document.body.style.overflow = isExpanded ? '' : 'hidden';
    });

    // Close menu when clicking nav links
    const navLinks = navMenu.querySelectorAll('.nav__link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('is-active');
        document.body.style.overflow = '';
      });
    });
  }

  // ============================================
  // 2. ACTIVE NAV ON SCROLL (IntersectionObserver)
  // ============================================

  const sections = document.querySelectorAll('section[id]');
  const navLinksAll = document.querySelectorAll('.nav__link');

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinksAll.forEach(link => {
          link.classList.remove('is-active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('is-active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

  // ============================================
  // 3. SCROLL REVEAL (handled by assets/js/reveal.js)
  // ============================================

  // ============================================
  // 4. THEME TOGGLE
  // ============================================

  const themeToggles = document.querySelectorAll('#themeToggle, #footerThemeToggle');
  const currentTheme = localStorage.getItem('theme') || 'dark';

  document.documentElement.setAttribute('data-theme', currentTheme);
  themeToggles.forEach(btn => {
    btn.setAttribute('aria-pressed', currentTheme === 'light');
  });

  themeToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const newTheme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      themeToggles.forEach(b => {
        b.setAttribute('aria-pressed', newTheme === 'light');
      });
    });
  });

  // ============================================
  // 5. TABS SYSTEM
  // ============================================

  const tabs = document.querySelectorAll('.tab');
  const tabPanels = document.querySelectorAll('.tabpanel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetPanel = tab.getAttribute('data-tab');

      // Deactivate all
      tabs.forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tabPanels.forEach(p => {
        p.classList.remove('is-active');
        p.setAttribute('hidden', '');
      });

      // Activate clicked
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      const panel = document.querySelector(`[data-panel="${targetPanel}"]`);
      if (panel) {
        panel.classList.add('is-active');
        panel.removeAttribute('hidden');
      }
    });
  });

  // ============================================
  // 6. FILTER SYSTEM (Music, Gaming)
  // ============================================

  const filterButtons = document.querySelectorAll('[data-filter], [data-g]');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter') || btn.getAttribute('data-g');
      const category = btn.hasAttribute('data-filter') ? 'data-category' : 'data-gc';
      const cards = document.querySelectorAll(`[${category}]`);

      // Update button states
      btn.parentElement.querySelectorAll('.chip').forEach(c => {
        c.setAttribute('aria-pressed', 'false');
      });
      btn.setAttribute('aria-pressed', 'true');

      // Filter cards
      cards.forEach(card => {
        if (filter === 'all' || card.getAttribute(category) === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ============================================
  // 7. BOT WIDGET
  // ============================================

  const botFab = document.getElementById('botFab');
  const botPanel = document.getElementById('botPanel');
  const botClose = document.getElementById('botClose');
  const botActions = document.querySelectorAll('[data-bot]');
  const botResults = document.getElementById('botResults');

  const toggleBot = (show) => {
    if (show) {
      botPanel.removeAttribute('hidden');
      botFab.setAttribute('aria-expanded', 'true');
    } else {
      botPanel.setAttribute('hidden', '');
      botFab.setAttribute('aria-expanded', 'false');
    }
  };

  if (botFab) {
    botFab.addEventListener('click', () => {
      const isOpen = botFab.getAttribute('aria-expanded') === 'true';
      toggleBot(!isOpen);
    });
  }

  if (botClose) {
    botClose.addEventListener('click', () => toggleBot(false));
  }

  // ESC key closes bot
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && botFab.getAttribute('aria-expanded') === 'true') {
      toggleBot(false);
    }
  });

  // Bot Actions
  botActions.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-bot');
      let message = '';

      switch(action) {
        case 'songs':
          message = '<strong>Neueste Songs:</strong><br>1. Neon Skyline<br>2. Late Night Bytes<br>3. Quantum Drift';
          break;
        case 'scripts':
          message = '<strong>Letzte Skripte:</strong><br>• MailStore Analyse<br>• WSUS Scan<br>• AD User Tool';
          break;
        case 'gaming':
          message = '<strong>Gaming Highlights:</strong><br>→ Boss Guide: Neon Titan<br>→ Review: Cyber Drift';
          break;
      }

      botResults.innerHTML = message;
    });
  });

  // ============================================
  // 8. FORM VALIDATION
  // ============================================

  const contactForm = document.getElementById('contactForm');
  const formHint = document.getElementById('formHint');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const msg = document.getElementById('msg').value.trim();

      if (!name || !email || !msg) {
        formHint.textContent = 'Bitte alle Felder ausfüllen.';
        formHint.style.color = 'var(--neon-pink)';
        return;
      }

      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        formHint.textContent = 'Bitte gültige E-Mail-Adresse eingeben.';
        formHint.style.color = 'var(--neon-pink)';
        return;
      }

      formHint.textContent = 'Nachricht gesendet! ✓';
      formHint.style.color = 'var(--neon-cyan)';
      contactForm.reset();

      setTimeout(() => {
        formHint.textContent = '';
      }, 3000);
    });
  }

  // ============================================
  // 9. HERO CANVAS VISUALIZATION (handled by assets/js/heroViz.js)
  // ============================================

  // ============================================
  // 10. FOOTER YEAR
  // ============================================

  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // ============================================
  // 11. PRISM AUTO-HIGHLIGHT
  // ============================================

  if (typeof Prism !== 'undefined') {
    Prism.highlightAll();
  }

})();
