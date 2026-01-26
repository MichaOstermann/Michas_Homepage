// ============================================================
// Template Protection System
// ============================================================

(function() {
  'use strict';

  // Disable right-click
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  });

  // Disable dev tools shortcuts
  document.addEventListener('keydown', function(e) {
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 's')) {
      e.preventDefault();
      return false;
    }
  });

  // Watermark
  const watermark = document.createElement('div');
  watermark.style.cssText = `
    position: fixed;
    bottom: 10px;
    right: 10px;
    font-size: 10px;
    color: rgba(148, 163, 184, 0.4);
    z-index: 9999;
    pointer-events: none;
    font-family: monospace;
  `;
  watermark.textContent = '© CodeBeats Templates';
  document.body.appendChild(watermark);

  // Console warning
  console.log('%c🛑 STOP!', 'color: #FF6B00; font-size: 3rem; font-weight: bold;');
  console.log('%cDies ist ein geschütztes Iron Thunder Template.', 'color: #FF6B00; font-size: 1.2rem;');
  console.log('%cUnerlaubtes Kopieren ist nicht gestattet.', 'font-size: 1rem;');
  
})();
