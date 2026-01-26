// ultimate-enhancements.js - Premium Features Package
// Füge diese Datei zu deinen Scripts hinzu

class UltimateEnhancements {
  constructor() {
    this.init();
  }

  init() {
    this.initCustomCursor();
    this.initScrollProgress();
    this.init3DCardTilt();
    this.initCopyCodeButtons();
    this.initAudioVisualizer();
    this.initParticleTrails();
    this.initLoadingScreen();
  }

  // ============================================
  // 1. CUSTOM NEON CURSOR
  // ============================================
  initCustomCursor() {
    // Skip on touch devices
    if ('ontouchstart' in window) return;

    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.innerHTML = '<div class="cursor-dot"></div><div class="cursor-ring"></div>';
    document.body.appendChild(cursor);

    const dot = cursor.querySelector('.cursor-dot');
    const ring = cursor.querySelector('.cursor-ring');

    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    const animateCursor = () => {
      // Smooth following
      dotX += (mouseX - dotX) * 0.8;
      dotY += (mouseY - dotY) * 0.8;
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;

      dot.style.transform = `translate(${dotX}px, ${dotY}px)`;
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;

      requestAnimationFrame(animateCursor);
    };
    animateCursor();

    // Hover effects
    const interactives = document.querySelectorAll('a, button, .card, .chip');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('cursor-hover');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor-hover');
      });
    });

    // CSS for cursor
    const style = document.createElement('style');
    style.textContent = `
      .custom-cursor {
        pointer-events: none;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 10000;
        mix-blend-mode: difference;
      }
      .cursor-dot {
        width: 8px;
        height: 8px;
        background: #06FFF0;
        border-radius: 50%;
        position: absolute;
        box-shadow: 0 0 20px #06FFF0;
      }
      .cursor-ring {
        width: 40px;
        height: 40px;
        border: 2px solid rgba(6, 255, 240, 0.5);
        border-radius: 50%;
        position: absolute;
        margin: -16px 0 0 -16px;
        transition: all 0.2s ease;
      }
      .cursor-hover .cursor-ring {
        transform: scale(1.5) !important;
        border-color: #8B5CF6;
        box-shadow: 0 0 30px rgba(139, 92, 246, 0.6);
      }
      body * {
        cursor: none !important;
      }
      @media (max-width: 768px) {
        .custom-cursor { display: none; }
        body * { cursor: auto !important; }
      }
    `;
    document.head.appendChild(style);
  }

  // ============================================
  // 2. SCROLL PROGRESS BAR
  // ============================================
  initScrollProgress() {
    const progress = document.createElement('div');
    progress.className = 'scroll-progress';
    document.body.appendChild(progress);

    const updateProgress = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = (scrollTop / scrollHeight) * 100;
      progress.style.width = scrollPercent + '%';
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    // CSS
    const style = document.createElement('style');
    style.textContent = `
      .scroll-progress {
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #06FFF0 0%, #8B5CF6 100%);
        box-shadow: 0 0 20px rgba(6, 255, 240, 0.8);
        z-index: 9999;
        transition: width 0.1s ease;
      }
    `;
    document.head.appendChild(style);
  }

  // ============================================
  // 3. 3D CARD TILT EFFECT
  // ============================================
  init3DCardTilt() {
    const cards = document.querySelectorAll('.card');
    const prm = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prm.matches) return;

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * 10;
        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      });
    });

    // CSS
    const style = document.createElement('style');
    style.textContent = `
      .card {
        transition: transform 0.1s ease;
        transform-style: preserve-3d;
      }
    `;
    document.head.appendChild(style);
  }

  // ============================================
  // 4. COPY CODE BUTTONS
  // ============================================
  initCopyCodeButtons() {
    const codeBlocks = document.querySelectorAll('.card__code');

    codeBlocks.forEach(block => {
      const wrapper = document.createElement('div');
      wrapper.className = 'code-wrapper';
      block.parentNode.insertBefore(wrapper, block);
      wrapper.appendChild(block);

      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-code-btn';
      copyBtn.innerHTML = '📋 Copy';
      copyBtn.setAttribute('aria-label', 'Code kopieren');
      wrapper.appendChild(copyBtn);

      copyBtn.addEventListener('click', () => {
        const code = block.textContent;
        navigator.clipboard.writeText(code).then(() => {
          copyBtn.innerHTML = '✓ Copied!';
          copyBtn.classList.add('copied');

          setTimeout(() => {
            copyBtn.innerHTML = '📋 Copy';
            copyBtn.classList.remove('copied');
          }, 2000);
        }).catch(err => {
          console.error('Copy failed:', err);
          copyBtn.innerHTML = '✗ Error';
          setTimeout(() => {
            copyBtn.innerHTML = '📋 Copy';
          }, 2000);
        });
      });
    });

    // CSS
    const style = document.createElement('style');
    style.textContent = `
      .code-wrapper {
        position: relative;
      }
      .copy-code-btn {
        position: absolute;
        top: 12px;
        right: 12px;
        padding: 6px 12px;
        background: rgba(6, 255, 240, 0.1);
        border: 1px solid rgba(6, 255, 240, 0.3);
        border-radius: 6px;
        color: #06FFF0;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        z-index: 10;
      }
      .copy-code-btn:hover {
        background: rgba(6, 255, 240, 0.2);
        box-shadow: 0 0 20px rgba(6, 255, 240, 0.4);
      }
      .copy-code-btn.copied {
        background: rgba(6, 255, 240, 0.3);
        border-color: #06FFF0;
      }
    `;
    document.head.appendChild(style);
  }

  // ============================================
  // 5. AUDIO VISUALIZER
  // ============================================
  initAudioVisualizer() {
    const audioElements = document.querySelectorAll('audio');

    audioElements.forEach(audio => {
      const card = audio.closest('.card');
      if (!card) return;

      const canvas = document.createElement('canvas');
      canvas.className = 'audio-visualizer';
      canvas.width = 200;
      canvas.height = 60;
      audio.parentNode.insertBefore(canvas, audio.nextSibling);

      const ctx = canvas.getContext('2d');
      let audioContext = null;
      let analyser = null;
      let source = null;

      const setupAudio = () => {
        if (audioContext) return;
        try {
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
          analyser = audioContext.createAnalyser();
          source = audioContext.createMediaElementSource(audio);
          
          source.connect(analyser);
          analyser.connect(audioContext.destination);
          analyser.fftSize = 64;
        } catch(e) {
          console.warn('Web Audio API not supported:', e);
        }
      };

      const bufferLength = 32;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        if (!analyser) return;
        requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = 'rgba(11, 15, 22, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = canvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;

          const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
          gradient.addColorStop(0, '#8B5CF6');
          gradient.addColorStop(1, '#06FFF0');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);

          x += barWidth;
        }
      };

      audio.addEventListener('play', () => {
        setupAudio();
        if (audioContext) {
          audioContext.resume().then(() => draw());
        }
      });
    });

    // CSS
    const style = document.createElement('style');
    style.textContent = `
      .audio-visualizer {
        width: 100%;
        height: 60px;
        margin: 10px 0;
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(6, 255, 240, 0.2);
      }
    `;
    document.head.appendChild(style);
  }

  // ============================================
  // 6. PARTICLE TRAILS ON SCROLL
  // ============================================
  initParticleTrails() {
    const prm = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prm.matches) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'particle-trails';
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    `;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    let lastScrollTime = 0;

    window.addEventListener('scroll', () => {
      const now = Date.now();
      if (now - lastScrollTime < 50) return;
      lastScrollTime = now;

      for (let i = 0; i < 2; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: window.scrollY + Math.random() * window.innerHeight,
          size: Math.random() * 3 + 1,
          speedY: Math.random() * 2 + 1,
          opacity: 1,
          color: Math.random() > 0.5 ? '#06FFF0' : '#8B5CF6'
        });
      }
    }, { passive: true });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.y -= p.speedY;
        p.opacity -= 0.01;

        if (p.opacity <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y - window.scrollY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }, { passive: true });
  }

  // ============================================
  // 7. LOADING SCREEN
  // ============================================
  initLoadingScreen() {
    const loader = document.createElement('div');
    loader.className = 'loading-screen';
    loader.innerHTML = `
      <div class="loader-content">
        <div class="loader-spinner"></div>
        <p class="loader-text">Loading Experience...</p>
      </div>
    `;
    document.body.appendChild(loader);

    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('loaded');
        setTimeout(() => loader.remove(), 600);
      }, 1000);
    });

    // CSS
    const style = document.createElement('style');
    style.textContent = `
      .loading-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #0B0F16;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        transition: opacity 0.6s ease;
      }
      .loading-screen.loaded {
        opacity: 0;
        pointer-events: none;
      }
      .loader-content {
        text-align: center;
      }
      .loader-spinner {
        width: 60px;
        height: 60px;
        border: 3px solid rgba(6, 255, 240, 0.1);
        border-top-color: #06FFF0;
        border-radius: 50%;
        margin: 0 auto;
        animation: spin 1s linear infinite;
        box-shadow: 0 0 30px rgba(6, 255, 240, 0.5);
      }
      .loader-text {
        margin-top: 20px;
        color: #06FFF0;
        font-size: 1.2rem;
        text-align: center;
        animation: pulse 1.5s ease-in-out infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new UltimateEnhancements();
});
