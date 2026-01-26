// Smooth Micro-Interactions
(function() {
  'use strict';

  // Add interactive class to all buttons and links
  document.querySelectorAll('.btn, .chip, .badge').forEach(el => {
    if (!el.classList.contains('interactive')) {
      el.classList.add('interactive');
    }
  });

  // Add tooltip support
  document.querySelectorAll('[data-tooltip]').forEach(el => {
    if (!el.classList.contains('tooltip')) {
      el.classList.add('tooltip');
    }
  });

  // Verified badge pulse
  document.querySelectorAll('.badge--verified, [class*="Verified"]').forEach(el => {
    el.classList.add('badge-pulse');
  });

  // Stats number counter animation
  function animateNumber(el, target) {
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * easeOut);
      
      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(update);
  }

  // Animate stat numbers when visible
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count) || parseInt(el.textContent) || 0;
        if (target > 0 && !el.dataset.animated) {
          el.dataset.animated = 'true';
          animateNumber(el, target);
        }
        statObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-number, [id*="total"]').forEach(el => {
    el.classList.add('stat-number');
    statObserver.observe(el);
  });

  // Add floating animation to emojis
  document.querySelectorAll('[style*="font-size: 5rem"], [style*="font-size: 3.5rem"]').forEach((el, i) => {
    if (el.textContent.match(/[\u{1F300}-\u{1F9FF}]/u)) {
      el.classList.add('float');
      el.style.animationDelay = `${i * 0.3}s`;
    }
  });

  // Enhanced button clicks with ripple
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
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
        background: rgba(255,255,255,0.3);
        top: ${y}px;
        left: ${x}px;
        pointer-events: none;
        animation: ripple 0.6s ease-out;
      `;

      if (this.style.position !== 'absolute' && this.style.position !== 'relative') {
        this.style.position = 'relative';
      }
      this.style.overflow = 'hidden';

      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Add CSS for ripple
  if (!document.getElementById('ripple-animation')) {
    const style = document.createElement('style');
    style.id = 'ripple-animation';
    style.textContent = `
      @keyframes ripple {
        from {
          transform: scale(0);
          opacity: 1;
        }
        to {
          transform: scale(2);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

})();

