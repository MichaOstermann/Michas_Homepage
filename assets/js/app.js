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

  // ============================================
  // 12. UNIVERSAL SEARCH BOOTSTRAP (global)
  //  - Fügt Such-Button + Modal ein, wenn nicht vorhanden
  //  - Lädt das Suchscript einmalig
  // ============================================
  (function bootstrapUniversalSearch(){
    const hasButton = !!document.getElementById('searchButton');
    const hasModal = !!document.getElementById('searchModal');

    // Button dynamisch einfügen (in Nav, falls vorhanden)
    if (!hasButton) {
      const createBtn = () => {
        const btn = document.createElement('button');
        btn.id = 'searchButton';
        btn.className = 'nav__link';
        btn.setAttribute('aria-label','Suche öffnen');
        btn.style.cssText = 'background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:.5rem;';
        btn.innerHTML = '<span aria-hidden="true" style="font-size:1rem">🔍</span><span style="font-size:.85rem;color:rgba(255,255,255,.6)">STRG+K</span>';
        return btn;
      };

      const btn = createBtn();
      // Einsortieren: bevorzugt #navMenu, sonst .nav, sonst Header rechts oben als Fallback
      const navMenuEl = document.getElementById('navMenu');
      const navEl = document.querySelector('.nav, nav, .nav__links');
      if (navMenuEl) {
        navMenuEl.appendChild(btn);
      } else if (navEl) {
        navEl.appendChild(btn);
      } else {
        // Fixed Fallback
        btn.style.position = 'fixed';
        btn.style.top = '10px';
        btn.style.right = '12px';
        btn.style.zIndex = '9999';
        document.body.appendChild(btn);
      }
    }

    // Modal einfügen
    if (!hasModal) {
      const modal = document.createElement('div');
      modal.id = 'searchModal';
      modal.style.cssText = 'display:none;opacity:0;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);backdrop-filter:blur(10px);z-index:10000;transition:opacity .3s ease;padding:2rem;';
      modal.innerHTML = `
        <div style="max-width:900px;margin:4rem auto 0;background:rgba(11,15,22,0.8);border:1px solid rgba(6,255,240,0.25);border-radius:16px;box-shadow:0 0 40px rgba(6,255,240,0.15);">
          <div style="display:flex;align-items:center;padding:1rem 1.25rem;border-bottom:1px solid rgba(6,255,240,0.2);gap:.75rem;">
            <span style="font-size:1.1rem">🔍</span>
            <input id="searchInput" type="text" placeholder="Durchsuche Blog, Scripts, Musik, Gaming & Templates…" style="flex:1;background:transparent;border:none;outline:none;color:#fff;font-size:1rem;" />
            <button id="searchClose" style="background:rgba(255,87,87,0.2);border:1px solid rgba(255,87,87,0.4);color:#FF5757;padding:.5rem 1rem;border-radius:8px;cursor:pointer;">Schließen</button>
          </div>
          <div id="searchResults" style="max-height:60vh;overflow-y:auto;padding:1.5rem;"></div>
          <div style="padding:0 1.5rem 1.25rem;color:rgba(255,255,255,0.4);font-size:.85rem;">Tipp: Verwende STRG+K zum schnellen Öffnen</div>
        </div>`;
      document.body.appendChild(modal);
    }

    // Script laden, wenn nicht bereits vorhanden
    const alreadyLoaded = Array.from(document.scripts).some(s => (s.src||'').includes('/assets/js/universal-search.js'));
    if (!alreadyLoaded) {
      const s = document.createElement('script');
      s.src = '/assets/js/universal-search.js';
      s.defer = true;
      document.body.appendChild(s);
    }
  })();

  // ============================================
  // 13. GLOBAL HEADER BOOTSTRAP (einheitliche obere Steuerleiste)
  //  - Baut eine moderne Navbar ein, wenn auf der Seite keine vorhanden ist
  //  - Stellt Active-Indicator + Progress-Bar sicher
  //  - Lädt CSS/JS (nav-modern.css, nav-enhanced.js) bei Bedarf nach
  // ============================================
  (function bootstrapGlobalHeader(){
    const hasHeader = !!document.querySelector('header.header .navbar');

    // CSS sicherstellen
    const hasNavCss = Array.from(document.styleSheets || []).some(s => (s.href||'').includes('nav-modern.css'))
      || Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some(l => (l.href||'').includes('nav-modern.css'));
    if (!hasNavCss) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/assets/css/nav-modern.css';
      document.head.appendChild(link);
    }

    if (!hasHeader) {
      const header = document.createElement('header');
      header.className = 'header';
      header.setAttribute('role','banner');
      header.innerHTML = `
        <nav class="nav container navbar" aria-label="Hauptnavigation">
          <a href="/" class="brand navbar-brand" aria-label="Startseite">
            <span class="brand-text">Codes, Beats, Scripts <span class="brand-amp">&amp;</span> more<span class="brand-dots">...</span></span>
          </a>
          <button class="nav__toggle menu-toggle" id="navToggle" aria-controls="navMenu" aria-expanded="false" aria-label="Navigation umschalten">
            <span class="nav__bar" aria-hidden="true"></span>
            <span class="nav__bar" aria-hidden="true"></span>
            <span class="nav__bar" aria-hidden="true"></span>
          </button>
          <ul class="nav__menu nav-menu" id="navMenu" role="menubar">
            <li role="none"><a role="menuitem" class="nav__link nav-link" href="/">Home</a></li>
            <li role="none"><a role="menuitem" class="nav__link nav-link" href="/Musik/">Music</a></li>
            <li role="none"><a role="menuitem" class="nav__link nav-link" href="/scripts/">PowerShell</a></li>
            <li role="none"><a role="menuitem" class="nav__link nav-link" href="/templates/">Templates</a></li>
            <li role="none"><a role="menuitem" class="nav__link nav-link" href="/gaming/">Gaming</a></li>
            <li role="none"><a role="menuitem" class="nav__link nav-link" href="/blog/">Blog</a></li>
            <li role="none"><a role="menuitem" class="nav__link nav-link" href="/index.html#newsletter">Newsletter</a></li>
            <li role="none"><a role="menuitem" class="nav__link nav-link" href="/index.html#about">About</a></li>
            <li role="none"><a role="menuitem" class="nav__link nav-link" href="/kontakt.html">Kontakt</a></li>
          </ul>
          <span class="nav__active-indicator" id="navActiveIndicator" aria-hidden="true"></span>
        </nav>
        <div class="nav-progress" id="navProgress" aria-hidden="true"></div>`;
      document.body.insertBefore(header, document.body.firstChild);
    } else {
      // Sicherstellen, dass die Deko-Elemente vorhanden sind
      if (!document.getElementById('navActiveIndicator')) {
        const nav = document.querySelector('.navbar');
        const span = document.createElement('span');
        span.id = 'navActiveIndicator';
        span.className = 'nav__active-indicator';
        span.setAttribute('aria-hidden','true');
        nav && nav.appendChild(span);
      }
      if (!document.getElementById('navProgress')) {
        const bar = document.createElement('div');
        bar.id = 'navProgress';
        bar.className = 'nav-progress';
        bar.setAttribute('aria-hidden','true');
        document.body.appendChild(bar);
      }
    }

    // JS laden: nav-enhanced.js (für Active-Indicator/Scroll-Bar)
    const hasNavJs = Array.from(document.scripts).some(s => (s.src||'').includes('/assets/js/nav-enhanced.js'));
    if (!hasNavJs) {
      const s = document.createElement('script');
      s.src = '/assets/js/nav-enhanced.js';
      s.defer = true;
      document.body.appendChild(s);
    }
  })();

})();
