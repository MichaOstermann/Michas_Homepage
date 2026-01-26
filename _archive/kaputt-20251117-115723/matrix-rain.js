// MATRIX RAIN - Terminator Style Background
(function() {
  'use strict';

  const canvas = document.createElement('canvas');
  canvas.id = 'matrixRain';
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -1;
    opacity: 0.15;
    pointer-events: none;
  `;
  document.body.insertBefore(canvas, document.body.firstChild);

  const ctx = canvas.getContext('2d');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Matrix characters - Binary + Kanji + Tech symbols
  const chars = '01アイウエオカキクケコサシスセソタチツテト01234567890@#$%^&*(){}[]<>?/|\\~`';
  const fontSize = 14;
  const columns = canvas.width / fontSize;
  
  const drops = [];
  for (let i = 0; i < columns; i++) {
    drops[i] = Math.random() * -100;
  }

  const colors = [
    '#06FFF0',  // Cyan
    '#8B5CF6',  // Violet
    '#00FF88',  // Green
    '#FF1493'   // Pink
  ];

  function draw() {
    // Fade effect
    ctx.fillStyle = 'rgba(11, 15, 22, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
      // Random character
      const char = chars[Math.floor(Math.random() * chars.length)];
      
      // Color variation
      const colorIndex = Math.floor(i / (columns / colors.length));
      const color = colors[colorIndex % colors.length];
      
      // Brightness based on position
      const alpha = 1 - (drops[i] % 20) / 20;
      ctx.fillStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');

      // Draw character
      ctx.fillText(char, i * fontSize, drops[i] * fontSize);

      // Reset drop or move down
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  setInterval(draw, 50);

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

})();

