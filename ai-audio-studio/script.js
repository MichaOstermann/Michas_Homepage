/* ============================================
   HUB SCRIPT - AI Audio Studio Entry Point
   ============================================ */

// Auth State
let authToken = localStorage.getItem('authToken');
let currentUser = null;

// DOM Elements
const authModal = document.getElementById('authModal');
const loginBtnTop = document.getElementById('loginBtnTop');
const closeModal = document.getElementById('closeModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// ============================================
// INIT
// ============================================

window.addEventListener('DOMContentLoaded', () => {
  checkAuthSession();
  updateAuthStatus();
  
  // Create animated background particles
  createBackgroundParticles();
  
  // Modal Controls
  loginBtnTop?.addEventListener('click', () => openAuthModal());
  closeModal?.addEventListener('click', () => closeAuthModal());
  authModal?.addEventListener('click', (e) => {
    if (e.target === authModal) closeAuthModal();
  });
  
  // Forms
  loginForm?.addEventListener('submit', handleLogin);
  registerForm?.addEventListener('submit', handleRegister);
});

// ============================================
// ANIMATED BACKGROUND PARTICLES
// ============================================

function createBackgroundParticles() {
  const container = document.createElement('div');
  container.className = 'particles-container';
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  `;
  
  document.body.insertBefore(container, document.body.firstChild);
  
  // Create particles
  const particleCount = 30;
  const colors = ['#06FFF0', '#8B5CF6', '#FF1493', '#FFD700'];
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    const size = Math.random() * 4 + 2;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const startX = Math.random() * 100;
    const startY = Math.random() * 100;
    const duration = Math.random() * 20 + 15;
    const delay = Math.random() * 5;
    
    particle.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      left: ${startX}%;
      top: ${startY}%;
      opacity: ${Math.random() * 0.3 + 0.1};
      animation: float ${duration}s ease-in-out ${delay}s infinite;
      box-shadow: 0 0 ${size * 3}px ${color};
    `;
    
    container.appendChild(particle);
  }
  
  // Add CSS animation
  if (!document.getElementById('particle-animations')) {
    const style = document.createElement('style');
    style.id = 'particle-animations';
    style.textContent = `
      @keyframes float {
        0%, 100% {
          transform: translate(0, 0) scale(1);
        }
        25% {
          transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * -100}px) scale(1.2);
        }
        50% {
          transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * -200}px) scale(0.8);
        }
        75% {
          transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * -100}px) scale(1.1);
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// ============================================
// AUTH FUNCTIONS
// ============================================

async function checkAuthSession() {
  if (!authToken) return;
  
  try {
    const response = await fetch('/api/check-session', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.ok) {
      currentUser = await response.json();
      updateAuthStatus();
    } else {
      logout();
    }
  } catch (err) {
    console.error('Session check failed:', err);
  }
}

function updateAuthStatus() {
  const authStatusTop = document.getElementById('authStatusTop');
  if (!authStatusTop) return;
  
  if (currentUser) {
    authStatusTop.innerHTML = `
      <div class="user-display">
        <div class="user-avatar">${currentUser.email.charAt(0).toUpperCase()}</div>
        <span class="user-email">${currentUser.email}</span>
        ${currentUser.isAdmin ? '<span class="admin-badge">👑 ADMIN</span>' : ''}
        <button id="logoutBtn" class="btn-logout">🚪 Logout</button>
      </div>
    `;
    
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
  } else {
    authStatusTop.innerHTML = `
      <button id="loginBtnTop" class="btn-login">🔐 Login</button>
    `;
    
    document.getElementById('loginBtnTop')?.addEventListener('click', () => openAuthModal());
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
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem('authToken', authToken);
      
      showNotification('✅ Login erfolgreich!', 'success');
      closeAuthModal();
      updateAuthStatus();
      loginForm.reset();
    } else {
      showNotification('❌ ' + (data.error || 'Login fehlgeschlagen'), 'error');
    }
  } catch (err) {
    console.error('Login error:', err);
    showNotification('❌ Verbindungsfehler', 'error');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  
  if (password.length < 6) {
    showNotification('❌ Passwort muss mindestens 6 Zeichen lang sein', 'error');
    return;
  }
  
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      authToken = data.token;
      currentUser = data.user;
      localStorage.setItem('authToken', authToken);
      
      showNotification('✅ Account erstellt!', 'success');
      closeAuthModal();
      updateAuthStatus();
      registerForm.reset();
    } else {
      showNotification('❌ ' + (data.error || 'Registrierung fehlgeschlagen'), 'error');
    }
  } catch (err) {
    console.error('Register error:', err);
    showNotification('❌ Verbindungsfehler', 'error');
  }
}

function logout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('authToken');
  updateAuthStatus();
  showNotification('👋 Logout erfolgreich', 'info');
}

// ============================================
// MODAL CONTROLS
// ============================================

function openAuthModal() {
  authModal?.classList.remove('hidden');
}

function closeAuthModal() {
  authModal?.classList.add('hidden');
}

// ============================================
// NOTIFICATIONS
// ============================================

function showNotification(message, type = 'info') {
  // Remove old notifications
  const oldNotif = document.querySelector('.hub-notification');
  if (oldNotif) oldNotif.remove();
  
  // Create notification
  const notif = document.createElement('div');
  notif.className = `hub-notification hub-notification-${type}`;
  notif.textContent = message;
  
  // Style
  notif.style.cssText = `
    position: fixed;
    top: 2rem;
    right: 2rem;
    background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    font-weight: 600;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideInRight 0.3s ease;
  `;
  
  document.body.appendChild(notif);
  
  // Auto remove
  setTimeout(() => {
    notif.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .admin-badge {
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    color: #000;
    padding: 0.25rem 0.75rem;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 700;
  }
`;
document.head.appendChild(style);
