/**
 * SIMPLE TEST VERSION - Hero Background
 */

console.log('🔥 HERO BACKGROUND SCRIPT LOADED!');

// Warte auf DOM
window.addEventListener('DOMContentLoaded', function() {
  console.log('🔥 DOM READY - Starte Background Init');
  
  const canvas = document.getElementById('heroViz');
  console.log('🔥 Canvas Element:', canvas);
  
  if (!canvas) {
    console.error('❌ CANVAS NICHT GEFUNDEN!');
    return;
  }
  
  console.log('✅ Canvas gefunden! Width:', canvas.offsetWidth, 'Height:', canvas.offsetHeight);
  
  // Setze Canvas Größe
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const ctx = canvas.getContext('2d');
  
  // Einfacher Test: Zeichne einen großen roten Kreis
  ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 100, 0, Math.PI * 2);
  ctx.fill();
  
  console.log('✅ Roter Kreis gezeichnet!');
  
  // Animierte Sterne
  const stars = [];
  for (let i = 0; i < 100; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.5 + 0.2
    });
  }
  
  function animate() {
    // Leicht transparentes schwarzes Overlay für Trail-Effekt
    ctx.fillStyle = 'rgba(11, 15, 22, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Zeichne und bewege Sterne
    ctx.fillStyle = '#06FFF0';
    stars.forEach(star => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
      
      star.y += star.speed;
      if (star.y > canvas.height) {
        star.y = 0;
        star.x = Math.random() * canvas.width;
      }
    });
    
    requestAnimationFrame(animate);
  }
  
  console.log('🚀 Starte Animation Loop');
  animate();
});

console.log('🔥 HERO BACKGROUND SCRIPT ENDE');
