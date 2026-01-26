// ============================================================
// Template Protection System
// ============================================================

(function() {
  'use strict';

  // Disable right-click context menu
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  });

  // Disable specific keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Disable F12
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }
    
    // Disable Ctrl+Shift+I (Inspect)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      return false;
    }
    
    // Disable Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
      e.preventDefault();
      return false;
    }
    
    // Disable Ctrl+Shift+C (Inspect Element)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      return false;
    }
    
    // Disable Ctrl+U (View Source)
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      return false;
    }
    
    // Disable Ctrl+S (Save Page)
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      return false;
    }
  });

  // Add watermark
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
  console.log('%cStop!', 'color: #EF4444; font-size: 3rem; font-weight: bold;');
  console.log('%cDies ist ein geschütztes CodeBeats Template.', 'color: #0EA5E9; font-size: 1.2rem;');
  console.log('%cUnerlaubtes Kopieren oder Reverse Engineering ist nicht gestattet.', 'font-size: 1rem;');
  
})();
