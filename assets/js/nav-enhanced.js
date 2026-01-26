/* nav-enhanced.js
   Provides: active indicator animation, scroll progress bar, section tracking, focus trap for mobile (future), reduced motion handling.
*/
(function() {
  const nav = document.querySelector('.navbar');
  const menu = document.getElementById('navMenu');
  const links = menu ? Array.from(menu.querySelectorAll('.nav__link')) : [];
  const indicator = document.getElementById('navActiveIndicator');
  const progress = document.getElementById('navProgress');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const halo = document.getElementById('navHoverHalo');

  if (!nav || !menu || !links.length || !indicator || !progress) return;

  let currentActive = links[0];
  let ticking = false;

  function setIndicator(target) {
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const width = rect.width;
    const left = rect.left - menuRect.left;
    indicator.style.width = width + 'px';
    indicator.style.transform = 'translateX(' + left + 'px)';
  }

  function updateActive(next) {
    if (!next) return;
    // Update aria-current for accessibility
    links.forEach(l => l.removeAttribute('aria-current'));
    next.setAttribute('aria-current', 'page');
    currentActive = next;
    setIndicator(currentActive);
  }

  // Initial indicator position after fonts load
  window.addEventListener('load', () => updateActive(currentActive));
  window.addEventListener('resize', () => setIndicator(currentActive));

  // Scroll shadow state
  function updateHeaderShadow() {
    if (window.scrollY > 4) {
      nav.parentElement.classList.add('header--scrolled');
    } else {
      nav.parentElement.classList.remove('header--scrolled');
    }
  }
  window.addEventListener('scroll', updateHeaderShadow, { passive: true });
  updateHeaderShadow();

  // Hover preview (optional decision: animate on hover then revert) - only if not reduced motion
  if (!prefersReduced) {
    links.forEach(l => {
      l.addEventListener('mouseenter', () => setIndicator(l));
      l.addEventListener('mouseleave', () => setIndicator(currentActive));
    });
  }

  // Cursor-follow hover halo (desktop only & not reduced motion)
  // Halo is not used in unified control-bar style; no-op

  // Click -> set active
  links.forEach(l => {
    l.addEventListener('click', () => {
      updateActive(l);
    });
  });

  // Mobile menu: focus trap + ESC + auto-close
  const toggle = document.getElementById('navToggle');
  let trapPrevFocus = null;

  function isMobile() {
    return window.matchMedia('(max-width: 820px)').matches;
  }

  function openMenu() {
    document.body.classList.add('nav-open');
    toggle.setAttribute('aria-expanded', 'true');
    menu.hidden = false;
    trapPrevFocus = document.activeElement;
    // focus first link
    const first = links[0];
    first && first.focus();
    document.addEventListener('keydown', onKeydown);
  }

  function closeMenu() {
    document.body.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    menu.hidden = false; // keep visible but CSS can collapse
    document.removeEventListener('keydown', onKeydown);
    if (trapPrevFocus) toggle.focus();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') {
      closeMenu();
      return;
    }
    if (e.key === 'Tab') {
      // simple trap within menu
      const focusables = links;
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      if (expanded) closeMenu(); else openMenu();
    });
  }

  // Auto-close after clicking a link (on mobile)
  links.forEach(l => l.addEventListener('click', () => { if (isMobile()) closeMenu(); }));

  // Section tracking via IntersectionObserver
  const sectionTargets = links
    .map(l => document.querySelector(l.getAttribute('href')))
    .filter(Boolean);

  const observer = new IntersectionObserver((entries) => {
    // choose the one with highest intersection ratio & isIntersecting
    const visible = entries.filter(e => e.isIntersecting).sort((a,b)=> b.intersectionRatio - a.intersectionRatio);
    if (visible.length) {
      const id = '#' + visible[0].target.id;
      const match = links.find(l => l.getAttribute('href') === id);
      if (match && match !== currentActive) {
        updateActive(match);
        // Pulse indicator once on section switch
        indicator.classList.add('is-pulsing');
        setTimeout(() => indicator.classList.remove('is-pulsing'), 650);
      }
    }
  }, { rootMargin: '0px 0px -55% 0px', threshold: [0.2,0.4,0.6,0.8] });

  sectionTargets.forEach(sec => observer.observe(sec));

  // Scroll progress
  function updateProgress() {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || window.pageYOffset;
    const max = doc.scrollHeight - doc.clientHeight;
    const ratio = max > 0 ? scrollTop / max : 0;
    progress.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
    progress.style.setProperty('--ratio', ratio.toFixed(4));
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }, { passive: true });

  // If user jumps via hash link before load
  if (window.location.hash) {
    const match = links.find(l => l.getAttribute('href') === window.location.hash);
    if (match) updateActive(match);
    else setIndicator(currentActive);
  }

  // Expose minimal API (for future mobile drawer integration)
  window.CBNav = {
    refresh: () => setIndicator(currentActive),
    setActiveByHref: (href) => {
      const match = links.find(l => l.getAttribute('href') === href);
      if (match) updateActive(match);
    }
  };
})();
