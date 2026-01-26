// ============================================================
// Engine Sound - Harley Roar
// ============================================================
const engineSound = new Audio('https://cdn.pixabay.com/download/audio/2022/03/10/audio_4d3d0d2cd9.mp3'); // Harley engine sound
engineSound.volume = 0.4;

// Play engine sound on first user interaction
let enginePlayed = false;
const playEngine = () => {
  if (!enginePlayed) {
    engineSound.play().catch(e => console.log('🏍️ Engine sound ready'));
    enginePlayed = true;
    document.removeEventListener('click', playEngine);
    document.removeEventListener('scroll', playEngine);
  }
};

document.addEventListener('click', playEngine, { once: true });
document.addEventListener('scroll', playEngine, { once: true });

// ============================================================
// Smooth Scroll
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ============================================================
// Bike Cards Hover Effect
// ============================================================
const bikeCards = document.querySelectorAll('.bike-card');

bikeCards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-10px) scale(1.02)';
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0) scale(1)';
  });
});

// ============================================================
// Gallery Lightbox
// ============================================================
const galleryItems = document.querySelectorAll('.gallery-item');

galleryItems.forEach(item => {
  item.addEventListener('click', () => {
    const bgImage = item.style.backgroundImage;
    const imageUrl = bgImage.slice(5, -2); // Extract URL from url("...")
    
    // Create lightbox
    const lightbox = document.createElement('div');
    lightbox.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.95);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      animation: fadeIn 0.3s ease;
    `;
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.style.cssText = `
      max-width: 90%;
      max-height: 90%;
      object-fit: contain;
      border: 4px solid #FF6B00;
      box-shadow: 0 0 60px rgba(255, 107, 0, 0.6);
    `;
    
    lightbox.appendChild(img);
    document.body.appendChild(lightbox);
    
    lightbox.addEventListener('click', () => {
      lightbox.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => lightbox.remove(), 300);
    });
  });
});

// ============================================================
// Parallax Effect on Hero
// ============================================================
const hero = document.querySelector('.hero');

window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  if (hero && scrolled < window.innerHeight) {
    hero.style.backgroundPositionY = `${scrolled * 0.5}px`;
  }
});

// ============================================================
// Intersection Observer for Fade-In Animations
// ============================================================
const observeElements = document.querySelectorAll('.bike-card, .feature-item, .gallery-item');

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, index * 100);
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

observeElements.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  fadeObserver.observe(el);
});

// ============================================================
// Thunder Flash Effect (Random)
// ============================================================
function createThunderFlash() {
  const flash = document.createElement('div');
  flash.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(255, 107, 0, 0.2);
    pointer-events: none;
    z-index: 9999;
    animation: thunder-flash 0.3s ease;
  `;
  
  document.body.appendChild(flash);
  
  setTimeout(() => flash.remove(), 300);
}

// Random thunder flash every 15-30 seconds
setInterval(() => {
  if (Math.random() > 0.7) {
    createThunderFlash();
  }
}, 20000);

// ============================================================
// Add CSS Animation for Thunder Flash
// ============================================================
const style = document.createElement('style');
style.textContent = `
  @keyframes thunder-flash {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;
document.head.appendChild(style);

// ============================================================
// Bike Card Click Handler
// ============================================================
bikeCards.forEach(card => {
  card.addEventListener('click', (e) => {
    if (!e.target.classList.contains('btn')) {
      const bikeName = card.querySelector('h3').textContent;
      console.log(`Viewing details for: ${bikeName}`);
      // Here you could open a modal or navigate to detail page
    }
  });
});

// ============================================================
// Mobile Menu Toggle (if needed)
// ============================================================
const createMobileMenu = () => {
  const nav = document.querySelector('.main-nav');
  const navLinks = document.querySelector('.nav-links');
  
  if (window.innerWidth <= 768) {
    let menuButton = document.querySelector('.mobile-menu-btn');
    
    if (!menuButton) {
      menuButton = document.createElement('button');
      menuButton.className = 'mobile-menu-btn';
      menuButton.innerHTML = '☰';
      menuButton.style.cssText = `
        display: block;
        background: var(--orange);
        border: none;
        color: var(--black);
        font-size: 2rem;
        padding: 8px 16px;
        cursor: pointer;
        border-radius: 4px;
      `;
      
      nav.querySelector('.nav-inner').appendChild(menuButton);
      
      menuButton.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '80px';
        navLinks.style.right = '0';
        navLinks.style.background = 'rgba(10, 10, 10, 0.98)';
        navLinks.style.padding = '20px';
        navLinks.style.borderTop = '2px solid var(--orange)';
      });
    }
  }
};

window.addEventListener('resize', createMobileMenu);
createMobileMenu();

// ============================================================
// Tire Smoke / Burnout Effect
// ============================================================
const createSmokeParticles = () => {
  const smokeContainer = document.createElement('div');
  smokeContainer.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 200px;
    pointer-events: none;
    z-index: 5;
    overflow: hidden;
  `;
  document.body.appendChild(smokeContainer);

  const createSmoke = () => {
    const smoke = document.createElement('div');
    const size = Math.random() * 80 + 40;
    const startX = Math.random() * window.innerWidth;
    const drift = (Math.random() - 0.5) * 100;
    
    smoke.style.cssText = `
      position: absolute;
      bottom: -20px;
      left: ${startX}px;
      width: ${size}px;
      height: ${size}px;
      background: radial-gradient(circle, rgba(100, 100, 100, 0.4), transparent);
      border-radius: 50%;
      animation: smoke-rise 4s ease-out forwards;
      opacity: 0;
    `;
    
    smoke.style.setProperty('--drift', `${drift}px`);
    smokeContainer.appendChild(smoke);
    
    setTimeout(() => smoke.remove(), 4000);
  };

  // Create smoke on scroll
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (Math.abs(currentScroll - lastScroll) > 50) {
      createSmoke();
      lastScroll = currentScroll;
    }
  });
  
  // Random smoke
  setInterval(createSmoke, 2000);
};

// Add CSS animation for smoke
const smokeStyle = document.createElement('style');
smokeStyle.textContent = `
  @keyframes smoke-rise {
    0% {
      opacity: 0.6;
      transform: translateY(0) translateX(0) scale(0.5);
    }
    50% {
      opacity: 0.4;
    }
    100% {
      opacity: 0;
      transform: translateY(-200px) translateX(var(--drift, 0)) scale(1.5);
    }
  }
`;
document.head.appendChild(smokeStyle);

// Initialize smoke effect
setTimeout(createSmokeParticles, 2000);

console.log('🏍️ STEEL LEGENDS - Ride the Legend! ⚡');
