// ============================================================
// Theme Toggle
// ============================================================
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;

// Load saved theme or default to dark
const savedTheme = localStorage.getItem('techflow-theme') || 'dark';
root.setAttribute('data-theme', savedTheme);

themeToggle?.addEventListener('click', () => {
  const current = root.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('techflow-theme', next);
});

// ============================================================
// Code Rain Animation
// ============================================================
const canvas = document.getElementById('codeRain');
const ctx = canvas?.getContext('2d');

if (canvas && ctx) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const fontSize = 14;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = Array(columns).fill(1);

  function drawCodeRain() {
    const theme = root.getAttribute('data-theme');
    const bgColor = theme === 'dark' ? 'rgba(15, 23, 42, 0.05)' : 'rgba(255, 255, 255, 0.05)';
    const textColor = theme === 'dark' ? '#0EA5E9' : '#7C3AED';

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px monospace`;

    drops.forEach((y, i) => {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;

      ctx.fillText(char, x, y * fontSize);

      if (y * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }

      drops[i]++;
    });
  }

  let animationId;
  function animate() {
    drawCodeRain();
    animationId = requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drops.length = Math.floor(canvas.width / fontSize);
    drops.fill(1);
  });
}

// ============================================================
// Terminal Typing Effect
// ============================================================
const terminalLines = document.querySelectorAll('.terminal-line');

function typeTerminalLines() {
  terminalLines.forEach((line, index) => {
    setTimeout(() => {
      line.style.animation = 'fadeIn 0.5s ease forwards';
    }, index * 150);
  });
}

// Trigger typing on page load
if (terminalLines.length > 0) {
  typeTerminalLines();
}

// ============================================================
// Universal Counter Animation Function
// ============================================================
function animateCounter(element, target, suffix = '', duration = 2000) {
  if (!element) {
    console.error('❌ Counter element not found!');
    return;
  }
  
  console.log('✅ Starting counter:', target, 'for', element.className);
  
  let current = 0;
  const increment = target / 60; // 60 frames
  
  const timer = setInterval(() => {
    current += increment;
    
    if (current >= target) {
      element.textContent = Math.round(target) + suffix;
      clearInterval(timer);
      console.log('✔️ Counter done:', target + suffix);
    } else {
      element.textContent = Math.floor(current) + suffix;
    }
  }, duration / 60);
}

// ============================================================
// Initialize ALL Counters after DOM is ready
// ============================================================
console.log('🚀 TechFlow Counter System Loading...');

// Hero Stats
setTimeout(() => {
  const heroStats = document.querySelectorAll('.stat-num[data-count]');
  console.log('📊 Hero stats found:', heroStats.length, heroStats);

  heroStats.forEach((stat, idx) => {
    const target = parseInt(stat.dataset.count);
    console.log(`Hero stat ${idx}: element exists=${!!stat}, target=${target}`);
    if (!isNaN(target) && stat) {
      animateCounter(stat, target, '+', 2000);
    }
  });

  // Firewall Counters
  const fwCounters = document.querySelectorAll('.status-value[data-counter]');
  console.log('🔥 Firewall counters found:', fwCounters.length, fwCounters);

  fwCounters.forEach((counter, idx) => {
    const target = parseInt(counter.dataset.counter);
    console.log(`FW counter ${idx}: element exists=${!!counter}, target=${target}`);
    if (!isNaN(target) && counter) {
      animateCounter(counter, target, '', 2500);
    }
  });
}, 100);

// ============================================================
// 3D Tilt Effect on Service Cards
// ============================================================
const tiltCards = document.querySelectorAll('[data-tilt]');

tiltCards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
  });
});

// ============================================================
// Tech Radar Visualization
// ============================================================
const radarCanvas = document.getElementById('techRadar');
const radarCtx = radarCanvas?.getContext('2d');

if (radarCanvas && radarCtx) {
  const centerX = radarCanvas.width / 2;
  const centerY = radarCanvas.height / 2;
  const maxRadius = Math.min(centerX, centerY) - 40;

  const categories = [
    { name: 'Cloud', color: '#0EA5E9', angle: 0, points: 8 },
    { name: 'Security', color: '#EF4444', angle: Math.PI / 2, points: 9 },
    { name: 'DevOps', color: '#10B981', angle: Math.PI, points: 7 },
    { name: 'Data', color: '#F59E0B', angle: (3 * Math.PI) / 2, points: 6 }
  ];

  let rotation = 0;

  function drawRadar() {
    const theme = root.getAttribute('data-theme');
    const bgColor = theme === 'dark' ? '#0F172A' : '#FFFFFF';
    const gridColor = theme === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.2)';

    radarCtx.fillStyle = bgColor;
    radarCtx.fillRect(0, 0, radarCanvas.width, radarCanvas.height);

    // Draw grid circles
    for (let i = 1; i <= 3; i++) {
      radarCtx.beginPath();
      radarCtx.arc(centerX, centerY, (maxRadius / 3) * i, 0, Math.PI * 2);
      radarCtx.strokeStyle = gridColor;
      radarCtx.lineWidth = 2;
      radarCtx.stroke();
    }

    // Draw grid lines
    categories.forEach(cat => {
      const angle = cat.angle + rotation;
      radarCtx.beginPath();
      radarCtx.moveTo(centerX, centerY);
      radarCtx.lineTo(
        centerX + Math.cos(angle) * maxRadius,
        centerY + Math.sin(angle) * maxRadius
      );
      radarCtx.strokeStyle = gridColor;
      radarCtx.lineWidth = 2;
      radarCtx.stroke();
    });

    // Draw data points
    categories.forEach((cat, idx) => {
      const angle = cat.angle + rotation;
      const radius = (cat.points / 10) * maxRadius;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      radarCtx.beginPath();
      radarCtx.arc(x, y, 8, 0, Math.PI * 2);
      radarCtx.fillStyle = cat.color;
      radarCtx.fill();

      // Connect points
      if (idx > 0) {
        const prevCat = categories[idx - 1];
        const prevAngle = prevCat.angle + rotation;
        const prevRadius = (prevCat.points / 10) * maxRadius;
        const prevX = centerX + Math.cos(prevAngle) * prevRadius;
        const prevY = centerY + Math.sin(prevAngle) * prevRadius;

        radarCtx.beginPath();
        radarCtx.moveTo(prevX, prevY);
        radarCtx.lineTo(x, y);
        radarCtx.strokeStyle = 'rgba(14, 165, 233, 0.5)';
        radarCtx.lineWidth = 3;
        radarCtx.stroke();
      }
    });

    // Connect last to first
    const firstCat = categories[0];
    const lastCat = categories[categories.length - 1];
    const firstAngle = firstCat.angle + rotation;
    const lastAngle = lastCat.angle + rotation;
    const firstRadius = (firstCat.points / 10) * maxRadius;
    const lastRadius = (lastCat.points / 10) * maxRadius;

    radarCtx.beginPath();
    radarCtx.moveTo(
      centerX + Math.cos(lastAngle) * lastRadius,
      centerY + Math.sin(lastAngle) * lastRadius
    );
    radarCtx.lineTo(
      centerX + Math.cos(firstAngle) * firstRadius,
      centerY + Math.sin(firstAngle) * firstRadius
    );
    radarCtx.strokeStyle = 'rgba(14, 165, 233, 0.5)';
    radarCtx.lineWidth = 3;
    radarCtx.stroke();

    rotation += 0.002;
  }

  function animateRadar() {
    drawRadar();
    requestAnimationFrame(animateRadar);
  }

  animateRadar();
}

// ============================================================
// Pricing Calculator
// ============================================================
const projectSize = document.getElementById('projectSize');
const teamSize = document.getElementById('teamSize');
const teamSizeValue = document.getElementById('teamSizeValue');
const checkboxes = document.querySelectorAll('.service-checkbox');
const calculatedPrice = document.getElementById('calculatedPrice');

const basePrices = {
  small: 5000,
  medium: 15000,
  large: 30000,
  enterprise: 50000
};

const serviceAddons = {
  monitoring: 2000,
  backup: 1500,
  support: 3000,
  training: 2500
};

function calculatePrice() {
  if (!projectSize || !teamSize || !calculatedPrice) return;

  const size = projectSize.value;
  const team = parseInt(teamSize.value);
  
  let basePrice = basePrices[size];
  let addons = 0;

  checkboxes.forEach(cb => {
    if (cb.checked) {
      addons += serviceAddons[cb.dataset.service];
    }
  });

  const teamMultiplier = 1 + (team - 1) * 0.15;
  const total = Math.round((basePrice + addons) * teamMultiplier);

  // Animate price change
  const current = parseInt(calculatedPrice.textContent.replace(/[^0-9]/g, '')) || 0;
  const diff = total - current;
  const steps = 20;
  const stepSize = diff / steps;
  let step = 0;

  const interval = setInterval(() => {
    step++;
    const newValue = Math.round(current + stepSize * step);
    calculatedPrice.textContent = newValue.toLocaleString('de-DE') + '€';
    
    if (step >= steps) {
      clearInterval(interval);
      calculatedPrice.textContent = total.toLocaleString('de-DE') + '€';
    }
  }, 30);
}

projectSize?.addEventListener('change', calculatePrice);
teamSize?.addEventListener('input', (e) => {
  if (teamSizeValue) {
    teamSizeValue.textContent = e.target.value;
  }
  calculatePrice();
});
checkboxes.forEach(cb => cb.addEventListener('change', calculatePrice));

// Initial calculation
if (calculatedPrice) {
  calculatePrice();
}

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
// Intersection Observer for Fade-In Animations
// ============================================================
const observeElements = document.querySelectorAll('.service-card, .case-card, .tech-logo');

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
// Parallax Effect on Hero
// ============================================================
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const hero = document.querySelector('.hero');
  
  if (hero && scrolled < window.innerHeight) {
    hero.style.transform = `translateY(${scrolled * 0.3}px)`;
    hero.style.opacity = 1 - (scrolled / window.innerHeight) * 0.5;
  }
});

// ============================================================
// Network Switch Animation
// ============================================================
const ports = document.querySelectorAll('.port');
ports.forEach((port, index) => {
  port.style.setProperty('--port', index);
  
  // Random port activation for realism
  if (Math.random() > 0.3) {
    port.classList.add('active');
  }
});

// ============================================================
// Datacenter Rack Animation Enhancement
// ============================================================
const rackUnits = document.querySelectorAll('.rack-unit');
rackUnits.forEach((unit, index) => {
  unit.style.setProperty('--index', unit.dataset.index || index);
  
  // Random LED flickering for realism
  const leds = unit.querySelectorAll('.led');
  leds.forEach((led, ledIndex) => {
    setInterval(() => {
      if (Math.random() > 0.8) {
        led.style.opacity = '0.2';
        setTimeout(() => {
          led.style.opacity = '';
        }, 100);
      }
    }, 2000 + ledIndex * 800 + index * 200);
  });
});

console.log('🚀 TechFlow Solutions initialized!');
console.log('🖥️ Server Rack Status: ONLINE');
