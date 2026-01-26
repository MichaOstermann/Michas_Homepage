/* Alien wireframe behavior: sticky fade-out, cursor-follow eyes, PRM handling */
(function(){
  const hero = document.getElementById('hero');
  const alienWrap = document.getElementById('alienWrap');
  const alienWF = document.getElementById('alienWireframe');
  if (!hero || !alienWrap || !alienWF) return;

  const prm = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

  // Eyes follow cursor (subtle)
  const eyes = alienWF.querySelectorAll('.wf-eye');
  let rafId = null;
  let target = { x: 0, y: 0 };
  let current = { x: 0, y: 0 };

  function onMove(e){
    if (prm.matches || isMobile() || eyes.length === 0) return;
    const rect = hero.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) - 0.5; // -0.5..0.5
    const ny = ((e.clientY - rect.top) / rect.height) - 0.5;
    const maxX = 5, maxY = 4; // px
    target.x = Math.max(Math.min(nx * maxX, maxX), -maxX);
    target.y = Math.max(Math.min(ny * maxY, maxY), -maxY);
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  function tick(){
    rafId = null;
    // simple lerp
    current.x += (target.x - current.x) * 0.18;
    current.y += (target.y - current.y) * 0.18;
    eyes.forEach(el => { el.style.transform = `translate(${current.x}px, ${current.y}px)`; });
  }

  hero.addEventListener('mousemove', onMove, { passive: true });

  // Fade out when next section enters (music)
  const next = document.getElementById('music');
  if (next && 'IntersectionObserver' in window){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.35){
          alienWF.classList.add('alien-fadeout');
        } else {
          alienWF.classList.remove('alien-fadeout');
        }
      });
    }, { root: null, threshold: [0, 0.35, 0.75] });
    io.observe(next);
  }

  // Strengthen glow on hover (for non-touch)
  function enhanceGlow(){ alienWF.classList.add('is-hover'); }
  function resetGlow(){ alienWF.classList.remove('is-hover'); }
  alienWF.addEventListener('mouseenter', enhanceGlow);
  alienWF.addEventListener('mouseleave', resetGlow);

  // Resize handler to keep eyes centered when switching layouts
  window.addEventListener('resize', () => { current.x = 0; current.y = 0; target.x = 0; target.y = 0; eyes.forEach(el => el.style.transform = 'translate(0,0)'); }, { passive: true });

  // --- GSAP-powered idle & parallax (if available) ---
  if (window.gsap && !prm.matches){
    const svg = alienWF.querySelector('.alien-svg');
    if (svg){
      // Subtle breathing on the whole SVG
      gsap.to(svg, { scale: 1.02, duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: '50% 50%' });

      // Eye blinking: random staggered blinks
      eyes.forEach((eye, i) => {
        const blink = () => {
          gsap.to(eye, { transformOrigin: '50% 50%', scaleY: 0.1, duration: 0.08, yoyo: true, repeat: 1, ease: 'power1.inOut', onComplete: () => {
            gsap.delayedCall(1.5 + Math.random()*3, blink);
          }});
        };
        gsap.delayedCall(1 + i*0.5 + Math.random()*2, blink);
      });

      // Hover tilt with stronger glow
      alienWF.addEventListener('mouseenter', () => {
        gsap.to(svg, { rotation: 2, duration: 0.4, ease: 'power2.out', transformOrigin: '50% 50%' });
      });
      alienWF.addEventListener('mouseleave', () => {
        gsap.to(svg, { rotation: 0, duration: 0.5, ease: 'power2.out' });
      });

      // Parallax scroll: move slightly slower than content
      if (window.ScrollTrigger){
        gsap.to(alienWrap, {
          yPercent: -10,
          ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.4 }
        });
        // Look down slightly while scrolling down
        gsap.to(svg, {
          rotate: -2,
          ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.4 }
        });
      }
    }
  }
})();
