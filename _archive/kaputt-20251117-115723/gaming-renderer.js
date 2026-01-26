// Gaming Renderer - Rendert Gaming-Links dynamisch
(function() {
  const GAMING_DATA = [
    {
      title: 'Diablo IV',
      href: 'gaming/diablo.html',
      emoji: '👹',
      desc: 'Action-RPG, Builds und Guides aus Sanktuario',
      color: '#C80000'
    },
    {
      title: 'ARK: Survival Evolved',
      href: 'gaming/ark.html',
      emoji: '🦖',
      desc: 'Survival-Spiel, Dinosaurier und Basenbau',
      color: '#228B22'
    },
    {
      title: 'Enshrouded',
      href: 'gaming/enshrouded.html',
      emoji: '⚔️',
      desc: 'Action-RPG, Builds und Basen in Embervale',
      color: '#DAA520'
    },
    {
      title: 'Soulmask',
      href: 'gaming/soulmask.html',
      emoji: '🎭',
      desc: 'Survival-Spiel, Stamm und Masken',
      color: '#9370DB'
    }
  ];
  
  const HIGHLIGHT_SELECTOR = '[data-gaming-highlight]';
  
  function createCard(game, delay) {
    const article = document.createElement('article');
    article.className = 'card reveal';
    article.setAttribute('data-delay', String(delay || 0));
    article.style.cssText = `
      background: rgba(11,15,22,0.8);
      border: 2px solid ${game.color}40;
      border-radius: 16px;
      padding: 2rem;
      cursor: pointer;
      transition: all 0.3s;
      text-align: center;
    `;
    article.onmouseover = function() {
      this.style.borderColor = game.color + '80';
      this.style.background = game.color + '10';
      this.style.transform = 'translateY(-4px)';
    };
    article.onmouseout = function() {
      this.style.borderColor = game.color + '40';
      this.style.background = 'rgba(11,15,22,0.8)';
      this.style.transform = 'translateY(0)';
    };
    article.onclick = function() {
      window.location.href = game.href;
    };
    
    article.innerHTML = `
      <div style="font-size: 4rem; margin-bottom: 1rem; filter: drop-shadow(0 0 20px ${game.color}80);">${game.emoji}</div>
      <h3 style="font-size: 1.5rem; color: ${game.color}; margin-bottom: 0.5rem; font-weight: 700;">${game.title}</h3>
      <p style="color: rgba(255,255,255,0.7); font-size: 0.95rem; margin: 0;">${game.desc}</p>
    `;
    
    return article;
  }
  
  function renderHighlights() {
    const container = document.querySelector(HIGHLIGHT_SELECTOR);
    if (!container) return;
    
    container.innerHTML = '';
    
    GAMING_DATA.forEach(function(game, index) {
      container.appendChild(createCard(game, index * 80));
    });
  }
  
  // Bootstrap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderHighlights);
  } else {
    renderHighlights();
  }
})();



