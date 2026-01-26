// EPIC INTRO - Kurz & Knackig!
(function() {
  'use strict';

  const STORAGE_KEY = 'codebeats_intro_shown';
  if (sessionStorage.getItem(STORAGE_KEY)) return;

  // Create Intro
  const intro = document.createElement('div');
  intro.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #000;
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  `;

  intro.innerHTML = `
    <div style="text-align: center; position: relative;">
      <div id="introText" style="font-size: 120px; font-weight: 900; background: linear-gradient(135deg, #06FFF0, #8B5CF6, #FF1493); -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: textGlow 1.5s ease-in-out infinite; filter: drop-shadow(0 0 40px rgba(6,255,240,0.8)) drop-shadow(0 0 80px rgba(255,20,147,0.6));">
        CODE & BEATS
      </div>
      <div style="font-size: 28px; color: rgba(255,255,255,0.8); margin-top: 20px; animation: fadeIn 1s ease 0.5s both;">
        🤖 AI-Powered Future Portal
      </div>
      <button onclick="skipIntro()" style="position: absolute; top: -100px; right: -100px; background: rgba(6,255,240,0.2); border: 2px solid #06FFF0; color: #06FFF0; padding: 10px 30px; border-radius: 20px; cursor: pointer; font-weight: 700;">
        SKIP
      </button>
    </div>
  `;

  document.body.appendChild(intro);
  document.body.style.overflow = 'hidden';

  // Styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes textGlow {
      0%, 100% { 
        filter: drop-shadow(0 0 40px rgba(6,255,240,0.8)) drop-shadow(0 0 80px rgba(255,20,147,0.6));
      }
      50% { 
        filter: drop-shadow(0 0 60px rgba(6,255,240,1)) drop-shadow(0 0 100px rgba(255,20,147,0.8)) drop-shadow(0 0 140px rgba(139,92,246,0.6));
      }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  // Auto end after 3 seconds
  window.skipIntro = function() {
    sessionStorage.setItem(STORAGE_KEY, 'true');
    intro.style.animation = 'fadeOut 0.8s ease';
    setTimeout(() => {
      intro.remove();
      document.body.style.overflow = '';
    }, 800);
  };

  setTimeout(skipIntro, 8000);

  // ESC to skip
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') skipIntro();
  });

})();
