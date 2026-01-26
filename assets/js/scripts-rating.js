/**
 * PowerShell Scripts Rating System
 * Handles star ratings, reviews, and script feedback
 */

class ScriptRatingSystem {
  constructor() {
    this.storageKey = 'scriptRatings';
    this.userRatingsKey = 'userScriptRatings';
    this.init();
  }

  init() {
    this.loadRatings();
    this.initializeEventListeners();
  }

  loadRatings() {
    const stored = localStorage.getItem(this.storageKey);
    this.ratings = stored ? JSON.parse(stored) : this.getDefaultRatings();
  }

  getDefaultRatings() {
    return {
      'gaming-pc-turbo-cleaner': {
        averageRating: 4.7,
        totalRatings: 24,
        ratings: { 5: 18, 4: 4, 3: 1, 2: 1, 1: 0 },
        reviews: [
          { user: 'TechGamer42', rating: 5, comment: 'Mega Script! Hat über 800MB befreit! 🚀', date: '2025-11-10' },
          { user: 'PowerUser', rating: 5, comment: 'Funktioniert perfekt. Mein PC läuft jetzt smooth!', date: '2025-11-08' }
        ]
      },
      'security-deep-scanner': {
        averageRating: 4.9,
        totalRatings: 18,
        ratings: { 5: 16, 4: 2, 3: 0, 2: 0, 1: 0 },
        reviews: [
          { user: 'SecAdmin', rating: 5, comment: 'Professionelles Security-Tool. Threat-Level System ist genial!', date: '2025-11-12' },
          { user: 'ITManager', rating: 5, comment: 'Nutze ich auf allen Firmen-PCs. Top!', date: '2025-11-09' }
        ]
      },
      'outlook-spam-killer': {
        averageRating: 4.6,
        totalRatings: 31,
        ratings: { 5: 20, 4: 8, 3: 2, 2: 1, 1: 0 },
        reviews: [
          { user: 'OfficeUser', rating: 5, comment: '200+ Spam-Mails automatisch gelöscht. Danke!', date: '2025-11-11' },
          { user: 'Marketing_Pro', rating: 4, comment: 'Funktioniert gut, würde mir mehr Keywords wünschen.', date: '2025-11-07' }
        ]
      },
      'ad-user-creation-tool': {
        averageRating: 4.8,
        totalRatings: 12,
        ratings: { 5: 10, 4: 1, 3: 1, 2: 0, 1: 0 },
        reviews: [
          { user: 'SysAdmin', rating: 5, comment: 'Spart mir Stunden bei Neueinstellungen!', date: '2025-11-13' }
        ]
      },
      'mailstore-analyse': {
        averageRating: 4.5,
        totalRatings: 8,
        ratings: { 5: 5, 4: 2, 3: 1, 2: 0, 1: 0 },
        reviews: [
          { user: 'MailAdmin', rating: 5, comment: 'Perfekt für große Archive. Sehr übersichtlich!', date: '2025-11-06' }
        ]
      },
      'wsus-scan': {
        averageRating: 4.4,
        totalRatings: 9,
        ratings: { 5: 5, 4: 3, 3: 1, 2: 0, 1: 0 },
        reviews: [
          { user: 'NetworkAdmin', rating: 4, comment: 'Gutes Tool für WSUS-Monitoring.', date: '2025-11-05' }
        ]
      }
    };
  }

  saveRatings() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.ratings));
  }

  getUserRating(scriptId) {
    const userRatings = JSON.parse(localStorage.getItem(this.userRatingsKey) || '{}');
    return userRatings[scriptId] || null;
  }

  setUserRating(scriptId, rating) {
    const userRatings = JSON.parse(localStorage.getItem(this.userRatingsKey) || '{}');
    userRatings[scriptId] = rating;
    localStorage.setItem(this.userRatingsKey, JSON.stringify(userRatings));
  }

  renderStars(rating, interactive = false, scriptId = null) {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      let starClass = 'star';
      if (i <= fullStars) {
        starClass += ' star--filled';
      } else if (i === fullStars + 1 && hasHalfStar) {
        starClass += ' star--half';
      }

      if (interactive) {
        starClass += ' star--interactive';
        stars.push(`
          <span class="${starClass}" data-rating="${i}" data-script-id="${scriptId}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </span>
        `);
      } else {
        stars.push(`
          <span class="${starClass}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </span>
        `);
      }
    }

    return stars.join('');
  }

  renderRatingBadge(scriptId) {
    const data = this.ratings[scriptId];
    if (!data) return '';

    return `
      <div class="script-rating">
        <div class="script-rating__stars">
          ${this.renderStars(data.averageRating)}
        </div>
        <div class="script-rating__info">
          <span class="script-rating__average">${data.averageRating.toFixed(1)}</span>
          <span class="script-rating__count">(${data.totalRatings} Bewertungen)</span>
        </div>
      </div>
    `;
  }

  renderInteractiveRating(scriptId) {
    const userRating = this.getUserRating(scriptId);
    const data = this.ratings[scriptId] || { averageRating: 0, totalRatings: 0 };

    return `
      <div class="rating-interactive">
        <h3 style="margin-bottom: 1rem; color: #06FFF0;">⭐ Bewerte dieses Script</h3>
        <div class="rating-interactive__stars" data-script-id="${scriptId}">
          ${this.renderStars(userRating || 0, true, scriptId)}
        </div>
        ${userRating ? `
          <p style="color: rgba(255,255,255,0.6); margin-top: 0.5rem; font-size: 0.9rem;">
            ✅ Du hast ${userRating} Stern${userRating > 1 ? 'e' : ''} vergeben
          </p>
        ` : `
          <p style="color: rgba(255,255,255,0.6); margin-top: 0.5rem; font-size: 0.9rem;">
            Klicke auf die Sterne, um zu bewerten
          </p>
        `}
        <div style="margin-top: 1rem; padding: 1rem; background: rgba(6,255,240,0.05); border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 2rem; font-weight: 900; color: #06FFF0;">${data.averageRating.toFixed(1)}</div>
              <div style="color: rgba(255,255,255,0.5); font-size: 0.85rem;">${data.totalRatings} Bewertungen</div>
            </div>
            <div class="rating-bars" style="flex: 1; margin-left: 2rem;">
              ${this.renderRatingBars(data.ratings || {})}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderRatingBars(ratings) {
    const total = Object.values(ratings).reduce((a, b) => a + b, 0) || 1;
    let html = '';

    for (let i = 5; i >= 1; i--) {
      const count = ratings[i] || 0;
      const percentage = (count / total) * 100;

      html += `
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
          <span style="color: rgba(255,255,255,0.6); font-size: 0.85rem; width: 30px;">${i} ⭐</span>
          <div style="flex: 1; height: 6px; background: rgba(6,255,240,0.1); border-radius: 3px; overflow: hidden;">
            <div style="width: ${percentage}%; height: 100%; background: linear-gradient(90deg, #06FFF0 0%, #00FF87 100%); transition: width 0.3s;"></div>
          </div>
          <span style="color: rgba(255,255,255,0.4); font-size: 0.8rem; width: 30px;">${count}</span>
        </div>
      `;
    }

    return html;
  }

  renderReviews(scriptId) {
    const data = this.ratings[scriptId];
    if (!data || !data.reviews || data.reviews.length === 0) {
      return `
        <div class="script-reviews">
          <h3 style="margin-bottom: 1rem; color: #06FFF0;">💬 Bewertungen</h3>
          <p style="color: rgba(255,255,255,0.5); text-align: center; padding: 2rem;">
            Noch keine Bewertungen vorhanden. Sei der Erste!
          </p>
        </div>
      `;
    }

    const reviewsHtml = data.reviews.map(review => `
      <div class="review-card" style="background: rgba(6,255,240,0.05); border: 1px solid rgba(6,255,240,0.15); border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
          <div>
            <div style="font-weight: 600; color: #06FFF0; margin-bottom: 0.25rem;">${review.user}</div>
            <div class="script-rating__stars" style="margin-bottom: 0.5rem;">
              ${this.renderStars(review.rating)}
            </div>
          </div>
          <div style="color: rgba(255,255,255,0.4); font-size: 0.85rem;">${this.formatDate(review.date)}</div>
        </div>
        <p style="color: rgba(255,255,255,0.8); line-height: 1.6; margin: 0;">${review.comment}</p>
      </div>
    `).join('');

    return `
      <div class="script-reviews">
        <h3 style="margin-bottom: 1rem; color: #06FFF0;">💬 Bewertungen (${data.reviews.length})</h3>
        ${reviewsHtml}
      </div>
    `;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Heute';
    if (diffDays === 1) return 'Gestern';
    if (diffDays < 7) return `Vor ${diffDays} Tagen`;
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  initializeEventListeners() {
    document.addEventListener('click', (e) => {
      const star = e.target.closest('.star--interactive');
      if (!star) return;

      const rating = parseInt(star.dataset.rating);
      const scriptId = star.dataset.scriptId;

      this.submitRating(scriptId, rating);
    });

    // Hover effect for interactive stars
    document.addEventListener('mouseover', (e) => {
      const star = e.target.closest('.star--interactive');
      if (!star) return;

      const container = star.parentElement;
      const stars = container.querySelectorAll('.star--interactive');
      const rating = parseInt(star.dataset.rating);

      stars.forEach((s, index) => {
        if (index < rating) {
          s.classList.add('star--filled');
        } else {
          s.classList.remove('star--filled');
        }
      });
    });

    document.addEventListener('mouseout', (e) => {
      if (!e.target.closest('.star--interactive')) {
        const containers = document.querySelectorAll('.rating-interactive__stars');
        containers.forEach(container => {
          const scriptId = container.dataset.scriptId;
          const userRating = this.getUserRating(scriptId);
          const stars = container.querySelectorAll('.star--interactive');

          stars.forEach((star, index) => {
            if (userRating && index < userRating) {
              star.classList.add('star--filled');
            } else {
              star.classList.remove('star--filled');
            }
          });
        });
      }
    });
  }

  submitRating(scriptId, rating) {
    // Update user rating
    this.setUserRating(scriptId, rating);

    // Update overall ratings
    if (!this.ratings[scriptId]) {
      this.ratings[scriptId] = {
        averageRating: 0,
        totalRatings: 0,
        ratings: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        reviews: []
      };
    }

    const data = this.ratings[scriptId];
    data.ratings[rating] = (data.ratings[rating] || 0) + 1;
    data.totalRatings += 1;

    // Recalculate average
    let totalScore = 0;
    for (let i = 1; i <= 5; i++) {
      totalScore += i * (data.ratings[i] || 0);
    }
    data.averageRating = totalScore / data.totalRatings;

    this.saveRatings();

    // Show feedback
    this.showRatingFeedback(rating);

    // Refresh display after short delay
    setTimeout(() => {
      const container = document.querySelector(`[data-script-id="${scriptId}"]`);
      if (container && container.closest('.rating-interactive')) {
        const parent = container.closest('.rating-interactive').parentElement;
        parent.innerHTML = this.renderInteractiveRating(scriptId);
      }
    }, 1000);
  }

  showRatingFeedback(rating) {
    const messages = {
      5: '🌟 Danke! Das freut mich mega!',
      4: '😊 Super, danke für dein Feedback!',
      3: '👍 Okay, danke! Wo kann ich besser werden?',
      2: '🤔 Schade, was kann ich verbessern?',
      1: '😞 Oh nein! Bitte kontaktiere mich für Hilfe!'
    };

    const feedback = document.createElement('div');
    feedback.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.8);
      background: linear-gradient(135deg, rgba(6,255,240,0.95) 0%, rgba(0,255,135,0.95) 100%);
      color: #000;
      padding: 2rem 3rem;
      border-radius: 16px;
      font-size: 1.3rem;
      font-weight: 600;
      z-index: 10000;
      box-shadow: 0 20px 60px rgba(6,255,240,0.3);
      animation: popIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
    `;
    feedback.textContent = messages[rating];

    document.body.appendChild(feedback);

    setTimeout(() => {
      feedback.style.animation = 'popOut 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards';
      setTimeout(() => feedback.remove(), 300);
    }, 2000);
  }
}

// Initialize rating system
const scriptRating = new ScriptRatingSystem();

// Make it globally available
window.scriptRating = scriptRating;

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes popIn {
    from {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.8);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }

  @keyframes popOut {
    from {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    to {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.8);
    }
  }

  .star--interactive {
    cursor: pointer;
    transition: all 0.2s;
  }

  .star--interactive:hover {
    transform: scale(1.2);
  }
`;
document.head.appendChild(style);
