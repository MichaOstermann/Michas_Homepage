(function(){
  function bindBlogCards(context) {
    const blogCards = (context || document).querySelectorAll('.blog-card[data-href]');
    blogCards.forEach(card => {
      // Verhindere doppelte Bindung
      if (card.hasAttribute('data-card-bound')) return;
      card.setAttribute('data-card-bound', '1');

      const href = card.getAttribute('data-href');
      if (!href) return;

      const navigate = () => { window.location.href = href; };

      card.addEventListener('click', (e) => {
        // Verhindere Navigation wenn auf interaktive Elemente geklickt wurde
        const target = e.target;
        if (target.closest && (target.closest('a') || target.closest('button') || target.closest('input'))) {
          return;
        }
        navigate();
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate();
        }
      });

      card.style.cursor = 'pointer';
    });
  }

  // Initiale Bindung beim DOM-Load
  document.addEventListener('DOMContentLoaded', () => bindBlogCards(document));
  
  // Re-Bindung nach dynamischem Rendern
  document.addEventListener('blog:rendered', () => bindBlogCards(document));
  
  // Exportiere Funktion für manuellen Aufruf
  window.bindBlogCards = bindBlogCards;
})();
