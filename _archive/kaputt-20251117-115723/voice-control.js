// VOICE CONTROL - Terminator Voice Interface
(function() {
  'use strict';

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('Voice Control not supported in this browser');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'de-DE';
  recognition.continuous = false;
  recognition.interimResults = false;

  let isListening = false;
  let voiceButton = null;

  // Create Voice Control Button
  function createVoiceButton() {
    const btn = document.createElement('button');
    btn.id = 'voiceControl';
    btn.setAttribute('aria-label', 'Sprachsteuerung aktivieren');
    btn.style.cssText = `
      position: fixed;
      bottom: 2rem;
      left: 2rem;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #FF1493 0%, #8B5CF6 100%);
      border: 2px solid rgba(255,20,147,0.5);
      box-shadow: 0 8px 30px rgba(255,20,147,0.4);
      cursor: pointer;
      z-index: 9998;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
    `;

    btn.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>
    `;

    btn.addEventListener('click', toggleVoiceControl);
    document.body.appendChild(btn);
    voiceButton = btn;
  }

  function toggleVoiceControl() {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }

  function startListening() {
    isListening = true;
    recognition.start();

    if (voiceButton) {
      voiceButton.style.background = 'linear-gradient(135deg, #00FF88 0%, #06FFF0 100%)';
      voiceButton.style.animation = 'voicePulse 1s ease-in-out infinite';
      voiceButton.style.boxShadow = '0 8px 30px rgba(0,255,136,0.6)';
    }

    showVoiceIndicator('Ich höre zu... 🎤');
  }

  function stopListening() {
    isListening = false;
    recognition.stop();

    if (voiceButton) {
      voiceButton.style.background = 'linear-gradient(135deg, #FF1493 0%, #8B5CF6 100%)';
      voiceButton.style.animation = 'none';
      voiceButton.style.boxShadow = '0 8px 30px rgba(255,20,147,0.4)';
    }
  }

  function showVoiceIndicator(text) {
    let indicator = document.getElementById('voiceIndicator');
    
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'voiceIndicator';
      indicator.style.cssText = `
        position: fixed;
        bottom: 6rem;
        left: 2rem;
        background: rgba(11,15,22,0.95);
        border: 2px solid rgba(0,255,136,0.5);
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(0,255,136,0.4);
        z-index: 9997;
        color: #00FF88;
        font-weight: 600;
        animation: slideInLeft 0.3s ease;
      `;
      document.body.appendChild(indicator);
    }

    indicator.textContent = text;
    indicator.style.display = 'block';
  }

  function hideVoiceIndicator() {
    const indicator = document.getElementById('voiceIndicator');
    if (indicator) {
      indicator.style.animation = 'slideOutLeft 0.3s ease';
      setTimeout(() => {
        indicator.style.display = 'none';
      }, 300);
    }
  }

  // Handle recognition result
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    console.log('Voice Command:', transcript);
    
    showVoiceIndicator(`Verstanden: "${transcript}"`);
    executeVoiceCommand(transcript);

    setTimeout(() => {
      hideVoiceIndicator();
      stopListening();
    }, 2000);
  };

  recognition.onerror = (event) => {
    console.error('Voice Recognition Error:', event.error);
    showVoiceIndicator('⚠️ Fehler beim Verstehen');
    setTimeout(() => {
      hideVoiceIndicator();
      stopListening();
    }, 2000);
  };

  function executeVoiceCommand(command) {
    const cmd = command.toLowerCase();

    // Navigation commands
    if (cmd.includes('musik') || cmd.includes('song')) {
      document.getElementById('music').scrollIntoView({ behavior: 'smooth' });
    }
    else if (cmd.includes('script') || cmd.includes('powershell')) {
      document.getElementById('powershell').scrollIntoView({ behavior: 'smooth' });
    }
    else if (cmd.includes('gaming') || cmd.includes('spiel')) {
      document.getElementById('gaming').scrollIntoView({ behavior: 'smooth' });
    }
    else if (cmd.includes('blog')) {
      document.getElementById('blog').scrollIntoView({ behavior: 'smooth' });
    }
    else if (cmd.includes('kontakt') || cmd.includes('contact')) {
      document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    }
    else if (cmd.includes('suche') || cmd.includes('search')) {
      document.getElementById('searchButton')?.click();
    }
    else if (cmd.includes('dashboard')) {
      window.location.href = 'dashboard.html';
    }
    else {
      showVoiceIndicator('🤖 Befehl nicht erkannt. Versuche "Musik", "Scripts", "Gaming" oder "Blog"');
    }
  }

  // Add CSS Animations
  if (!document.getElementById('voice-control-css')) {
    const style = document.createElement('style');
    style.id = 'voice-control-css';
    style.textContent = `
      @keyframes voicePulse {
        0%, 100% {
          box-shadow: 0 8px 30px rgba(0,255,136,0.6);
          transform: scale(1);
        }
        50% {
          box-shadow: 0 8px 50px rgba(0,255,136,0.8), 0 0 0 10px rgba(0,255,136,0.2);
          transform: scale(1.05);
        }
      }

      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-100px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes slideOutLeft {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(-100px);
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Initialize
  createVoiceButton();

  // Keyboard shortcut: STRG+Shift+V
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'V') {
      e.preventDefault();
      toggleVoiceControl();
    }
  });

})();

