// ═══════════════════════════════════════════════════════════════════
// HOGWARTS TEMPLATE SCRIPTS
// Magical Harry Potter Inspired Animations
// © 2025 CodeBeats - All Rights Reserved
// ═══════════════════════════════════════════════════════════════════

(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════
  // MAGIC PARTICLES CANVAS
  // ═══════════════════════════════════════════════════════════════════
  
  const magicCanvas = document.getElementById('magicCanvas');
  if (magicCanvas) {
    const ctx = magicCanvas.getContext('2d');
    
    magicCanvas.width = window.innerWidth;
    magicCanvas.height = window.innerHeight;
    
    class MagicParticle {
      constructor() {
        this.x = Math.random() * magicCanvas.width;
        this.y = Math.random() * magicCanvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = `rgba(${Math.random() > 0.5 ? '212,175,55' : '255,215,0'},${Math.random() * 0.8 + 0.2})`;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x < 0 || this.x > magicCanvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > magicCanvas.height) this.speedY *= -1;
      }
      
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
      }
    }
    
    const particles = [];
    for (let i = 0; i < 100; i++) {
      particles.push(new MagicParticle());
    }
    
    function animateMagic() {
      ctx.clearRect(0, 0, magicCanvas.width, magicCanvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      requestAnimationFrame(animateMagic);
    }
    
    animateMagic();
    
    // Resize handler
    window.addEventListener('resize', () => {
      magicCanvas.width = window.innerWidth;
      magicCanvas.height = window.innerHeight;
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // FLYING LETTERS
  // ═══════════════════════════════════════════════════════════════════
  
  const lettersContainer = document.getElementById('lettersContainer');
  if (lettersContainer) {
    function createFlyingLetter() {
      const letter = document.createElement('div');
      letter.className = 'flying-letter';
      letter.textContent = '✉️';
      letter.style.left = Math.random() * 100 + '%';
      letter.style.animationDuration = (Math.random() * 5 + 10) + 's';
      letter.style.animationDelay = Math.random() * 5 + 's';
      
      lettersContainer.appendChild(letter);
      
      setTimeout(() => {
        letter.remove();
      }, 15000);
    }
    
    // Create letters periodically
    setInterval(createFlyingLetter, 3000);
    
    // Initial letters
    for (let i = 0; i < 5; i++) {
      setTimeout(createFlyingLetter, i * 600);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // WAND CURSOR TRAIL
  // ═══════════════════════════════════════════════════════════════════
  
  let cursorTrail = [];
  const maxTrail = 20;
  
  document.addEventListener('mousemove', (e) => {
    const spark = document.createElement('div');
    spark.style.cssText = `
      position: fixed;
      width: 4px;
      height: 4px;
      background: radial-gradient(circle, rgba(212,175,55,0.9) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      left: ${e.clientX}px;
      top: ${e.clientY}px;
      animation: sparkFade 0.8s ease-out forwards;
    `;
    
    document.body.appendChild(spark);
    cursorTrail.push(spark);
    
    if (cursorTrail.length > maxTrail) {
      const oldSpark = cursorTrail.shift();
      oldSpark.remove();
    }
    
    setTimeout(() => spark.remove(), 800);
  });
  
  // Add CSS animation for sparks
  const style = document.createElement('style');
  style.textContent = `
    @keyframes sparkFade {
      0% {
        opacity: 1;
        transform: scale(1);
      }
      100% {
        opacity: 0;
        transform: scale(0.5);
      }
    }
  `;
  document.head.appendChild(style);

  // ═══════════════════════════════════════════════════════════════════
  // SMOOTH SCROLL
  // ═══════════════════════════════════════════════════════════════════
  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
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

  // ═══════════════════════════════════════════════════════════════════
  // SPELL CARD HOVER EFFECTS
  // ═══════════════════════════════════════════════════════════════════
  
  document.querySelectorAll('.spell-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
      // Create sparkle burst
      for (let i = 0; i < 10; i++) {
        const sparkle = document.createElement('div');
        const angle = (Math.PI * 2 * i) / 10;
        const distance = 50;
        
        sparkle.style.cssText = `
          position: absolute;
          width: 8px;
          height: 8px;
          background: var(--gold);
          border-radius: 50%;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          animation: sparkleBurst 0.8s ease-out forwards;
          animation-delay: ${i * 0.05}s;
          pointer-events: none;
        `;
        
        sparkle.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
        sparkle.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
        
        this.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1000);
      }
    });
  });
  
  const sparkleStyle = document.createElement('style');
  sparkleStyle.textContent = `
    @keyframes sparkleBurst {
      0% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
      100% {
        opacity: 0;
        transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0);
      }
    }
  `;
  document.head.appendChild(sparkleStyle);

  // ═══════════════════════════════════════════════════════════════════
  // HOUSE CARD INTERACTIONS
  // ═══════════════════════════════════════════════════════════════════
  
  document.querySelectorAll('.house-card').forEach(card => {
    card.addEventListener('click', function() {
      const houseName = this.querySelector('.house-name').textContent;
      
      // Create magical selection effect
      const effect = document.createElement('div');
      effect.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle at center, rgba(212,175,55,0.3) 0%, transparent 70%);
        z-index: 9998;
        pointer-events: none;
        animation: selectionFlash 1s ease-out forwards;
      `;
      
      document.body.appendChild(effect);
      
      console.log(`✨ ${houseName} selected!`);
      
      setTimeout(() => effect.remove(), 1000);
    });
  });
  
  const flashStyle = document.createElement('style');
  flashStyle.textContent = `
    @keyframes selectionFlash {
      0% {
        opacity: 0;
      }
      50% {
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(flashStyle);

  // ═══════════════════════════════════════════════════════════════════
  // FORM SUBMISSION
  // ═══════════════════════════════════════════════════════════════════
  
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Create owl flying animation
      const owl = document.createElement('div');
      owl.textContent = '🦉';
      owl.style.cssText = `
        position: fixed;
        font-size: 3rem;
        bottom: 50%;
        left: 50%;
        transform: translate(-50%, 50%);
        z-index: 10000;
        animation: owlFly 2s ease-in-out forwards;
        pointer-events: none;
      `;
      
      document.body.appendChild(owl);
      
      setTimeout(() => {
        owl.remove();
        alert('🦉 Your owl has been dispatched! Message sent successfully.');
        contactForm.reset();
      }, 2000);
    });
  }
  
  const owlStyle = document.createElement('style');
  owlStyle.textContent = `
    @keyframes owlFly {
      0% {
        bottom: 50%;
        left: 50%;
        opacity: 1;
        transform: translate(-50%, 50%) rotate(0deg);
      }
      100% {
        bottom: 120%;
        left: 80%;
        opacity: 0;
        transform: translate(-50%, 50%) rotate(45deg) scale(0.5);
      }
    }
  `;
  document.head.appendChild(owlStyle);

  // ═══════════════════════════════════════════════════════════════════
  // SCROLL REVEAL ANIMATIONS
  // ═══════════════════════════════════════════════════════════════════
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  document.querySelectorAll('.house-card, .spell-card, .feature-card').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });

  console.log('🪄 Hogwarts Template Loaded - Magic Activated!');

})();
