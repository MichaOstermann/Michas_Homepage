/**
 * Hero Mega Effects - Particle System
 */

// Partikel-System initialisieren
function initHeroParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;

  const particleCount = 50; // Anzahl der Partikel

  for (let i = 0; i < particleCount; i++) {
    createParticle(container, i);
  }
}

function createParticle(container, index) {
  const particle = document.createElement('div');
  particle.className = 'hero-particle';
  
  // Zufällige Startposition
  particle.style.left = Math.random() * 100 + '%';
  particle.style.top = Math.random() * 100 + '%';
  
  // Zufälliges Delay für staggered Animation
  particle.style.animationDelay = (Math.random() * 10) + 's';
  
  // Zufällige Größe (kleiner Variation)
  const size = 2 + Math.random() * 3;
  particle.style.width = size + 'px';
  particle.style.height = size + 'px';
  
  container.appendChild(particle);
}

// Floating Elements interaktiv machen
function initFloatingElements() {
  const floatElements = document.querySelectorAll('.hero-float-element');
  
  if (floatElements.length === 0) {
    console.warn('Keine Float Elements gefunden');
    return;
  }
  
  console.log(`✨ ${floatElements.length} Float Elements gefunden`);
  
  // Sanfter Mouse-Follow-Effekt
  let mouseX = 0;
  let mouseY = 0;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  floatElements.forEach((element, index) => {
    function updatePosition() {
      const speed = 0.015 + (index * 0.005);
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const x = (mouseX - centerX) * speed;
      const y = (mouseY - centerY) * speed;
      
      element.style.transform = `translate(${x}px, ${y}px)`;
      requestAnimationFrame(updatePosition);
    }
    
    updatePosition();
  });
}

// Button Energy Effects verstärken
function enhanceButtons() {
  const buttons = document.querySelectorAll('.btn--neon');
  
  buttons.forEach(button => {
    // Zusätzliche Sparkle-Effekte beim Hover
    button.addEventListener('mouseenter', () => {
      createSparkles(button);
    });
  });
}

function createSparkles(button) {
  const sparkleCount = 8;
  const rect = button.getBoundingClientRect();
  
  for (let i = 0; i < sparkleCount; i++) {
    const sparkle = document.createElement('div');
    sparkle.style.position = 'absolute';
    sparkle.style.width = '4px';
    sparkle.style.height = '4px';
    sparkle.style.background = i % 2 === 0 ? '#06FFF0' : '#8B5CF6';
    sparkle.style.borderRadius = '50%';
    sparkle.style.pointerEvents = 'none';
    sparkle.style.boxShadow = `0 0 10px ${i % 2 === 0 ? '#06FFF0' : '#8B5CF6'}`;
    
    const angle = (360 / sparkleCount) * i;
    const distance = 30;
    const x = Math.cos(angle * Math.PI / 180) * distance;
    const y = Math.sin(angle * Math.PI / 180) * distance;
    
    sparkle.style.left = (rect.width / 2) + 'px';
    sparkle.style.top = (rect.height / 2) + 'px';
    
    button.style.position = 'relative';
    button.appendChild(sparkle);
    
    // Animation
    sparkle.animate([
      { transform: 'translate(0, 0) scale(0)', opacity: 1 },
      { transform: `translate(${x}px, ${y}px) scale(1)`, opacity: 0 }
    ], {
      duration: 600,
      easing: 'ease-out'
    }).onfinish = () => sparkle.remove();
  }
}

// Text Glitch bei Scroll
let glitchInterval;

function initScrollGlitch() {
  const heroTitle = document.querySelector('.hero__title');
  if (!heroTitle) return;
  
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    // Trigger Glitch bei bestimmten Scroll-Positionen
    if (scrollY > 100 && scrollY < 150 && !glitchInterval) {
      triggerGlitch(heroTitle);
    }
  });
}

function triggerGlitch(element) {
  element.style.animation = 'glitchText 0.3s ease-in-out';
  
  setTimeout(() => {
    element.style.animation = '';
  }, 300);
}

// Alles initialisieren wenn DOM geladen
document.addEventListener('DOMContentLoaded', () => {
  console.log('🔥 Hero Mega Effects initialisiert');
  
  initHeroParticles();
  initFloatingElements();
  enhanceButtons();
  initScrollGlitch();
  
  console.log('✨ Particles, Floating Elements, Button Effects aktiv');
});

// Performance: Pause Animationen wenn Tab nicht sichtbar
document.addEventListener('visibilitychange', () => {
  const particles = document.querySelectorAll('.hero-particle');
  const floatElements = document.querySelectorAll('.hero-float-element');
  
  if (document.hidden) {
    particles.forEach(p => p.style.animationPlayState = 'paused');
    floatElements.forEach(e => e.style.animationPlayState = 'paused');
  } else {
    particles.forEach(p => p.style.animationPlayState = 'running');
    floatElements.forEach(e => e.style.animationPlayState = 'running');
  }
});
