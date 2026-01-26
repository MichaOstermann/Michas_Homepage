(function() {
  'use strict';

  // Auto-detect path based on current location
  const isRootPage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
  const DATA_URL = isRootPage ? 'assets/content/templates.json' : '../assets/content/templates.json';
  let allTemplates = [];
  let currentFilter = 'all';

  // Render single template card
  function renderTemplateCard(template) {
    const badgeHTML = template.badge 
      ? `<div class="template-badge template-badge--${template.badge.toLowerCase()}">${template.badge}</div>` 
      : '';

    const downloadInfo = template.downloads > 0
      ? `<span style="font-size: 0.85rem; color: rgba(255,255,255,0.5);">📥 ${template.downloads} Downloads</span>` 
      : '';
    
    // Get saved rating from localStorage
    const savedRatings = JSON.parse(localStorage.getItem('templateRatings') || '{}');
    const userRating = savedRatings[template.id] || 0;
    
    // Calculate average rating
    const avgRating = template.rating || 0;
    const ratingCount = template.ratingCount || 0;
    
    const ratingDisplay = template.rating > 0
      ? `<div class="template-rating-container">
           <div class="template-rating-stars" data-template-id="${template.id}" data-avg-rating="${avgRating}">
             ${[1,2,3,4,5].map(star => `
               <span class="rating-star ${star <= avgRating ? 'active' : ''} ${star <= userRating ? 'user-rated' : ''}" 
                     data-star="${star}" 
                     onclick="rateTemplate('${template.id}', ${star}, '${template.title}')">⭐</span>
             `).join('')}
           </div>
           <span class="rating-text">
             ${avgRating.toFixed(1)} ${userRating > 0 ? '(Deine Bewertung: ' + userRating + ')' : '(' + ratingCount + ' Bewertungen)'}
           </span>
         </div>`
      : `<span class="template-rating" style="color: rgba(255,255,255,0.4);">🚧 In Arbeit</span>`;
    
    const isComing = template.slug === 'coming-soon';
    const buttonDisabled = isComing ? 'disabled' : '';
    
    // Buttons HTML
    let actionsHTML = '';
    if (isComing) {
      actionsHTML = `
        <button class="btn-request" disabled style="width: 100%; opacity: 0.5; cursor: not-allowed;">
          🔒 Bald verfügbar
        </button>
      `;
    } else {
      // Preview-URL: Auto-detect path based on current page location
      const basePath = isRootPage ? 'templates/' : '';
      const previewURL = template.preview && template.preview !== '#' ? basePath + template.preview : '/';
      actionsHTML = `
        <button class="btn-preview" onclick="window.open('${previewURL}', '_blank')" style="flex: 1;">
          👁️ Live Demo
        </button>
        <button class="btn-request" onclick="requestTemplate('${template.slug}', '${template.title}')" style="flex: 1;">
          📩 Download anfragen
        </button>
      `;
    }

    const imageBasePath = isRootPage ? '' : '../';
    const imageSrc = template.previewImage.startsWith('../') 
      ? (isRootPage ? template.previewImage.substring(3) : template.previewImage)
      : template.previewImage;
    
    return `
      <article class="template-card" data-category="${template.category}">
        <div class="template-preview">
          ${badgeHTML}
          <img src="${imageSrc}" alt="${template.title}" loading="lazy" 
               onerror="this.src='${imageBasePath}assets/images/templates/placeholder-template.svg'"
               style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div class="template-content">
          <h3 class="template-title">${template.title}</h3>
          <p class="template-description">${template.description}</p>
          
          <div class="template-tags">
            ${template.tech.map(tag => `<span class="template-tag">${tag}</span>`).join('')}
          </div>
          
          <div class="template-meta">
            ${ratingDisplay}
            ${downloadInfo}
          </div>
          
          <div class="template-actions">
            ${actionsHTML}
          </div>
        </div>
      </article>
    `;
  }

  // Render all templates based on current filter
  function renderTemplates() {
    const grid = document.getElementById('templatesGrid');
    if (!grid) {
      console.error('Templates Grid nicht gefunden!');
      return;
    }

    const filtered = currentFilter === 'all' 
      ? allTemplates 
      : allTemplates.filter(t => t.category === currentFilter);

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: rgba(255,255,255,0.5);">
          <h3 style="font-size: 2rem; margin-bottom: 1rem;">🔍 Keine Templates gefunden</h3>
          <p>Für diese Kategorie sind aktuell keine Templates verfügbar.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(template => renderTemplateCard(template)).join('');
  }

  // Initialize filter buttons
  function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        // Remove active class from all buttons
        filterButtons.forEach(b => b.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Update filter and re-render
        currentFilter = this.dataset.filter;
        renderTemplates();
      });
    });
  }

  // Global function for download requests (accessible from inline onclick)
  window.requestTemplate = function(slug, title) {
    // For now: Show alert, later: implement modal/form system
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease;
    `;

    modal.innerHTML = `
      <div style="background: linear-gradient(135deg, #0B0F16 0%, #1a1f2e 100%); 
                  padding: 3rem; 
                  border-radius: 20px; 
                  border: 2px solid rgba(255,107,0,0.5);
                  max-width: 500px;
                  width: 90%;
                  box-shadow: 0 20px 60px rgba(255,107,0,0.3);
                  animation: slideUp 0.4s ease;">
        <h2 style="color: #FF6B00; margin-bottom: 1.5rem; font-size: 1.8rem;">
          📩 Download-Anfrage: ${title}
        </h2>
        
        <form id="requestForm" style="display: flex; flex-direction: column; gap: 1.5rem;">
          <div>
            <label style="display: block; color: rgba(255,255,255,0.8); margin-bottom: 0.5rem; font-size: 0.9rem;">
              Dein Name *
            </label>
            <input type="text" id="userName" required 
                   style="width: 100%; padding: 0.8rem; background: rgba(255,255,255,0.05); 
                          border: 1px solid rgba(255,107,0,0.3); border-radius: 8px; 
                          color: white; font-size: 1rem;">
          </div>
          
          <div>
            <label style="display: block; color: rgba(255,255,255,0.8); margin-bottom: 0.5rem; font-size: 0.9rem;">
              Deine Email *
            </label>
            <input type="email" id="userEmail" required 
                   style="width: 100%; padding: 0.8rem; background: rgba(255,255,255,0.05); 
                          border: 1px solid rgba(255,107,0,0.3); border-radius: 8px; 
                          color: white; font-size: 1rem;">
          </div>
          
          <div>
            <label style="display: block; color: rgba(255,255,255,0.8); margin-bottom: 0.5rem; font-size: 0.9rem;">
              Verwendungszweck (optional)
            </label>
            <textarea id="userMessage" rows="3" 
                      style="width: 100%; padding: 0.8rem; background: rgba(255,255,255,0.05); 
                             border: 1px solid rgba(255,107,0,0.3); border-radius: 8px; 
                             color: white; font-size: 1rem; resize: vertical;"></textarea>
          </div>
          
          <div style="display: flex; gap: 1rem; margin-top: 1rem;">
            <button type="submit" 
                    style="flex: 1; padding: 1rem; background: linear-gradient(135deg, #FF6B00 0%, #FF1493 100%); 
                           border: none; border-radius: 8px; color: white; font-weight: bold; 
                           cursor: pointer; font-size: 1rem; transition: all 0.3s;">
              ✅ Anfrage absenden
            </button>
            <button type="button" id="cancelBtn"
                    style="flex: 1; padding: 1rem; background: rgba(255,255,255,0.1); 
                           border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; 
                           color: white; font-weight: bold; cursor: pointer; font-size: 1rem; 
                           transition: all 0.3s;">
              ❌ Abbrechen
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Handle form submission
    document.getElementById('requestForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const name = document.getElementById('userName').value;
      const email = document.getElementById('userEmail').value;
      const message = document.getElementById('userMessage').value;
      
      // Disable submit button
      const submitBtn = e.target.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '⏳ Wird gesendet...';

      try {
        // Send email via contact-simple.php
        const response = await fetch('/contact-simple.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: name,
            email: email,
            message: `📩 TEMPLATE DOWNLOAD-ANFRAGE\n\nTemplate: ${title} (${slug})\n\n${message ? 'Verwendungszweck:\n' + message : 'Kein Verwendungszweck angegeben.'}`,
            hp_field: '' // Honeypot
          })
        });

        const result = await response.json();

        if (result.success) {
          // Save request to localStorage for tracking
          const requests = JSON.parse(localStorage.getItem('templateRequests') || '[]');
          requests.push({
            template: slug,
            templateTitle: title,
            name: name,
            email: email,
            message: message,
            timestamp: new Date().toISOString(),
            status: 'sent'
          });
          localStorage.setItem('templateRequests', JSON.stringify(requests));

          // Show success message
          modal.innerHTML = `
            <div style="background: linear-gradient(135deg, #0B0F16 0%, #1a1f2e 100%); 
                        padding: 3rem; 
                        border-radius: 20px; 
                        border: 2px solid rgba(0,255,135,0.5);
                        max-width: 500px;
                        width: 90%;
                        text-align: center;
                        box-shadow: 0 20px 60px rgba(0,255,135,0.3);">
              <div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>
              <h2 style="color: #00FF87; margin-bottom: 1rem; font-size: 1.8rem;">
                Anfrage versendet!
              </h2>
              <p style="color: rgba(255,255,255,0.8); margin-bottom: 2rem; line-height: 1.6;">
                Deine Anfrage für <strong style="color: #FF6B00;">${title}</strong> wurde erfolgreich an Michael gesendet.<br><br>
                Du erhältst eine Email mit dem Download-Link nach Freigabe.
              </p>
              <button onclick="this.closest('div').parentElement.remove()" 
                      style="padding: 1rem 2rem; background: linear-gradient(135deg, #FF6B00 0%, #FF1493 100%); 
                             border: none; border-radius: 8px; color: white; font-weight: bold; 
                             cursor: pointer; font-size: 1rem;">
                🎉 Verstanden
              </button>
            </div>
          `;
        } else {
          throw new Error(result.message || 'Versand fehlgeschlagen');
        }
      } catch (error) {
        console.error('Template request error:', error);
        
        // Show error message
        modal.innerHTML = `
          <div style="background: linear-gradient(135deg, #0B0F16 0%, #1a1f2e 100%); 
                      padding: 3rem; 
                      border-radius: 20px; 
                      border: 2px solid rgba(255,0,51,0.5);
                      max-width: 500px;
                      width: 90%;
                      text-align: center;
                      box-shadow: 0 20px 60px rgba(255,0,51,0.3);">
            <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
            <h2 style="color: #FF0033; margin-bottom: 1rem; font-size: 1.8rem;">
              Fehler beim Versand
            </h2>
            <p style="color: rgba(255,255,255,0.8); margin-bottom: 2rem; line-height: 1.6;">
              Die Anfrage konnte nicht versendet werden.<br>
              Bitte versuche es erneut oder kontaktiere uns direkt per Email.
            </p>
            <button onclick="this.closest('div').parentElement.remove()" 
                    style="padding: 1rem 2rem; background: rgba(255,255,255,0.1); 
                           border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; 
                           color: white; font-weight: bold; cursor: pointer; font-size: 1rem;">
              Schließen
            </button>
          </div>
        `;
      }
    });

    // Handle cancel button
    document.getElementById('cancelBtn').addEventListener('click', function() {
      modal.remove();
    });

    // Close on background click
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // Add animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  };

  // Global function for rating templates
  window.rateTemplate = async function(templateId, stars, templateTitle) {
    // Save rating to localStorage (client-side tracking)
    const ratings = JSON.parse(localStorage.getItem('templateRatings') || '{}');
    ratings[templateId] = stars;
    localStorage.setItem('templateRatings', JSON.stringify(ratings));
    
    // Update visual feedback
    const ratingContainer = document.querySelector(`[data-template-id="${templateId}"]`);
    if (ratingContainer) {
      const allStars = ratingContainer.querySelectorAll('.rating-star');
      allStars.forEach((star, index) => {
        if (index < stars) {
          star.classList.add('user-rated');
        } else {
          star.classList.remove('user-rated');
        }
      });
    }
    
    try {
      // Send rating to backend
      const response = await fetch('/template-ratings-api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateId: templateId,
          stars: stars
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update template data with new rating
        const template = allTemplates.find(t => t.id === templateId);
        if (template && result.rating) {
          template.rating = result.rating.average;
          template.ratingCount = result.rating.totalVotes;
        }
        
        // Re-render overview with new data
        updateRatingOverview();
        
        console.log(`⭐ Rating saved to server: ${templateTitle} - ${stars} stars (New avg: ${result.rating.average})`);
      } else {
        console.warn('Rating konnte nicht gespeichert werden:', result.message);
      }
    } catch (error) {
      console.error('Fehler beim Speichern der Bewertung:', error);
      // Falls Backend-Error, trotzdem lokale Aktualisierung
      updateRatingOverview();
    }
    
    // Show thank you message
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: linear-gradient(135deg, #FF6B00 0%, #FF1493 100%);
      color: white;
      padding: 1.5rem 2rem;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(255,107,0,0.5);
      z-index: 10000;
      animation: slideInUp 0.4s ease-out;
      font-weight: bold;
    `;
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem;">
        <span style="font-size: 2rem;">⭐</span>
        <div>
          <div style="font-size: 1.1rem; margin-bottom: 0.25rem;">Danke für deine Bewertung!</div>
          <div style="font-size: 0.9rem; opacity: 0.9;">${stars} ${stars === 1 ? 'Stern' : 'Sterne'} für ${templateTitle}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Add slide animation
    const toastStyle = document.createElement('style');
    toastStyle.textContent = `
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
    `;
    document.head.appendChild(toastStyle);
    
    setTimeout(() => {
      toast.style.animation = 'slideInUp 0.4s ease-out reverse';
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  };

  // Update rating overview
  function updateRatingOverview() {
    const listEl = document.getElementById('ratingOverviewList');
    
    if (!listEl) return;
    
    // Filter out "coming soon" templates
    const activeTemplates = allTemplates.filter(t => t.slug !== 'coming-soon' && t.rating > 0);
    
    if (activeTemplates.length === 0) {
      listEl.innerHTML = '<div style="text-align: center; color: rgba(255,255,255,0.5); padding: 1rem;">Noch keine Bewertungen vorhanden</div>';
      return;
    }
    
    // Sort by rating (descending)
    const sortedTemplates = [...activeTemplates].sort((a, b) => b.rating - a.rating);
    
    // Get emojis for templates
    const templateEmojis = {
      'terminator-t800': '🤖',
      'hogwarts-magic': '🧙',
      'code-beats-template': '💻'
    };
    
    // Generate HTML for each template
    listEl.innerHTML = sortedTemplates.map(template => {
      const emoji = templateEmojis[template.id] || '🎨';
      const stars = '⭐'.repeat(Math.round(template.rating));
      const ratingCount = template.ratingCount || 0;
      
      return `
        <div class="rating-overview-item">
          <div class="rating-overview-name">
            <span class="rating-overview-emoji">${emoji}</span>
            <span>${template.title}</span>
          </div>
          <div class="rating-overview-rating">
            <span class="rating-overview-stars">${stars}</span>
            <span class="rating-overview-number">${template.rating.toFixed(1)}</span>
            <span class="rating-overview-count">(${ratingCount})</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Load ratings from server
  async function loadServerRatings() {
    try {
      const response = await fetch('/template-ratings-api.php');
      const result = await response.json();
      
      if (result.success && result.ratings) {
        // Update templates with server ratings
        Object.keys(result.ratings).forEach(templateId => {
          const template = allTemplates.find(t => t.id === templateId);
          if (template) {
            template.rating = result.ratings[templateId].average;
            template.ratingCount = result.ratings[templateId].totalVotes;
          }
        });
        
        console.log('✅ Server ratings loaded:', result.ratings);
        return true;
      }
    } catch (error) {
      console.warn('⚠️ Could not load server ratings, using local data:', error);
      return false;
    }
  }

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', async function() {
    // Fetch template data
    fetch(DATA_URL)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load templates data');
        }
        return response.json();
      })
      .then(async data => {
        allTemplates = data.templates;
        
        // Load server ratings first
        await loadServerRatings();
        
        renderTemplates();
        initFilters();
        updateRatingOverview();
      })
      .catch(error => {
        console.error('Error loading templates:', error);
        const grid = document.getElementById('templatesGrid');
        const errorDiv = document.getElementById('templatesError');
        
        if (grid) {
          grid.style.display = 'none';
        }
        if (errorDiv) {
          errorDiv.style.display = 'block';
        }
      });
  });

})();
