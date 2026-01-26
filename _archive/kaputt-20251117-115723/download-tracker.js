// Download Counter & Rating System
(function() {
  'use strict';

  const STORAGE_KEY = 'codebeats_downloads';
  const RATING_KEY = 'codebeats_ratings';

  // Get download counts from localStorage
  function getDownloadCounts() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  // Save download count
  function incrementDownload(itemId, itemType) {
    const counts = getDownloadCounts();
    const key = `${itemType}_${itemId}`;
    counts[key] = (counts[key] || 0) + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
    return counts[key];
  }

  // Get rating
  function getRating(itemId, itemType) {
    try {
      const ratings = JSON.parse(localStorage.getItem(RATING_KEY) || '{}');
      return ratings[`${itemType}_${itemId}`] || 0;
    } catch {
      return 0;
    }
  }

  // Set rating
  function setRating(itemId, itemType, rating) {
    try {
      const ratings = JSON.parse(localStorage.getItem(RATING_KEY) || '{}');
      ratings[`${itemType}_${itemId}`] = rating;
      localStorage.setItem(RATING_KEY, JSON.stringify(ratings));
      return rating;
    } catch {
      return 0;
    }
  }

  // Track download links
  document.addEventListener('click', (e) => {
    const downloadLink = e.target.closest('a[download], a[href*=".ps1"], a[href*=".mp3"]');
    if (!downloadLink) return;

    const href = downloadLink.getAttribute('href');
    if (!href) return;

    // Extract item ID from href
    let itemId = href.split('/').pop().replace(/\.(ps1|mp3)$/, '');
    let itemType = href.includes('.ps1') ? 'script' : 'music';

    // Increment counter
    const newCount = incrementDownload(itemId, itemType);

    // Show toast notification
    showDownloadToast(newCount, itemType);
  });

  function showDownloadToast(count, type) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: linear-gradient(135deg, rgba(0,255,136,0.95) 0%, rgba(6,255,240,0.95) 100%);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,255,136,0.4);
      z-index: 9999;
      font-weight: 600;
      animation: slideInUp 0.3s ease;
    `;
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>Download gestartet! #${count}</span>
      </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOutDown 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Add CSS animations
  if (!document.getElementById('download-tracker-css')) {
    const style = document.createElement('style');
    style.id = 'download-tracker-css';
    style.textContent = `
      @keyframes slideInUp {
        from {
          transform: translateY(100px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      @keyframes slideOutDown {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(100px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Expose functions globally
  window.CodeBeats = window.CodeBeats || {};
  window.CodeBeats.getDownloadCount = (id, type) => {
    const counts = getDownloadCounts();
    return counts[`${type}_${id}`] || 0;
  };
  window.CodeBeats.getRating = getRating;
  window.CodeBeats.setRating = setRating;

})();



