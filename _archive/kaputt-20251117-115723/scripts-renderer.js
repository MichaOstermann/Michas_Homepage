(function () {
  var isInScriptsDirectory = (window.location.pathname || "").indexOf("/scripts/") !== -1;
  var DATA_URL = isInScriptsDirectory
    ? "../assets/content/scripts.json"
    : "assets/content/scripts.json";

  var HIGHLIGHT_SELECTOR = "[data-scripts-highlight]";
  var LIST_SELECTOR = "[data-scripts-list]";
  var scripts = [];

  function normaliseScripts(data) {
    if (!data || !Array.isArray(data.scripts)) return [];
    
    return data.scripts.map(function (item) {
      var href = item.href || "#";
      if (isInScriptsDirectory && href.indexOf("scripts/") === 0) {
        href = href.substring(8);
      }
      return {
        slug: item.slug || "",
        href: href,
        title: item.title || "Unbenanntes Script",
        category: item.category || "System",
        emoji: item.emoji || "⚡",
        difficulty: item.difficulty || "Anfänger",
        excerpt: item.excerpt || "",
        downloadFile: item.downloadFile || "",
        version: item.version || "1.0",
        verified: item.verified || false
      };
    }).sort(function (a, b) {
      return new Date(b.date || 0) - new Date(a.date || 0);
    });
  }

  function createCard(script) {
    var article = document.createElement("article");
    article.className = "card reveal";
    article.style.cssText = "background: rgba(11,15,22,0.8); border: 2px solid rgba(6,255,240,0.3); border-radius: 16px; padding: 2rem; cursor: pointer; transition: all 0.3s;";
    article.onclick = function() { window.location.href = script.href; };

    // Get rating badge if rating system is loaded
    var ratingBadge = '';
    if (window.scriptRating) {
      ratingBadge = window.scriptRating.renderRatingBadge(script.slug);
    }

    article.innerHTML = `
      <div style="font-size: 3rem; margin-bottom: 1rem;">${script.emoji}</div>
      <h3 style="font-size: 1.5rem; color: #06FFF0; margin-bottom: 1rem;">${script.title}</h3>
      <p style="color: rgba(255,255,255,0.7); margin-bottom: 1rem;">${script.excerpt}</p>
      ${ratingBadge}
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;">
        <span style="background: rgba(6,255,240,0.2); color: #06FFF0; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem;">v${script.version}</span>
        <span style="background: rgba(139,92,246,0.2); color: #8B5CF6; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem;">${script.category}</span>
        ${script.verified ? '<span style="background: rgba(0,255,136,0.2); color: #00FF88; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem;">✓ Verified</span>' : ''}
      </div>
    `;

    return article;
  }

  function renderHighlights() {
    var container = document.querySelector(HIGHLIGHT_SELECTOR);
    if (!container) return;
    
    container.innerHTML = '';
    scripts.slice(0, 3).forEach(function(script) {
      container.appendChild(createCard(script));
    });
  }

  function renderList() {
    var container = document.querySelector(LIST_SELECTOR);
    if (!container) return;
    
    container.innerHTML = '';
    scripts.forEach(function(script) {
      container.appendChild(createCard(script));
    });
  }

  fetch(DATA_URL)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      scripts = normaliseScripts(data);
      renderHighlights();
      renderList();
    })
    .catch(function(e) {
      console.error('Scripts loading failed:', e);
    });
})();



