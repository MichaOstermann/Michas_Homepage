// KPI Updater: updates homepage stat badges from data sources
(function() {
  function setKpi(label, value) {
    var badges = document.querySelectorAll('.stat-badge-mega');
    badges.forEach(function(badge) {
      var labelEl = Array.from(badge.querySelectorAll('div')).find(function(el) {
        return el.textContent && el.textContent.trim() === label;
      });
      if (labelEl && labelEl.previousElementSibling) {
        labelEl.previousElementSibling.textContent = String(value);
      }
    });
  }

  function updateFromJson(url, key, label) {
    return fetch(url + '?v=' + Date.now())
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var arr = data && data[key];
        if (Array.isArray(arr)) {
          var value = arr.length;
          if (Array.isArray(label)) {
            label.forEach(function(l) { setKpi(l, value); });
          } else {
            setKpi(label, value);
          }
        }
      })
      .catch(function() { /* silent */ });
  }

  function updateGames() {
    // Count visible game cards in the gaming section on the homepage
    var cards = document.querySelectorAll('#gaming .grid.grid--cards > article.card');
    if (cards && cards.length) {
      setKpi('Games', cards.length);
    }
  }

  function init() {
    updateFromJson('assets/content/blog.json', 'posts', ['Blog-Beiträge', 'Blog Posts']);
    updateFromJson('assets/content/scripts.json', 'scripts', 'Power-Scripts');
    updateGames();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
