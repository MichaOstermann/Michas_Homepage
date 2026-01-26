/**
 * Professional Star Rating System for Code & Beats
 * Features: 5-Star Rating, Firebase Backend, Vote Tracking, Real-time Updates
 */

class SongRatingSystem {
  constructor() {
    this.userVotes = this.loadUserVotes();
    this.initialized = false;
    this.waitForFirebase().then(() => {
      this.db = window.firebaseDB;
      this.initialized = true;
      this.init();
    });
  }

  // Warte auf Firebase-Load
  async waitForFirebase() {
    if (window.firebaseDB) return Promise.resolve();
    
    // Lade Firebase wenn nicht vorhanden
    if (window.loadFirebase) {
      await window.loadFirebase();
    }
    
    // Warte bis firebaseDB verfügbar ist
    return new Promise((resolve) => {
      const checkFirebase = setInterval(() => {
        if (window.firebaseDB) {
          clearInterval(checkFirebase);
          resolve();
        }
      }, 100);
    });
  }

  // Erneut Widgets initialisieren (für dynamisch gerenderte Inhalte)
  reinitialize() {
    if (this.initialized) {
      this.init();
    } else {
      this.waitForFirebase().then(() => this.init());
    }
  }

  // Initialisiere alle Rating-Widgets
  init() {
    document.querySelectorAll('.rating-widget').forEach(widget => {
      const songId = widget.dataset.songId;
      this.setupWidget(widget, songId);
      this.loadRating(widget, songId);
    });
  }

  // Setup eines einzelnen Rating-Widgets
  setupWidget(widget, songId) {
    const stars = widget.querySelectorAll('.rating-star');
    const hasVoted = this.userVotes[songId] !== undefined;

    stars.forEach((star, index) => {
      const starValue = index + 1;

      // Hover-Effekt (nur wenn noch nicht gevotet)
      if (!hasVoted) {
        star.addEventListener('mouseenter', () => {
          this.highlightStars(stars, starValue);
        });

        star.addEventListener('mouseleave', () => {
          const currentRating = this.userVotes[songId] || 0;
          this.highlightStars(stars, currentRating);
        });

        // Click-Handler
        star.addEventListener('click', () => {
          this.submitRating(songId, starValue, widget);
        });
      }
    });

    // Zeige bereits abgegebene Bewertung
    if (hasVoted) {
      this.highlightStars(stars, this.userVotes[songId]);
      widget.classList.add('rated');
    }
  }

  // Sterne highlighten
  highlightStars(stars, count) {
    stars.forEach((star, index) => {
      if (index < count) {
        star.classList.add('active');
      } else {
        star.classList.remove('active');
      }
    });
  }

  // Bewertung laden und anzeigen
  async loadRating(widget, songId) {
    if (!this.initialized) {
      await this.waitForFirebase();
    }
    
    if (!this.db) {
      console.warn('Firebase nicht initialisiert');
      return;
    }

    try {
      // Prüfe Firebase-Verfügbarkeit
      if (!window.firebase || !window.firebase.database) {
        console.warn('Firebase nicht verfügbar für Song:', songId);
        return;
      }

      const ratingRef = window.firebase.database().ref(`ratings/${songId}`);
      
      // Einmalig laden
      const snapshot = await ratingRef.once('value');
      const data = snapshot.val() || { total: 0, count: 0, sum: 0 };
      
      // Fallback: sum aus total berechnen wenn nicht vorhanden
      if (!data.sum && data.total) {
        data.sum = data.total;
      }
      
      this.updateDisplay(widget, data);

      // Echtzeit-Updates
      ratingRef.on('value', (snapshot) => {
        const data = snapshot.val() || { total: 0, count: 0, sum: 0 };
        if (!data.sum && data.total) {
          data.sum = data.total;
        }
        this.updateDisplay(widget, data);
      });
    } catch (error) {
      console.error('Fehler beim Laden der Bewertung:', error);
    }
  }

  // Bewertungs-Display aktualisieren
  updateDisplay(widget, data) {
    const { sum, total, count } = data;
    // Verwende 'sum' falls vorhanden, sonst 'total' (Rückwärtskompatibilität)
    const ratingSum = sum || total || 0;
    const average = count > 0 ? (ratingSum / count).toFixed(1) : 0;
    
    const avgElement = widget.querySelector('.rating-average');
    const countElement = widget.querySelector('.rating-count');
    
    if (avgElement) {
      avgElement.textContent = average;
      
      // Füge Animation hinzu
      avgElement.style.transform = 'scale(1.1)';
      setTimeout(() => {
        avgElement.style.transform = 'scale(1)';
      }, 200);
    }
    
    if (countElement) {
      countElement.textContent = `(${count} ${count === 1 ? 'Bewertung' : 'Bewertungen'})`;
    }

    // Ranking-Badge hinzufügen
    this.updateRankingBadge(widget, average, count);
  }

  // Ranking-Badge aktualisieren
  updateRankingBadge(widget, average, count) {
    // Entferne altes Badge
    const oldBadge = widget.querySelector('.rating-badge');
    if (oldBadge) oldBadge.remove();

    // Zeige Badge nur wenn genug Bewertungen
    if (count >= 5) {
      let badgeText = '';
      let badgeClass = '';

      if (average >= 4.5) {
        badgeText = '🔥 Top Hit';
        badgeClass = 'badge-top';
      } else if (average >= 4.0) {
        badgeText = '⭐ Beliebt';
        badgeClass = 'badge-popular';
      }

      if (badgeText) {
        const badge = document.createElement('span');
        badge.className = `rating-badge ${badgeClass}`;
        badge.textContent = badgeText;
        widget.querySelector('.rating-info').prepend(badge);
      }
    }
  }

  // Bewertung absenden
  async submitRating(songId, rating, widget) {
    // Warte auf Firebase wenn nicht initialisiert
    if (!this.initialized) {
      await this.waitForFirebase();
      this.db = window.firebaseDB;
      this.initialized = true;
    }
    
    // Doppelcheck: Firebase verfügbar?
    if (!window.firebase || !window.firebase.database) {
      console.error('Firebase nicht geladen');
      alert('⚠️ Bewertungssystem wird geladen. Bitte warte einen Moment und versuche es erneut.');
      return;
    }

    // Prüfe ob bereits gevotet
    if (this.userVotes[songId] !== undefined) {
      alert('✓ Du hast diesen Song bereits bewertet!');
      return;
    }

    try {
      const ratingRef = window.firebase.database().ref(`ratings/${songId}`);
      
      // Transaktion für atomare Updates
      const result = await ratingRef.transaction((current) => {
        if (current === null) {
          return { total: rating, count: 1, sum: rating };
        }
        return {
          total: (current.total || 0) + rating,
          count: (current.count || 0) + 1,
          sum: (current.sum || current.total || 0) + rating
        };
      });

      // Prüfe ob Transaktion erfolgreich
      if (!result.committed) {
        throw new Error('Transaktion fehlgeschlagen');
      }

      // Detailliertes Rating-Log speichern (für Admin-Einsicht)
      try {
        const logRef = window.firebase.database().ref(`rating_logs/${songId}`).push();
        await logRef.set({
          rating: rating,
          timestamp: window.firebase.database.ServerValue.TIMESTAMP,
          userAgent: navigator.userAgent.substring(0, 100), // Gekürzt für Datenschutz
          sessionId: this.getSessionId()
        });
      } catch (logError) {
        // Log-Fehler nicht kritisch - Hauptbewertung ist gespeichert
        console.warn('Log konnte nicht gespeichert werden:', logError);
      }

      // Speichere User-Vote
      this.userVotes[songId] = rating;
      this.saveUserVotes();

      // UI-Update
      widget.classList.add('rated');
      const stars = widget.querySelectorAll('.rating-star');
      this.highlightStars(stars, rating);

      // Erfolgsmeldung
      this.showSuccessMessage(widget);

      console.log(`✅ Bewertung gespeichert: Song ${songId} = ${rating} Sterne`);
    } catch (error) {
      console.error('Fehler beim Speichern der Bewertung:', error);
      
      // Detaillierte Fehlermeldung
      let errorMsg = '❌ Bewertung konnte nicht gespeichert werden.\n\n';
      
      if (error.code === 'PERMISSION_DENIED') {
        errorMsg += 'Grund: Keine Berechtigung.\nBitte stelle sicher, dass du online bist.';
      } else if (!navigator.onLine) {
        errorMsg += 'Grund: Keine Internetverbindung.\nBitte prüfe deine Verbindung und versuche es erneut.';
      } else {
        errorMsg += 'Bitte versuche es später erneut.\n\nFehler: ' + (error.message || 'Unbekannt');
      }
      
      alert(errorMsg);
    }
  }

  // Session-ID für Tracking (anonym, nur für Duplikatserkennung)
  getSessionId() {
    let sessionId = sessionStorage.getItem('ratingSessionId');
    if (!sessionId) {
      sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('ratingSessionId', sessionId);
    }
    return sessionId;
  }

  // Erfolgsmeldung anzeigen
  showSuccessMessage(widget) {
    const message = document.createElement('div');
    message.className = 'rating-success';
    message.textContent = '✓ Danke für deine Bewertung!';
    widget.appendChild(message);

    setTimeout(() => {
      message.remove();
    }, 3000);
  }

  // User-Votes aus LocalStorage laden
  loadUserVotes() {
    try {
      const stored = localStorage.getItem('codebeats_votes');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  // User-Votes in LocalStorage speichern
  saveUserVotes() {
    try {
      localStorage.setItem('codebeats_votes', JSON.stringify(this.userVotes));
    } catch (error) {
      console.error('LocalStorage Fehler:', error);
    }
  }
}

// Initialisiere Rating-System wenn DOM geladen
document.addEventListener('DOMContentLoaded', () => {
  // Funktion zum Prüfen und Initialisieren
  const initSystem = () => {
    if (window.firebase && window.firebase.database && window.firebaseDB) {
      window.ratingSystem = new SongRatingSystem();
      console.log('✅ Rating-System initialisiert');
      return true;
    }
    return false;
  };

  // Versuche sofort
  if (!initSystem()) {
    // Warte auf Firebase (max 5 Sekunden)
    let attempts = 0;
    const checkInterval = setInterval(() => {
      attempts++;
      if (initSystem()) {
        clearInterval(checkInterval);
      } else if (attempts >= 50) { // 50 * 100ms = 5 Sekunden
        clearInterval(checkInterval);
        console.warn('⚠️ Firebase nicht verfügbar - Rating-System deaktiviert');
      }
    }, 100);
  }
});

// Exponiere Init-Funktion für dynamische Re-Renders
window.initRatingSystem = function() {
  try {
    if (window.ratingSystem) {
      window.ratingSystem.reinitialize();
    } else if (window.firebaseDB) {
      window.ratingSystem = new SongRatingSystem();
    }
  } catch (e) {
    console.warn('initRatingSystem() Fehler:', e);
  }
};

// Re-Init wenn Tracks dynamisch gerendert wurden
window.addEventListener('tracks:rendered', () => {
  if (typeof window.initRatingSystem === 'function') {
    window.initRatingSystem();
  }
});
