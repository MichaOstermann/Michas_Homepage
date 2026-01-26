// Music Renderer - Lädt Tracks aus tracks.json und rendert sie
(function() {
  const DATA_URL = 'Musik/tracks.json';
  const HIGHLIGHT_SELECTOR = '[data-music-highlight]';
  const MAX_HIGHLIGHTS = 3;
  
  let tracks = [];
  
  function normaliseTracks(data) {
    if (!data || !Array.isArray(data.tracks)) return [];
    
    return data.tracks.map(function(item) {
      let coverPath = 'assets/media/cover-default.svg';
      let audioPath = '';
      let folder = item.folder || 'assets/media';
      
      // Cover-Pfad
      if (item.cover) {
        if (item.coverGenerated) {
          coverPath = 'Musik/' + item.cover;
        } else if (item.cover.startsWith('assets/') || item.cover.startsWith('Musik/')) {
          coverPath = item.cover;
        } else if (item.cover.startsWith('covers/')) {
          coverPath = 'Musik/' + item.cover;
        } else {
          coverPath = folder + '/' + item.cover;
        }
      }
      
      // Audio-Pfad
      if (item.audio) {
        if (item.audio.startsWith('assets/') || item.audio.startsWith('Musik/')) {
          audioPath = item.audio;
        } else {
          audioPath = folder + '/' + item.audio;
        }
      }
      
      // Download-Name
      let downloadName = item.downloadName || (item.title + '.mp3');
      if (!downloadName.includes('Michael Ostermann')) {
        downloadName = 'Michael Ostermann - ' + downloadName;
      }
      
      return {
        id: item.id || item.title.toLowerCase().replace(/\s+/g, '-'),
        title: item.title || 'Unbekannter Track',
        description: item.description || '',
        category: item.category || 'gemischt',
        cover: coverPath,
        audio: audioPath,
        downloadName: downloadName,
        isNew: item.isNew || false
      };
    });
  }
  
  function createCard(track, delay) {
    const article = document.createElement('article');
    article.className = 'card card--track music-card reveal';
    article.setAttribute('data-delay', String(delay || 0));
    article.setAttribute('data-category', track.category);
    
    const songId = track.id || track.title.toLowerCase().replace(/\s+/g, '-');
    
    article.innerHTML = `
      <img class="card__media music-card-image" src="${track.cover}" alt="${track.title} Cover" loading="lazy" />
      <div class="card__body">
        <h3 class="card__title">${track.title}</h3>
        <p class="card__text txt-dim" style="margin-top: 0.5rem; font-size: 0.9rem;">${track.description}</p>
        ${track.isNew ? '<div class="badge badge--new" aria-label="Neu">Neu</div>' : ''}
        <audio class="card__player music-player" controls preload="metadata">
          <source src="${track.audio}" type="audio/mpeg" />
          Dein Browser unterstützt das Audio-Element nicht.
        </audio>
        <div class="rating-widget" data-song-id="${songId}">
          <div class="rating-stars">
            <span class="rating-star">⭐</span>
            <span class="rating-star">⭐</span>
            <span class="rating-star">⭐</span>
            <span class="rating-star">⭐</span>
            <span class="rating-star">⭐</span>
          </div>
          <div class="rating-info">
            <span class="rating-average">0.0</span>
            <span class="rating-count">(0 Bewertungen)</span>
          </div>
        </div>
        <div class="card__actions">
          <a class="btn btn--glass btn-download" href="${track.audio}" download="${track.downloadName}">Download</a>
        </div>
      </div>
    `;
    
    return article;
  }
  
  function renderHighlights() {
    const container = document.querySelector(HIGHLIGHT_SELECTOR);
    if (!container) return;
    
    container.innerHTML = '';
    
    const highlights = tracks.slice(0, MAX_HIGHLIGHTS);
    
    if (highlights.length === 0) {
      const emptyMsg = container.querySelector('[data-music-empty]');
      if (emptyMsg) emptyMsg.style.display = 'block';
      return;
    }
    
    const emptyMsg = container.querySelector('[data-music-empty]');
    if (emptyMsg) emptyMsg.style.display = 'none';
    
    highlights.forEach(function(track, index) {
      container.appendChild(createCard(track, index * 60));
    });
  }
  
  // Lade Daten und rendere (wie scripts-renderer.js)
  function init() {
    const container = document.querySelector(HIGHLIGHT_SELECTOR);
    if (!container) {
      // Container noch nicht da, versuche es später
      setTimeout(init, 50);
      return;
    }
    
    fetch(DATA_URL)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        tracks = normaliseTracks(data);
        renderHighlights();
      })
      .catch(function(e) {
        console.error('Musik-Daten konnten nicht geladen werden:', e);
      });
  }
  
  // Starte sofort (defer wartet auf DOM)
  init();
})();
