'use strict';

// Tiny parallax & glitch tick
(function(){
  const hero = document.querySelector('.nc-hero');
  const panels = document.querySelectorAll('.panel');
  const title = document.querySelector('.glitch');
  const accentBtn = document.querySelector('.nc-accent');
  const root = document.documentElement;
  const canvas = document.querySelector('.nc-particles');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let particles = [];
  const termEl = document.getElementById('ncTermOut');
  const heroVideo = document.querySelector('.nc-hero-video');

  // Mouse parallax
  window.addEventListener('mousemove', e => {
    const w = window.innerWidth, h = window.innerHeight;
    const x = (e.clientX / w - .5), y = (e.clientY / h - .5);
    panels.forEach((p, i) => {
      const f = (i+1) * 4;
      p.style.transform = `translate(${x*f}px, ${y*f}px)`;
    });
  });

  // Accent toggle
  if (accentBtn){
    accentBtn.addEventListener('click', () => {
      const mode = root.getAttribute('data-accent') === 'gold' ? '' : 'gold';
      if (mode){ root.setAttribute('data-accent', mode); }
      else { root.removeAttribute('data-accent'); }
    });
  }

  // Particles
  function initParticles(){
    if (!canvas || !ctx) return;
    // fit canvas to hero size
    const rect = hero.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(devicePixelRatio, devicePixelRatio);
    particles = Array.from({length: Math.max(48, Math.min(96, Math.floor(rect.width/20)))}).map(() => ({
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      vx: (Math.random()-0.5) * 0.6,
      vy: (Math.random()-0.5) * 0.6,
      r: Math.random() * 1.8 + 0.6,
      hue: Math.random() * 360
    }));
  }

  function drawParticles(){
    if (!canvas || !ctx) return;
    const rect = hero.getBoundingClientRect();
    ctx.clearRect(0,0,rect.width,rect.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -10) p.x = rect.width+10; if (p.x > rect.width+10) p.x = -10;
      if (p.y < -10) p.y = rect.height+10; if (p.y > rect.height+10) p.y = -10;
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*6);
      grad.addColorStop(0, `hsla(${p.hue}, 90%, 60%, .9)`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r*6, 0, Math.PI*2);
      ctx.fill();
    });
  }

  // Subtle hero scanline flicker
  let t = 0; 
  function tick(){
    t += 0.016;
    if (hero) hero.style.backgroundPosition = `0 ${Math.sin(t)*10}px`;
    drawParticles();
    if (title){
      const dx = Math.sin(t*4)*1, dy = Math.cos(t*3)*1;
      title.style.setProperty('--dx', dx);
      title.style.setProperty('--dy', dy);
    }
    requestAnimationFrame(tick);
  }
  if (canvas) {
    initParticles();
    window.addEventListener('resize', initParticles);
  }

  // Try to play video, else keep canvas visible
  if (heroVideo){
    heroVideo.addEventListener('error', () => {
      if (canvas) canvas.style.display = 'block';
    });
    const playTry = heroVideo.play();
    if (playTry && typeof playTry.catch === 'function'){
      playTry.catch(() => { if (canvas) canvas.style.display = 'block'; });
    }
  }

  // Neon Terminal feed
  const feed = [
    {t:'▶ Booting Night City Neon...', c:'muted'},
    {t:'$ init panels --with glow --scanlines', c:'muted'},
    {t:'✓ panels ready', c:'ok'},
    {t:'$ connect hud://localhost:2077', c:'muted'},
    {t:'⚠ handshake unstable — retry...', c:'warn'},
    {t:'✓ link established', c:'ok'},
    {t:'$ load modules [holo, parallax, marquee]', c:'muted'},
    {t:'✓ modules loaded (3)', c:'ok'},
    {t:'$ emit glow --intensity 0.8', c:'muted'},
    {t:'ERROR: chroma drift exceeded threshold', c:'err'},
    {t:'✓ auto-corrected drift=0.03', c:'ok'}
  ];
  let fi = 0;
  function pushLine(){
    if (!termEl) return;
    const row = feed[fi % feed.length];
    const line = document.createElement('div');
    if (row.c) line.className = row.c;
    line.textContent = row.t;
    termEl.appendChild(line);
    termEl.scrollTop = termEl.scrollHeight;
    fi++;
    // Trim very old lines to keep the panel compact
    const MAX_LINES = 80, KEEP_LINES = 60;
    if (termEl.childNodes.length > MAX_LINES){
      while (termEl.childNodes.length > KEEP_LINES){
        termEl.removeChild(termEl.firstChild);
      }
    }
  }
  if (termEl){
    for (let i=0;i<3;i++) pushLine();
    setInterval(pushLine, 1200);
  }
  requestAnimationFrame(tick);
})();
