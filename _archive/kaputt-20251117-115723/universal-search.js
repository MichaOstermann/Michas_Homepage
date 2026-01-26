// Universal Search
(function() {
  const searchBtn = document.getElementById('searchButton');
  const searchModal = document.getElementById('searchModal');
  const searchInput = document.getElementById('searchInput');
  const searchClose = document.getElementById('searchClose');

  if (!searchBtn || !searchModal) return;

  function openSearch() {
    searchModal.style.display = 'flex';
    setTimeout(() => {
      searchModal.style.opacity = '1';
      searchInput?.focus();
    }, 10);
  }

  function closeSearch() {
    searchModal.style.opacity = '0';
    setTimeout(() => {
      searchModal.style.display = 'none';
      if (searchInput) searchInput.value = '';
    }, 300);
  }

  searchBtn.addEventListener('click', openSearch);
  searchClose?.addEventListener('click', closeSearch);
  searchModal.addEventListener('click', (e) => {
    if (e.target === searchModal) closeSearch();
  });

  // STRG+K
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
    if (e.key === 'Escape') closeSearch();
  });

  // Complete Search Index - ALL Content
  const searchData = [
    // PowerShell Scripts (6)
    { title: 'Gaming PC Turbo Cleaner', type: 'Script', href: 'scripts/gaming-pc-turbo-cleaner.html', desc: 'Bereinigt 500+ MB, optimiert Performance' },
    { title: 'Outlook Spam Killer', type: 'Script', href: 'scripts/outlook-spam-killer.html', desc: '20+ Keywords, automatische Spam-Erkennung' },
    { title: 'Security Deep Scanner', type: 'Script', href: 'scripts/security-deep-scanner.html', desc: '5 Scan-Module, umfassende Sicherheitsprüfung' },
    { title: 'MailStore Analyse', type: 'Script', href: 'scripts/mailstore-analyse.html', desc: 'Analysiere MailStore-Dateien, finde Speicherfresser' },
    { title: 'WSUS Scan', type: 'Script', href: 'scripts/wsus-scan.html', desc: 'Scanne WSUS-Server, prüfe Updates' },
    { title: 'AD User Creation Tool', type: 'Script', href: 'scripts/ad-user-creation-tool.html', desc: 'Automatisierte Active Directory Benutzeranlage' },
    
    // Blog Posts (8)
    { title: 'Blog-System Debugging', type: 'Blog', href: 'blog/blog-system-debugging.html', desc: 'JavaScript-Fehler behoben, System optimiert' },
    { title: 'Musik-Sektion Relaunch', type: 'Blog', href: 'blog/musik-relaunch.html', desc: 'Upload-System, automatische Cover-Generierung' },
    { title: 'Gaming-Sektion massiv erweitert', type: 'Blog', href: 'blog/gaming-sektion-erweitert.html', desc: 'Vier neue Spielprofile mit Videos und Builds' },
    { title: 'Alien Bio-Tech Hero-Sektion', type: 'Blog', href: 'blog/alien-style-hero.html', desc: 'Neon-Partikel, organische Animationen' },
    { title: 'Release: Code & Beats v1', type: 'Blog', href: 'blog/release-code-beats-v1.html', desc: 'Erstes stabiles Release, neues Design-System' },
    { title: 'PowerShell - Scripts, die Zeit sparen', type: 'Blog', href: 'blog/powershell-scripts-die-zeit-sparen.html', desc: 'Struktur, Signierung und Distribution' },
    { title: 'Sounddesign - Neon Atmos', type: 'Blog', href: 'blog/sounddesign-neon-atmos.html', desc: 'Pads, Arps und Texturen für moderne Tracks' },
    { title: 'Chatbot-Integration: Live & Funktional', type: 'Blog', href: 'blog/chatbot-integration-live.html', desc: 'Selbstgehosteter Bot mit Quick Replies' },
    
    // Gaming (4)
    { title: 'Diablo IV', type: 'Gaming', href: 'gaming/diablo.html', desc: 'Action-RPG, Builds und Guides aus Sanktuario' },
    { title: 'ARK: Survival Evolved', type: 'Gaming', href: 'gaming/ark.html', desc: 'Survival-Spiel, Dinosaurier und Basenbau' },
    { title: 'Enshrouded', type: 'Gaming', href: 'gaming/enshrouded.html', desc: 'Action-RPG, Builds und Basen in Embervale' },
    { title: 'Soulmask', type: 'Gaming', href: 'gaming/soulmask.html', desc: 'Survival-Spiel, Stamm und Masken' },
    
    // Musik (10)
    { title: 'Life am Strand', type: 'Musik', href: 'Musik/index.html', desc: 'Ballermann Hit über Micha den Barkeeper' },
    { title: '20 Jahre RDMC Oldenburg', type: 'Musik', href: 'Musik/index.html', desc: 'Jubiläums-Track mit Partystimmung' },
    { title: 'Aus dem Schatten', type: 'Musik', href: 'Musik/index.html', desc: 'Dunkler Synthwave mit treibendem Beat' },
    { title: 'Kein Lied für Helden', type: 'Musik', href: 'Musik/index.html', desc: 'Kraftvoller Rocksong mit Message' },
    { title: 'Keiner hat noch Geld', type: 'Musik', href: 'Musik/index.html', desc: 'Gesellschaftskritischer Party-Track' },
    { title: 'Love 2025', type: 'Musik', href: 'Musik/index.html', desc: 'Moderne Liebesballade mit elektronischen Elementen' },
    { title: 'Mein kleiner König', type: 'Musik', href: 'Musik/index.html', desc: 'Emotionale Ballade für die Kleinen' },
    { title: 'Die Nacht zählt mit uns', type: 'Musik', href: 'Musik/index.html', desc: 'Nächtlicher Synthwave-Track, atmosphärisch' },
    { title: '20 Years RDMC Oldenburg Englisch', type: 'Musik', href: 'Musik/index.html', desc: 'Jubiläums Song zum 20. Anni Red Devils' },
    { title: 'Jam und Krabbe', type: 'Musik', href: 'Musik/index.html', desc: 'Für Freunde von Freunden' }
  ];

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const results = document.getElementById('searchResults');
      
      if (!query || query.length < 2) {
        results.innerHTML = '<div style="text-align: center; padding: 3rem; color: rgba(255,255,255,0.5);"><div style="font-size: 3rem;">🔍</div><p>Tippe um zu suchen...</p></div>';
        return;
      }
      
      const matches = searchData.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.desc.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query)
      );
      
      if (matches.length === 0) {
        results.innerHTML = '<div style="text-align: center; padding: 3rem; color: rgba(255,255,255,0.5);"><div style="font-size: 3rem;">❌</div><p>Keine Ergebnisse für "' + query + '"</p></div>';
        return;
      }
      
      results.innerHTML = matches.map(item => `
        <a href="${item.href}" style="display: block; padding: 1.5rem; background: rgba(11,15,22,0.8); border: 1px solid rgba(6,255,240,0.2); border-radius: 12px; margin-bottom: 1rem; text-decoration: none; transition: all 0.3s;" onmouseover="this.style.borderColor='rgba(6,255,240,0.6)'; this.style.background='rgba(6,255,240,0.05)';" onmouseout="this.style.borderColor='rgba(6,255,240,0.2)'; this.style.background='rgba(11,15,22,0.8)';">
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
            <span style="background: rgba(6,255,240,0.2); color: #06FFF0; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem;">${item.type}</span>
            <h3 style="color: #FFF; font-size: 1.2rem; margin: 0;">${item.title}</h3>
          </div>
          <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 0.95rem;">${item.desc}</p>
        </a>
      `).join('');
    });
  }
})();

