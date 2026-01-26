/* IntersectionObserver-based reveal animations for elements with .reveal */
(function(){
  if (!('IntersectionObserver' in window)) return;

  function initReveal() {
    const els = Array.from(document.querySelectorAll('.reveal'))
      .filter(el => !el.hasAttribute('data-io-bound'));
    
    if (els.length === 0) return;
    
    els.forEach(el => el.setAttribute('data-io-bound','1'));

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          const el = entry.target;
          const d = parseInt(el.getAttribute('data-delay')||'0', 10);
          el.style.setProperty('--reveal-delay', (isNaN(d)?0:d)+'ms');
          el.classList.add('is-visible');
          io.unobserve(el);
        }
      });
    }, { root: null, threshold: 0.15 });

    els.forEach(el => io.observe(el));
  }

  // Initiale Reveal-Bindung
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveal);
  } else {
    initReveal();
  }

  // Re-Initialisierung nach dynamischem Content-Rendering
  document.addEventListener('blog:rendered', initReveal);
  
  // Exportiere für manuellen Aufruf
  window.initReveal = initReveal;
})();
