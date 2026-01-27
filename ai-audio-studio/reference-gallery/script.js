/* =====================================================
   AI Audio Studio - Reference Gallery Script
   ===================================================== */

// ============================================
// INIT
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🎨 Reference Gallery Initialized');
  
  // Create animated background particles
  createBackgroundParticles();
  
  // Check auth session
  checkAuthSession();
  
  // Update auth status display
  updateAuthStatus();
  
  // Initialize event listeners
  initEventListeners();
  
  // Show welcome notification
  showNotification('🎨 Entdecke Referenzen und lass dich inspirieren!', 'info', 4000);
});

// ============================================
// EVENT LISTENERS
// ============================================

function initEventListeners() {
  // Auth buttons
  const loginBtnTop = document.getElementById('loginBtnTop');
  const closeModal = document.getElementById('closeModal');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  
  if (loginBtnTop) {
    loginBtnTop.addEventListener('click', openAuthModal);
  }
  
  if (closeModal) {
    closeModal.addEventListener('click', closeAuthModal);
  }
  
  // Close modal on backdrop click
  const modalBackdrop = document.querySelector('.modal-backdrop');
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', closeAuthModal);
  }
  
  // Auth form submissions
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
  
  // Filter tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => filterGallery(btn.dataset.category));
  });
}

// ============================================
// FILTER GALLERY
// ============================================

function filterGallery(category) {
  // Update active tab
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.category === category) {
      btn.classList.add('active');
    }
  });
  
  // Filter items
  const items = document.querySelectorAll('.gallery-item');
  let visibleCount = 0;
  
  items.forEach(item => {
    if (category === 'all' || item.dataset.category === category) {
      item.classList.remove('hidden');
      visibleCount++;
    } else {
      item.classList.add('hidden');
    }
  });
  
  // Show/hide empty state
  const emptyState = document.getElementById('emptyState');
  if (visibleCount === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
  }
}

// ============================================
// DEMO ACTIONS
// ============================================

window.playDemo = function(id) {
  showNotification(`🎵 Demo "${id}" wird geladen...`, 'info', 3000);
  
  // TODO: Implement actual playback
  setTimeout(() => {
    showNotification('⏸️ Demo-Playback noch nicht verfügbar', 'info', 3000);
  }, 1500);
};

window.showLyrics = function(id) {
  showNotification(`📖 Lyrics für "${id}" werden angezeigt...`, 'info', 3000);
  
  // TODO: Implement lyrics modal
  setTimeout(() => {
    showNotification('📝 Lyrics-Ansicht noch nicht verfügbar', 'info', 3000);
  }, 1500);
};

window.showStyleGuide = function(id) {
  showNotification(`🎨 Style Guide "${id}" wird geladen...`, 'info', 3000);
  
  // TODO: Implement style guide modal
  setTimeout(() => {
    showNotification('🖼️ Style Guide noch nicht verfügbar', 'info', 3000);
  }, 1500);
};

// ============================================
// AUTH FUNCTIONS
// ============================================

async function checkAuthSession() {
  try {
    const response = await fetch('/api/check-session', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.authenticated) {
        localStorage.setItem('authToken', data.token || '');
        localStorage.setItem('userEmail', data.email || '');
        updateAuthStatus();
      }
    }
  } catch (error) {
    console.log('Auth check skipped (demo mode)');
  }
}

function updateAuthStatus() {
  const authStatusTop = document.getElementById('authStatusTop');
  const authToken = localStorage.getItem('authToken');
  const userEmail = localStorage.getItem('userEmail');
  
  if (authToken && userEmail) {
    authStatusTop.innerHTML = `
      <div class="user-info">
        <span class="user-email">${userEmail}</span>
        <button id="logoutBtn" class="btn-logout">Logout</button>
      </div>
    `;
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }
  } else {
    authStatusTop.innerHTML = `
      <button id="loginBtnTop" class="btn-login">🔐 Login</button>
    `;
    
    const loginBtnTop = document.getElementById('loginBtnTop');
    if (loginBtnTop) {
      loginBtnTop.addEventListener('click', openAuthModal);
    }
  }
}

async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userEmail', email);
      closeAuthModal();
      updateAuthStatus();
      showNotification('✅ Erfolgreich eingeloggt!', 'success');
    } else {
      showNotification('❌ Login fehlgeschlagen: ' + (data.error || 'Unbekannter Fehler'), 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showNotification('❌ Verbindungsfehler beim Login', 'error');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  
  if (password.length < 6) {
    showNotification('❌ Passwort muss mindestens 6 Zeichen haben', 'error');
    return;
  }
  
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userEmail', email);
      closeAuthModal();
      updateAuthStatus();
      showNotification('✅ Konto erfolgreich erstellt!', 'success');
    } else {
      showNotification('❌ Registrierung fehlgeschlagen: ' + (data.error || 'Unbekannter Fehler'), 'error');
    }
  } catch (error) {
    console.error('Register error:', error);
    showNotification('❌ Verbindungsfehler bei der Registrierung', 'error');
  }
}

function handleLogout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userEmail');
  updateAuthStatus();
  showNotification('👋 Erfolgreich ausgeloggt', 'info');
}

// ============================================
// MODAL FUNCTIONS
// ============================================

function openAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

// ============================================
// BACKGROUND PARTICLES
// ============================================

function createBackgroundParticles() {
  const colors = ['#FF6B00', '#FFA500', '#FFD700', '#FF8C00']; // Orange, Amber, Yellow, Dark Orange
  const particleCount = 30;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'background-particle';
    
    // Random properties
    const size = Math.random() * 4 + 2; // 2-6px
    const color = colors[Math.floor(Math.random() * colors.length)];
    const startX = Math.random() * 100;
    const startY = Math.random() * 100;
    const duration = Math.random() * 20 + 15; // 15-35s
    const delay = Math.random() * 5; // 0-5s delay
    
    particle.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      left: ${startX}%;
      top: ${startY}%;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      box-shadow: 0 0 ${size * 2}px ${color};
    `;
    
    document.body.appendChild(particle);
  }
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================

function showNotification(message, type = 'info', duration = 3000) {
  // Remove existing notification
  const existing = document.querySelector('.notification-toast');
  if (existing) {
    existing.remove();
  }
  
  // Create notification
  const notification = document.createElement('div');
  notification.className = `notification-toast notification-${type}`;
  notification.textContent = message;
  
  // Styles
  const colors = {
    success: '#10B981',
    error: '#EF4444',
    info: '#FF6B00',
    warning: '#F59E0B'
  };
  
  notification.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    padding: 1rem 1.5rem;
    background: rgba(18, 22, 30, 0.95);
    border: 1px solid ${colors[type] || colors.info};
    border-radius: 12px;
    color: white;
    font-size: 0.95rem;
    z-index: 10000;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    animation: slideInUp 0.3s ease;
    max-width: 400px;
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove
  setTimeout(() => {
    notification.style.animation = 'slideOutDown 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

// Add animation styles
if (!document.getElementById('notification-styles')) {
  const style = document.createElement('style');
  style.id = 'notification-styles';
  style.textContent = `
    @keyframes slideInUp {
      from {
        transform: translateY(100%);
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
        transform: translateY(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}
