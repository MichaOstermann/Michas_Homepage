(function(){
  function bindScriptCards(context) {
    var scriptCards = (context || document).querySelectorAll('.script-card[data-href]');
    scriptCards.forEach(function(card) {
      // Verhindere doppelte Bindung
      if (card.hasAttribute('data-card-bound')) return;
      card.setAttribute('data-card-bound', '1');

      var href = card.getAttribute('data-href');
      if (!href) return;

      var navigate = function() { window.location.href = href; };

      card.addEventListener('click', function(e) {
        // Verhindere Navigation wenn auf interaktive Elemente geklickt wurde
        var target = e.target;
        if (target.closest && (target.closest('a') || target.closest('button') || target.closest('input'))) {
          return;
        }
        navigate();
      });

      card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate();
        }
      });

      card.style.cursor = 'pointer';
    });
  }

  // Initiale Bindung beim DOM-Load
  document.addEventListener('DOMContentLoaded', function() { bindScriptCards(document); });
  
  // Re-Bindung nach dynamischem Rendern
  document.addEventListener('scripts:rendered', function() { bindScriptCards(document); });
  
  // Exportiere Funktion für manuellen Aufruf
  window.bindScriptCards = bindScriptCards;
})();



