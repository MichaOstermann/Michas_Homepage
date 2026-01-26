// ================================
// TERMINATOR TEMPLATE SCRIPTS
// Cyberdyne Systems - T-800 Series
// ================================

// Matrix Rain Effect
const matrixCanvas = document.getElementById('matrixCanvas');
if (matrixCanvas) {
  const ctx = matrixCanvas.getContext('2d');
  matrixCanvas.width = window.innerWidth;
  matrixCanvas.height = window.innerHeight;

  const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()";
  const fontSize = 14;
  const columns = matrixCanvas.width / fontSize;
  const drops = [];

  for (let x = 0; x < columns; x++) {
    drops[x] = Math.random() * -100;
  }

  function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

    ctx.fillStyle = '#FF0033';
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
      const text = matrix.charAt(Math.floor(Math.random() * matrix.length));
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  setInterval(drawMatrix, 35);

  window.addEventListener('resize', () => {
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
  });
}

// Particle System
const particleCanvas = document.getElementById('particleCanvas');
if (particleCanvas) {
  const pCtx = particleCanvas.getContext('2d');
  particleCanvas.width = window.innerWidth;
  particleCanvas.height = window.innerHeight;

  const particles = [];
  const particleCount = 80;

  class Particle {
    constructor() {
      this.x = Math.random() * particleCanvas.width;
      this.y = Math.random() * particleCanvas.height;
      this.size = Math.random() * 2 + 1;
      this.speedX = Math.random() * 0.5 - 0.25;
      this.speedY = Math.random() * 0.5 - 0.25;
      this.opacity = Math.random() * 0.5 + 0.3;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x > particleCanvas.width) this.x = 0;
      if (this.x < 0) this.x = particleCanvas.width;
      if (this.y > particleCanvas.height) this.y = 0;
      if (this.y < 0) this.y = particleCanvas.height;
    }

    draw() {
      pCtx.fillStyle = `rgba(255, 0, 51, ${this.opacity})`;
      pCtx.beginPath();
      pCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      pCtx.fill();

      // Glow effect
      pCtx.shadowBlur = 15;
      pCtx.shadowColor = 'rgba(255, 0, 51, 0.8)';
      pCtx.fill();
      pCtx.shadowBlur = 0;
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animateParticles() {
    pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
          pCtx.strokeStyle = `rgba(255, 0, 51, ${0.2 * (1 - distance / 150)})`;
          pCtx.lineWidth = 1;
          pCtx.beginPath();
          pCtx.moveTo(particles[i].x, particles[i].y);
          pCtx.lineTo(particles[j].x, particles[j].y);
          pCtx.stroke();
        }
      }
    }

    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });

    requestAnimationFrame(animateParticles);
  }

  animateParticles();

  window.addEventListener('resize', () => {
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
  });
}

// Terminal Time Display
function updateTerminalTime() {
  const timeElement = document.getElementById('terminalTime');
  if (timeElement) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    timeElement.textContent = `${hours}:${minutes}:${seconds}`;
  }
}

// Update time every second
setInterval(updateTerminalTime, 1000);
updateTerminalTime();

// HUD Canvas Animation
const canvas = document.getElementById('hudCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let animationFrame = 0;
  
  function drawHUD() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Grid pattern
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.15)';
    ctx.lineWidth = 1;
    
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Circular radar sweep
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 120;
    
    // Radar circles
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    
    for (let r = 40; r <= radius; r += 40) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Sweeping line
    const angle = (animationFrame * 0.02) % (Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 50, 50, 0.8)';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(255, 0, 0, 0.8)';
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(angle) * radius,
      centerY + Math.sin(angle) * radius
    );
    ctx.stroke();
    
    ctx.shadowBlur = 0;
    
    // Random target blips
    ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
    const blips = 5;
    for (let i = 0; i < blips; i++) {
      const blipAngle = (i * Math.PI * 2) / blips + animationFrame * 0.01;
      const blipRadius = 60 + Math.sin(animationFrame * 0.05 + i) * 30;
      const blipX = centerX + Math.cos(blipAngle) * blipRadius;
      const blipY = centerY + Math.sin(blipAngle) * blipRadius;
      
      ctx.beginPath();
      ctx.arc(blipX, blipY, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Blip glow
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    
    // Corner brackets
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';
    ctx.lineWidth = 3;
    const bracketSize = 30;
    
    // Top-left
    ctx.beginPath();
    ctx.moveTo(20, 20 + bracketSize);
    ctx.lineTo(20, 20);
    ctx.lineTo(20 + bracketSize, 20);
    ctx.stroke();
    
    // Top-right
    ctx.beginPath();
    ctx.moveTo(canvas.width - 20 - bracketSize, 20);
    ctx.lineTo(canvas.width - 20, 20);
    ctx.lineTo(canvas.width - 20, 20 + bracketSize);
    ctx.stroke();
    
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(20, canvas.height - 20 - bracketSize);
    ctx.lineTo(20, canvas.height - 20);
    ctx.lineTo(20 + bracketSize, canvas.height - 20);
    ctx.stroke();
    
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(canvas.width - 20 - bracketSize, canvas.height - 20);
    ctx.lineTo(canvas.width - 20, canvas.height - 20);
    ctx.lineTo(canvas.width - 20, canvas.height - 20 - bracketSize);
    ctx.stroke();
    
    animationFrame++;
    requestAnimationFrame(drawHUD);
  }
  
  drawHUD();
}

// Smooth Scrolling for Navigation
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Remove active class from all links
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    // Add active class to clicked link
    this.classList.add('active');
    
    // Get target section
    const targetId = this.getAttribute('href');
    const targetSection = document.querySelector(targetId);
    
    if (targetSection) {
      // Smooth scroll to section
      targetSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// HUD Corner Animation on Scroll
let lastScrollTop = 0;
window.addEventListener('scroll', function() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const corners = document.querySelectorAll('.hud-corner');
  
  corners.forEach(corner => {
    if (scrollTop > lastScrollTop) {
      // Scrolling down
      corner.style.transform = 'scale(0.95)';
    } else {
      // Scrolling up
      corner.style.transform = 'scale(1)';
    }
  });
  
  lastScrollTop = scrollTop;
}, false);

// Form Submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    // Simulate transmission
    const btn = this.querySelector('.btn--primary');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<span class="btn-icon">◉</span> TRANSMITTING...';
    btn.style.pointerEvents = 'none';
    
    // Simulate delay
    setTimeout(() => {
      btn.innerHTML = '<span class="btn-icon">✓</span> TRANSMISSION COMPLETE';
      btn.style.background = 'rgba(0, 255, 0, 0.2)';
      btn.style.borderColor = '#00FF00';
      btn.style.color = '#00FF00';
      
      // Reset form
      setTimeout(() => {
        contactForm.reset();
        btn.innerHTML = originalText;
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.style.color = '';
        btn.style.pointerEvents = '';
      }, 3000);
    }, 2000);
    
    // In production, you would send the data to a server here
    console.log('Form submitted:', { name, email, message });
  });
}

// Stat Bar Animations on Scroll
const statBars = document.querySelectorAll('.stat-fill');
const observerOptions = {
  threshold: 0.5,
  rootMargin: '0px'
};

const statObserver = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const bar = entry.target;
      const width = bar.style.width;
      bar.style.width = '0';
      
      setTimeout(() => {
        bar.style.transition = 'width 2s ease-out';
        bar.style.width = width;
      }, 100);
    }
  });
}, observerOptions);

statBars.forEach(bar => statObserver.observe(bar));

// Feature Cards Hover Effect
const featureCards = document.querySelectorAll('.feature-card');
featureCards.forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.borderColor = '#FF3333';
  });
  
  card.addEventListener('mouseleave', function() {
    this.style.borderColor = '#FF0000';
  });
});

// CTA Button Effects
const ctaButtons = document.querySelectorAll('.cta-buttons .btn');
ctaButtons.forEach(btn => {
  btn.addEventListener('click', function(e) {
    // Create ripple effect
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 0, 0, 0.5)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s ease-out';
    ripple.style.pointerEvents = 'none';
    
    this.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  });
});

// Add ripple animation
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Active Section Highlighting
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver(
  function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  },
  {
    threshold: 0.3
  }
);

sections.forEach(section => sectionObserver.observe(section));

// Random System Messages
const systemMessages = [
  'NEURAL NET PROCESSOR ONLINE',
  'SCANNING ENVIRONMENT...',
  'THREAT ASSESSMENT: MINIMAL',
  'ALL SYSTEMS OPERATIONAL',
  'STANDBY MODE ACTIVE',
  'READY FOR ENGAGEMENT'
];

function showSystemMessage() {
  const statusText = document.querySelector('.status-text');
  if (statusText && Math.random() > 0.7) {
    const originalText = statusText.textContent;
    const randomMessage = systemMessages[Math.floor(Math.random() * systemMessages.length)];
    
    statusText.textContent = randomMessage;
    
    setTimeout(() => {
      statusText.textContent = originalText;
    }, 3000);
  }
}

// Show random system messages occasionally
setInterval(showSystemMessage, 15000);

// Prevent context menu on HUD elements (for immersion)
document.querySelectorAll('.hud-corner, .scanlines, .vignette').forEach(element => {
  element.addEventListener('contextmenu', e => e.preventDefault());
});

// Console Welcome Message
console.log('%c CYBERDYNE SYSTEMS', 'color: #FF0000; font-size: 24px; font-weight: bold; text-shadow: 0 0 10px rgba(255,0,0,0.8)');
console.log('%c T-800 Series - Neural Net Processor', 'color: #CC0000; font-size: 14px');
console.log('%c Status: ONLINE | Version: 8.1.2 | Build: 29082024', 'color: #00FF00; font-size: 12px');
console.log('%c Template Demo for Code & Beats', 'color: #666; font-size: 10px; font-style: italic');