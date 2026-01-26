/* Hero Canvas Visualization: Neon particle network + subtle grid */
(function(){
  const canvas = document.getElementById('heroViz');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const prm = window.matchMedia('(prefers-reduced-motion: reduce)');

  let dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  let width = 0, height = 0;
  let particles = [];
  let mouse = { x: -9999, y: -9999, active: false };
  const LINK_RADIUS = 120; // px
  const MOUSE_RADIUS = 200; // px
  const CYAN = '#06FFF0';
  const VIOLET = '#8B5CF6';
  let gridPhase = 0;

  function resize(){
    const rect = canvas.getBoundingClientRect();
    width = Math.max(320, rect.width);
    height = Math.max(240, rect.height);
    dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initParticles();
  }

  function calcCount(){
    // Responsive count targeting 80–150 based on area
    const area = width * height;
    const base = area / 10000; // heuristic
    let count = Math.floor(base * (prm.matches ? 0.7 : 1.0));
    count = Math.max(80, Math.min(150, count));
    return count;
  }

  function initParticles(){
    const count = calcCount();
    particles = new Array(count).fill(0).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      c: Math.random() < 0.7 ? CYAN : VIOLET,
      r: 1.4 + Math.random() * 0.8
    }));
  }

  function step(){
    ctx.clearRect(0, 0, width, height);

    // Subtle neon grid backdrop
    drawGrid();

    // Update particles
    for (let p of particles){
      // Mouse interaction: gentle repulsion within MOUSE_RADIUS
      if (mouse.active){
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < MOUSE_RADIUS && dist > 0.001){
          const force = (1 - dist / MOUSE_RADIUS) * 0.6;
          p.vx += (dx / dist) * force * 0.06;
          p.vy += (dy / dist) * force * 0.06;
        }
      }
      p.x += p.vx; p.y += p.vy;
      // Soft bounds with wrap + slight bounce
      if (p.x < -10) p.x = width + 10; else if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10; else if (p.y > height + 10) p.y = -10;
      // Friction
      p.vx *= 0.995; p.vy *= 0.995;
    }

    // Draw links
    drawLinks();

    // Draw particles on top
    for (let p of particles){
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c;
      ctx.globalAlpha = 0.85;
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    gridPhase += prm.matches ? 0.004 : 0.008; // subtle pulse
    requestAnimationFrame(step);
  }

  function drawGrid(){
    const spacing = 50; // px
    const t = gridPhase;
    const pulse = 0.3 + 0.3 * Math.sin(t * 2); // 0.0..0.6

    ctx.save();
    ctx.lineWidth = 1;
    // horizontal lines
    for (let y = 0; y <= height; y += spacing){
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.strokeStyle = `rgba(6,255,240,${0.05 + pulse * 0.05})`;
      ctx.stroke();
    }
    // vertical lines
    for (let x = 0; x <= width; x += spacing){
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.strokeStyle = `rgba(139,92,246,${0.03 + pulse * 0.04})`;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawLinks(){
    for (let i = 0; i < particles.length; i++){
      const p = particles[i];
      for (let j = i + 1; j < particles.length; j++){
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d2 = dx*dx + dy*dy;
        if (d2 < LINK_RADIUS*LINK_RADIUS){
          const dist = Math.sqrt(d2);
          const alpha = 1 - dist / LINK_RADIUS;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          // Blend color based on both particle colors
          const mixViolet = (p.c === VIOLET) + (q.c === VIOLET);
          const color = mixViolet >= 1 ? VIOLET : CYAN;
          ctx.strokeStyle = color;
          ctx.globalAlpha = 0.15 + alpha * 0.35;
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }
  }

  function onMouseMove(e){
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  }
  function onMouseLeave(){ mouse.active = false; mouse.x = mouse.y = -9999; }

  window.addEventListener('resize', resize, { passive: true });
  canvas.addEventListener('mousemove', onMouseMove, { passive: true });
  canvas.addEventListener('mouseleave', onMouseLeave, { passive: true });

  resize();
  requestAnimationFrame(step);
})();
