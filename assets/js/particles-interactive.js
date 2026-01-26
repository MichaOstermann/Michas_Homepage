// Interactive Particle System - Premium Background Effects
(function() {
  'use strict';

  const canvas = document.getElementById('particlesCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: null, y: null, radius: 150 };
  let animationId;

  // Responsive canvas
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Mouse tracking
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 3 + 1;
      this.baseX = this.x;
      this.baseY = this.y;
      this.density = Math.random() * 30 + 1;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      
      // Color variations
      const colors = [
        'rgba(6, 255, 240, ',    // Cyan
        'rgba(139, 92, 246, ',   // Violet
        'rgba(0, 255, 136, ',    // Green
        'rgba(255, 20, 147, '    // Pink
      ];
      this.colorBase = colors[Math.floor(Math.random() * colors.length)];
      this.opacity = Math.random() * 0.5 + 0.3;
    }

    update() {
      // Mouse interaction
      if (mouse.x != null && mouse.y != null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const maxDistance = mouse.radius;
        const force = (maxDistance - distance) / maxDistance;

        if (distance < mouse.radius) {
          const directionX = forceDirectionX * force * this.density * 0.6;
          const directionY = forceDirectionY * force * this.density * 0.6;
          this.x -= directionX;
          this.y -= directionY;
        }
      }

      // Return to base position
      const dx = this.x - this.baseX;
      const dy = this.y - this.baseY;
      this.x -= dx * 0.05;
      this.y -= dy * 0.05;

      // Drift
      this.baseX += this.speedX;
      this.baseY += this.speedY;

      // Wrap around
      if (this.baseX > canvas.width) this.baseX = 0;
      if (this.baseX < 0) this.baseX = canvas.width;
      if (this.baseY > canvas.height) this.baseY = 0;
      if (this.baseY < 0) this.baseY = canvas.height;
    }

    draw() {
      ctx.fillStyle = this.colorBase + this.opacity + ')';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();

      // Glow effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = this.colorBase + '0.8)';
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // Create particles
  function init() {
    particles = [];
    const numberOfParticles = Math.min((canvas.width * canvas.height) / 9000, 150);
    
    for (let i = 0; i < numberOfParticles; i++) {
      particles.push(new Particle());
    }
  }

  // Connect particles
  function connectParticles() {
    const maxDistance = 120;
    
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance) {
          const opacity = (1 - distance / maxDistance) * 0.3;
          ctx.strokeStyle = 'rgba(6, 255, 240, ' + opacity + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });

    connectParticles();
    animationId = requestAnimationFrame(animate);
  }

  // Start
  init();
  animate();

  // Reinit on resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resizeCanvas();
      init();
    }, 250);
  });

})();



