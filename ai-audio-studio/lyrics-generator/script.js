/* ============================================
   LYRICS GENERATOR SCRIPT
   Professional Songtext Generator
   ============================================ */

// Auth State
let authToken = localStorage.getItem('authToken');
let currentUser = null;

// Current Lyrics State
let currentLyrics = '';
let currentConfig = null;

// DOM Elements
const authModal = document.getElementById('authModal');
const loginBtnTop = document.getElementById('loginBtnTop');
const closeModal = document.getElementById('closeModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

const lyricsForm = document.getElementById('lyricsForm');
const generateBtn = document.getElementById('generateBtn');

const outputPlaceholder = document.getElementById('outputPlaceholder');
const outputContent = document.getElementById('outputContent');
const lyricsTextDisplay = document.getElementById('lyricsTextDisplay');

const copyLyricsBtn = document.getElementById('copyLyricsBtn');
const downloadLyricsBtn = document.getElementById('downloadLyricsBtn');
const useInStudioBtn = document.getElementById('useInStudioBtn');
const regenerateBtn = document.getElementById('regenerateBtn');

// ============================================
// INIT
// ============================================

window.addEventListener('DOMContentLoaded', () => {
  checkAuthSession();
  updateAuthStatus();
  
  // Modal Controls
  loginBtnTop?.addEventListener('click', () => openAuthModal());
  closeModal?.addEventListener('click', () => closeAuthModal());
  authModal?.addEventListener('click', (e) => {
    if (e.target === authModal) closeAuthModal();
  });
  
  // Forms
  loginForm?.addEventListener('submit', handleLogin);
  registerForm?.addEventListener('submit', handleRegister);
  lyricsForm?.addEventListener('submit', handleGenerateLyrics);
  
  // Action Buttons
  copyLyricsBtn?.addEventListener('click', copyLyrics);
  downloadLyricsBtn?.addEventListener('click', downloadLyrics);
  useInStudioBtn?.addEventListener('click', useInStudio);
  regenerateBtn?.addEventListener('click', regenerateLyrics);
});

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
// LYRICS GENERATION
// ============================================

async function handleGenerateLyrics(e) {
  e.preventDefault();
  
  // Check Auth (optional for testing - comment out if needed)
  // if (!authToken) {
  //   showNotification('❌ Bitte einloggen', 'error');
  //   openAuthModal();
  //   return;
  // }
  
  // Collect Form Data
  const genre = document.getElementById('lyricsGenre').value;
  const mood = document.getElementById('lyricsMood').value;
  const theme = document.getElementById('lyricsTheme').value;
  const structure = document.getElementById('lyricsStructure').value;
  const rhyme = document.getElementById('lyricsRhyme').value;
  const artistReference = document.getElementById('artistReference').value;
  
  if (!genre || !mood) {
    showNotification('❌ Bitte Genre und Stimmung auswählen', 'error');
    return;
  }
  
  // Save config for regeneration
  currentConfig = { genre, mood, theme, structure, rhyme, artistReference };
  
  // Build Premium Prompt
  const prompt = buildPremiumLyricsPrompt(genre, mood, theme, structure, rhyme, artistReference);
  
  // UI State
  generateBtn.disabled = true;
  generateBtn.innerHTML = '<span>⏳ Generiere...</span>';
  
  try {
    // DEMO MODE: Use mock data if API fails
    let useDemoMode = false;
    
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        prompt: prompt,
        maxTokens: 2000
      })
    }).catch(() => {
      useDemoMode = true;
      return null;
    });
    
    let data;
    
    if (useDemoMode || !response || !response.ok) {
      // Demo Mode: Generate mock lyrics
      showNotification('🎭 Demo Mode - Mock Lyrics werden generiert', 'info');
      data = { text: generateMockLyrics(genre, mood, theme) };
    } else {
      data = await response.json();
    }
    
    if (data.text) {
      currentLyrics = data.text;
      displayLyrics(currentLyrics);
      showNotification('✅ Lyrics generiert!', 'success');
    } else {
      throw new Error('Keine Lyrics erhalten');
    }
  } catch (err) {
    console.error('Lyrics generation error:', err);
    showNotification('❌ ' + err.message, 'error');
  } finally {
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<span>✨ Lyrics Generieren</span>';
  }
}

function buildPremiumLyricsPrompt(genre, mood, theme, structure, rhyme, artistReference) {
  let prompt = `Du bist ein professioneller Songtext-Autor mit Deep Domain Expertise.\n\n`;
  
  prompt += `**GENRE:** ${genre}\n`;
  prompt += `**STIMMUNG:** ${mood}\n`;
  if (theme) prompt += `**THEMA:** ${theme}\n`;
  if (artistReference) prompt += `**ARTIST STYLE REFERENZ:** ${artistReference}\n`;
  prompt += `**STRUKTUR:** ${structure}\n`;
  prompt += `**REIMSCHEMA:** ${rhyme}\n\n`;
  
  prompt += `**PREMIUM WRITING PRINZIPIEN:**\n`;
  prompt += `1. **Show Don't Tell:** Benutze konkrete Bilder und Szenen statt abstrakter Aussagen\n`;
  prompt += `2. **Slant Rhymes:** Moderne, unperfekte Reime für natürlichen Flow (z.B. "night/light" → "night/side")\n`;
  prompt += `3. **Anti-Klischee:** Vermeide Phrasen wie "follow your dreams", "be yourself", "shine like a star"\n`;
  prompt += `4. **Metaphern-Logik:** Metaphern müssen innerhalb ihrer Logik bleiben (wenn Ozean, dann Wellen/Tiefen/Strömung)\n`;
  prompt += `5. **Kontraste:** Nutze Widersprüche und Spannungen (z.B. "cold fire", "silent scream")\n`;
  prompt += `6. **Spezifität:** Konkrete Details statt generische Beschreibungen (z.B. "3 AM rain on Brooklyn streets" statt "rainy night")\n\n`;
  
  prompt += `**STRUKTUR-SPEZIFIKATION:**\n`;
  if (structure === 'standard') {
    prompt += `[Intro - 4 Zeilen]\n[Verse 1 - 8 Zeilen]\n[Chorus - 6 Zeilen]\n[Verse 2 - 8 Zeilen]\n[Chorus - 6 Zeilen]\n[Bridge - 4 Zeilen]\n[Chorus - 6 Zeilen]\n`;
  } else if (structure === 'short') {
    prompt += `[Verse 1 - 8 Zeilen]\n[Chorus - 6 Zeilen]\n[Verse 2 - 8 Zeilen]\n[Chorus - 6 Zeilen]\n`;
  } else if (structure === 'extended') {
    prompt += `[Intro - 4 Zeilen]\n[Verse 1 - 8 Zeilen]\n[Pre-Chorus - 4 Zeilen]\n[Chorus - 6 Zeilen]\n[Verse 2 - 8 Zeilen]\n[Pre-Chorus - 4 Zeilen]\n[Chorus - 6 Zeilen]\n[Bridge - 4 Zeilen]\n[Chorus - 6 Zeilen]\n[Outro - 4 Zeilen]\n`;
  } else {
    prompt += `Experimentelle, freie Struktur mit kreativen Abschnitten.\n`;
  }
  
  prompt += `\n**OUTPUT FORMAT:**\n`;
  prompt += `Schreibe die Lyrics mit klaren Abschnitts-Labels [INTRO], [VERSE 1], [CHORUS], etc.\n`;
  prompt += `Jede Zeile auf einer neuen Zeile.\n\n`;
  
  prompt += `**JETZT SCHREIBE DIE LYRICS:**`;
  
  return prompt;
}

// ============================================
// DEMO MODE - Mock Lyrics Generator
// ============================================

function generateMockLyrics(genre, mood, theme) {
  const themeText = theme || 'life and dreams';
  
  return `[INTRO]
${mood} vibes in the ${genre} sound
${themeText} all around
Let me tell you what I found
In this ${mood} ${genre} playground

[VERSE 1]
Walking through the city lights at 3 AM
Shadows dancing, thoughts I can't condemn
${themeText} weighing heavy on my mind
Searching for the truth I need to find

Every corner holds a memory so clear
Whispers of the past that I still hear
But I keep moving, never looking back
On this ${mood} ${genre} track

[CHORUS]
This is my story, my ${mood} melody
${themeText} setting me free
In this ${genre} symphony
I found where I'm meant to be

[VERSE 2]
Neon signs reflecting in the rain
Every drop washes away the pain
${themeText} leading me through the night
Till I finally see the morning light

[CHORUS]
This is my story, my ${mood} melody
${themeText} setting me free
In this ${genre} symphony
I found where I'm meant to be

[BRIDGE]
And when the world feels cold and grey
I'll find my way, I'll find my way
Through the ${mood} and the ${genre} sound
I'll stand my ground

[CHORUS]
This is my story, my ${mood} melody
${themeText} setting me free
In this ${genre} symphony
I found where I'm meant to be

[OUTRO]
${genre} fading into the dawn
But my ${mood} spirit carries on

---
🎭 DEMO MODE - Mock Lyrics
Real AI-generated lyrics available with API setup`;
}

function displayLyrics(lyrics) {
  outputPlaceholder.style.display = 'none';
  outputContent.classList.remove('hidden');
  lyricsTextDisplay.textContent = lyrics;
}

async function regenerateLyrics() {
  if (!currentConfig) {
    showNotification('❌ Keine Config vorhanden', 'error');
    return;
  }
  
  // Regenerate with same config
  const { genre, mood, theme, structure, rhyme, artistReference } = currentConfig;
  const prompt = buildPremiumLyricsPrompt(genre, mood, theme, structure, rhyme, artistReference);
  
  regenerateBtn.disabled = true;
  regenerateBtn.textContent = '⏳ Regeneriere...';
  
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        prompt: prompt,
        maxTokens: 2000
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.text) {
      currentLyrics = data.text;
      displayLyrics(currentLyrics);
      showNotification('✅ Neue Version generiert!', 'success');
    } else {
      throw new Error(data.error || 'Regeneration fehlgeschlagen');
    }
  } catch (err) {
    console.error('Regeneration error:', err);
    showNotification('❌ ' + err.message, 'error');
  } finally {
    regenerateBtn.disabled = false;
    regenerateBtn.textContent = '🔄 Neue Version generieren';
  }
}

// ============================================
// ACTION BUTTONS
// ============================================

function copyLyrics() {
  if (!currentLyrics) return;
  
  navigator.clipboard.writeText(currentLyrics)
    .then(() => showNotification('📋 Lyrics kopiert!', 'success'))
    .catch(err => {
      console.error('Copy failed:', err);
      showNotification('❌ Kopieren fehlgeschlagen', 'error');
    });
}

function downloadLyrics() {
  if (!currentLyrics) return;
  
  const blob = new Blob([currentLyrics], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lyrics-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showNotification('💾 Lyrics heruntergeladen!', 'success');
}

function useInStudio() {
  if (!currentLyrics) return;
  
  // Save lyrics to localStorage for Song Creator to pick up
  localStorage.setItem('pendingLyrics', currentLyrics);
  
  // Redirect to Song Creator
  window.location.href = '../song-creator/';
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
  const oldNotif = document.querySelector('.lyrics-notification');
  if (oldNotif) oldNotif.remove();
  
  const notif = document.createElement('div');
  notif.className = `lyrics-notification lyrics-notification-${type}`;
  notif.textContent = message;
  
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
  
  setTimeout(() => {
    notif.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
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
