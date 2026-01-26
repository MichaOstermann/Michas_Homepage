// AI ASSISTANT - Terminator-Level Intelligence
(function() {
  'use strict';

  const AI_KNOWLEDGE = {
    scripts: [
      { name: 'Gaming PC Turbo Cleaner', desc: 'Bereinigt 500+ MB, optimiert Gaming-Performance', link: 'scripts/gaming-pc-turbo-cleaner.html' },
      { name: 'Outlook Spam Killer', desc: '20+ Spam-Keywords, automatische Email-Bereinigung', link: 'scripts/outlook-spam-killer.html' },
      { name: 'Security Deep Scanner', desc: '5 Scan-Module, Threat-Level System', link: 'scripts/security-deep-scanner.html' }
    ],
    blog: [
      { title: 'Blog-System Debugging', desc: 'Wie wir das Blog-System repariert haben', link: 'blog/blog-system-debugging.html' },
      { title: 'Musik-Relaunch', desc: 'Upload-System, Cover-Gen, Kommentare', link: 'blog/musik-relaunch.html' }
    ],
    gaming: [
      { game: 'Diablo IV', hours: '150+', genre: 'Action-RPG', link: 'gaming/diablo.html' },
      { game: 'Enshrouded', hours: '80+', genre: 'Survival-RPG', link: 'gaming/enshrouded.html' }
    ]
  };

  class AIAssistant {
    constructor() {
      this.context = [];
      this.personality = 'helpful-terminator'; // Hilfreich aber mit Terminator-Edge
      this.init();
    }

    init() {
      // Erweitere den existierenden Chatbot
      this.enhanceChatbot();
    }

    enhanceChatbot() {
      const chatInput = document.getElementById('chatbot-input');
      const chatSend = document.getElementById('chatbot-send');
      const chatMessages = document.getElementById('chatbot-messages');

      if (!chatInput || !chatSend || !chatMessages) return;

      chatSend.addEventListener('click', () => this.handleMessage(chatInput, chatMessages));
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.handleMessage(chatInput, chatMessages);
      });

      // Quick Replies AI-Enhancement
      document.querySelectorAll('.quick-reply').forEach(btn => {
        btn.addEventListener('click', () => {
          const msg = btn.dataset.message;
          this.handleQuickReply(msg, chatMessages);
        });
      });
    }

    handleMessage(input, container) {
      const userMsg = input.value.trim();
      if (!userMsg) return;

      // Add user message
      this.addMessage(container, userMsg, 'user');
      input.value = '';

      // AI Response
      setTimeout(() => {
        const response = this.generateResponse(userMsg);
        this.addMessage(container, response.text, 'bot', response.suggestions);
      }, 500);
    }

    handleQuickReply(msg, container) {
      this.addMessage(container, msg, 'user');
      
      setTimeout(() => {
        const response = this.generateResponse(msg);
        this.addMessage(container, response.text, 'bot', response.suggestions);
      }, 500);
    }

    generateResponse(userMsg) {
      const msg = userMsg.toLowerCase();

      // PowerShell Scripts
      if (msg.includes('script') || msg.includes('powershell')) {
        return {
          text: `🤖 **SKYNET ANALYSIS:** Ich habe 6 PowerShell-Scripts identifiziert. Die 3 mächtigsten:\n\n
🎮 **Gaming PC Turbo Cleaner** - Bereinigt 500+ MB\n
📧 **Outlook Spam Killer** - Vernichtet Werbe-Mails\n
🛡️ **Security Deep Scanner** - 5 Scan-Module\n\n
**Empfehlung:** Starte mit dem Gaming-Cleaner für sofortigen Performance-Boost!`,
          suggestions: [
            { text: 'Gaming Cleaner Details', action: 'navigate', target: 'scripts/gaming-pc-turbo-cleaner.html' },
            { text: 'Alle Scripts', action: 'navigate', target: 'scripts/index.html' }
          ]
        };
      }

      // Blog
      if (msg.includes('blog') || msg.includes('artikel')) {
        return {
          text: `📝 **DATENBANK-ANALYSE:** 8 Blog-Posts gefunden. Neuester Eintrag:\n\n
🛠️ **Blog-System Debugging** - Heute\n
Vollständige Fehleranalyse und Lösung des Blog-Systems.\n\n
**Weitere Highlights:**\n
🎵 Musik-Relaunch (10.11)\n
🎮 Gaming erweitert (08.11)\n
🚀 Code & Beats v1 Release`,
          suggestions: [
            { text: 'Alle Blog-Posts', action: 'navigate', target: 'blog/index.html' }
          ]
        };
      }

      // Gaming
      if (msg.includes('game') || msg.includes('gaming') || msg.includes('spiel')) {
        return {
          text: `🎮 **GAMING-DATABASE:** 4 Games in meiner Kollektion:\n\n
⚔️ **Diablo IV** - 150+ Stunden (Action-RPG)\n
🏰 **Enshrouded** - 80+ Stunden (Survival-RPG)\n
🎭 **Soulmask** - 45+ Stunden (Tribal-Survival)\n
🦕 **ARK Ascended** - 200+ Stunden (Dino-Survival)\n\n
**Total Playtime:** 475+ Stunden Gaming-Experience!`,
          suggestions: [
            { text: 'Gaming-Section', action: 'navigate', target: '#gaming' }
          ]
        };
      }

      // Music
      if (msg.includes('musik') || msg.includes('song') || msg.includes('track')) {
        return {
          text: `🎵 **AUDIO-ANALYSE:** Musik-CMS mit Upload-System erkannt!\n\n
**Featured Tracks:**\n
🏖️ Life am Strand - Party-Hit\n
🎉 20 Jahre RDMC - Jubiläums-Track\n
🌆 Aus dem Schatten - Synthwave\n\n
**Technologie:** KI-gestützte Vocals, Auto-Mastering, generative Synths!\n
**Alle Songs:** 100% selbst komponiert mit AI-Power! 🚀`,
          suggestions: [
            { text: 'Musik hören', action: 'navigate', target: '#music' }
          ]
        };
      }

      // About Michael
      if (msg.includes('michael') || msg.includes('about') || msg.includes('über')) {
        return {
          text: `👤 **PROFIL-ANALYSE:** Michael Ostermann\n\n
**Skills:**\n
💻 Full-Stack Development\n
🎵 Music Production (AI-powered)\n
⚡ PowerShell Automation\n
🎮 Gaming Content Creation\n\n
**Mission:** Code & Beats vereinen - Technologie trifft Kreativität!\n
**Status:** ONLINE & PRODUKTIV 🚀`,
          suggestions: [
            { text: 'About Section', action: 'navigate', target: '#about' }
          ]
        };
      }

      // Default
      return {
        text: `🤖 **SYSTEM-STATUS:** ONLINE\n\n
Ich bin dein AI-Guide durch Code & Beats!\n\n
**Verfügbare Bereiche:**\n
⚡ PowerShell Scripts (6)\n
📝 Blog Posts (8)\n
🎮 Gaming (4 Games)\n
🎵 Musik (AI-powered)\n\n
**Tipp:** Nutze die Universal Search (STRG+K) für schnelle Navigation!`,
        suggestions: [
          { text: 'PowerShell', action: 'navigate', target: '#powershell' },
          { text: 'Blog', action: 'navigate', target: '#blog' },
          { text: 'Gaming', action: 'navigate', target: '#gaming' }
        ]
      };
    }

    addMessage(container, text, type, suggestions = []) {
      const msgDiv = document.createElement('div');
      msgDiv.className = `message ${type}-message`;
      msgDiv.style.cssText = `
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
        animation: messageSlideIn 0.4s ease;
      `;

      const avatar = document.createElement('div');
      avatar.className = 'message-avatar';
      avatar.textContent = type === 'user' ? '👤' : '🤖';
      avatar.style.cssText = `
        font-size: 2rem;
        filter: drop-shadow(0 0 10px ${type === 'user' ? '#06FFF0' : '#FF1493'});
      `;

      const content = document.createElement('div');
      content.className = 'message-content';
      content.style.cssText = `
        flex: 1;
        background: ${type === 'user' ? 'rgba(6,255,240,0.1)' : 'rgba(139,92,246,0.1)'};
        padding: 1rem 1.5rem;
        border-radius: 12px;
        border: 1px solid ${type === 'user' ? 'rgba(6,255,240,0.3)' : 'rgba(139,92,246,0.3)'};
      `;

      // Parse markdown-style text
      const formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #06FFF0;">$1</strong>');
      content.innerHTML = `<p style="line-height: 1.7; white-space: pre-line;">${formatted}</p>`;

      // Add suggestions
      if (suggestions && suggestions.length > 0) {
        const sugDiv = document.createElement('div');
        sugDiv.style.cssText = 'display: flex; gap: 0.75rem; margin-top: 1rem; flex-wrap: wrap;';
        
        suggestions.forEach(sug => {
          const btn = document.createElement('button');
          btn.textContent = sug.text;
          btn.className = 'chip';
          btn.style.cssText = `
            background: rgba(139,92,246,0.2);
            border: 1px solid rgba(139,92,246,0.4);
            color: #8B5CF6;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.3s;
          `;
          btn.addEventListener('click', () => {
            if (sug.action === 'navigate') {
              window.location.href = sug.target;
            }
          });
          btn.addEventListener('mouseenter', () => {
            btn.style.background = 'rgba(139,92,246,0.3)';
            btn.style.transform = 'scale(1.05)';
          });
          btn.addEventListener('mouseleave', () => {
            btn.style.background = 'rgba(139,92,246,0.2)';
            btn.style.transform = 'scale(1)';
          });
          sugDiv.appendChild(btn);
        });

        content.appendChild(sugDiv);
      }

      msgDiv.appendChild(avatar);
      msgDiv.appendChild(content);
      container.appendChild(msgDiv);

      // Scroll to bottom
      container.scrollTop = container.scrollHeight;
    }
  }

  // Add CSS Animation
  if (!document.getElementById('ai-chat-css')) {
    const style = document.createElement('style');
    style.id = 'ai-chat-css';
    style.textContent = `
      @keyframes messageSlideIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Initialize
  new AIAssistant();

})();

