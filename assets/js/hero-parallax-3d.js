// 3D Parallax Hero - Mouse-based depth effects
(function() {
  'use strict';

  const hero = document.querySelector('#hero, .hero-section');
  if (!hero) return;

  const parallaxElements = hero.querySelectorAll('[data-parallax]');
  if (parallaxElements.length === 0) return;

  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  // Smooth mouse tracking
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    mouseY = (e.clientY - rect.top) / rect.height - 0.5;
  });

  // Smooth animation loop
  function animate() {
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    parallaxElements.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 1;
      const x = targetX * speed * 50;
      const y = targetY * speed * 50;
      const rotateY = targetX * speed * 10;
      const rotateX = -targetY * speed * 10;

      el.style.transform = `
        translate3d(${x}px, ${y}px, 0)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
      `;
    });

    requestAnimationFrame(animate);
  }

  animate();

  // Tilt effect on hero
  hero.style.transformStyle = 'preserve-3d';
  hero.style.perspective = '1000px';

})();



