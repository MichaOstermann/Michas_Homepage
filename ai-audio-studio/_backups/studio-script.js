// AI AUDIO STUDIO - PROFESSIONAL SCRIPT
// Modern Studio Interface with Authentication & Music Generation

// ========================================
// STATE MANAGEMENT
// ========================================

let authToken = null;
let currentUser = null;
let generationHistory = [];

// ========================================
// DOM ELEMENTS
// ========================================

// Auth Elements
const authModal = document.getElementById('authModal');
const authStatusTop = document.getElementById('authStatusTop');
const loginBtnTop = document.getElementById('loginBtnTop');
const closeModal = document.getElementById('closeModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Studio Elements
const studioInterface = document.getElementById('studioInterface');
const studioForm = document.getElementById('studioForm');
const generateBtn = document.getElementById('generateBtn');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');

// Output Elements
const outputPlaceholder = document.getElementById('outputPlaceholder');
const audioOutput = document.getElementById('audioOutput');
const audioPlayer = document.getElementById('audioPlayer');
const trackInfo = document.getElementById('trackInfo');
const trackMetadata = document.getElementById('trackMetadata');
const downloadBtn = document.getElementById('downloadBtn');
const regenerateBtn = document.getElementById('regenerateBtn');
const historyList = document.getElementById('historyList');

// Control Elements
const bpmSlider = document.getElementById('bpm');
const bpmValue = document.getElementById('bpmValue');

// ========================================
// INITIALIZATION
// ========================================

window.addEventListener('DOMContentLoaded', () => {
  // Check for existing session
  const savedToken = localStorage.getItem('audioStudioToken');
  const savedUser = localStorage.getItem('audioStudioUser');
  
  if (savedToken && savedUser) {
    authToken = savedToken;
    currentUser = JSON.parse(savedUser);
    showStudioInterface();
  }
  
  // Load history from localStorage
  const savedHistory = localStorage.getItem('generationHistory');
  if (savedHistory) {
    generationHistory = JSON.parse(savedHistory);
    renderHistory();
  }
});

// ========================================
// AUTH MODAL CONTROLS
// ========================================

loginBtnTop?.addEventListener('click', () => {
  authModal?.classList.remove('hidden');
});

closeModal?.addEventListener('click', () => {
  authModal?.classList.add('hidden');
});

authModal?.addEventListener('click', (e) => {
  if (e.target === authModal) {
    authModal.classList.add('hidden');
  }
});

// ========================================
// BPM SLIDER
// ========================================

bpmSlider?.addEventListener('input', (e) => {
  bpmValue.textContent = e.target.value;
});

// ========================================
// LOGIN HANDLER
// ========================================

loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const submitBtn = e.target.querySelector('button[type="submit"]');
  
  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in...';
  
  try {
    const response = await fetch('https://michas-homepage-3em5.vercel.app/api/auth-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    
    // Store auth
    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem('audioStudioToken', authToken);
    localStorage.setItem('audioStudioUser', JSON.stringify(currentUser));
    
    // Show studio
    authModal.classList.add('hidden');
    showStudioInterface();
    
    // Show success notification
    showNotification('✅ Login successful! Welcome to AI Audio Studio', 'success');
    
  } catch (err) {
    showNotification('❌ ' + err.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Login';
  }
});

// ========================================
// REGISTER HANDLER
// ========================================

registerForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const submitBtn = e.target.querySelector('button[type="submit"]');
  
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating account...';
  
  try {
    const response = await fetch('https://michas-homepage-3em5.vercel.app/api/auth-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }
    
    // Show success and focus login
    showNotification('✅ Account created! Please login now', 'success');
    
    // Clear register form and prefill login
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('loginEmail').value = email;
    document.getElementById('loginPassword').focus();
    
  } catch (err) {
    showNotification('❌ ' + err.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Account';
  }
});

// ========================================
// SHOW STUDIO INTERFACE
// ========================================

function showStudioInterface() {
  // Update top bar
  authStatusTop.innerHTML = `
    <div class="user-status">
      <span class="user-email">${currentUser.email}</span>
      ${currentUser.isAdmin ? '<span class="user-badge">⭐ ADMIN</span>' : ''}
      <span class="user-quota">
        🎵 ${currentUser.isAdmin ? 'Unlimited' : `${currentUser.generationsUsed}/${currentUser.monthlyLimit}`}
      </span>
      <button id="logoutBtnTop" class="btn-logout">Logout</button>
    </div>
  `;
  
  document.getElementById('logoutBtnTop').addEventListener('click', logout);
  
  // Show studio interface
  studioInterface?.classList.remove('hidden');
}

// ========================================
// LOGOUT
// ========================================

function logout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('audioStudioToken');
  localStorage.removeItem('audioStudioUser');
  location.reload();
}

// ========================================
// GENERATE AUDIO
// ========================================

studioForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Disable button
  const btnText = generateBtn.querySelector('.btn-text');
  const originalText = btnText.textContent;
  btnText.textContent = 'Generating...';
  generateBtn.disabled = true;
  
  // Show progress
  progressContainer.classList.remove('hidden');
  progressFill.style.width = '0%';
  
  // Hide output
  audioOutput.classList.add('hidden');
  outputPlaceholder.classList.remove('hidden');
  
  // Collect form data
  const formData = {
    lyrics: document.getElementById('lyrics').value,
    genre: document.getElementById('genre').value,
    bpm: parseInt(document.getElementById('bpm').value),
    atmosphere: document.getElementById('atmosphere').value,
    mastering: document.getElementById('mastering').value,
    description: document.getElementById('vocalStyle').value || undefined
  };
  
  // Simulate progress
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.random() * 8;
    if (progress > 85) progress = 85;
    progressFill.style.width = progress + '%';
  }, 600);
  
  try {
    // Call API
    const response = await fetch('https://michas-homepage-3em5.vercel.app/api/generate-music', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(formData)
    });
    
    clearInterval(progressInterval);
    
    // Handle errors
    if (!response.ok) {
      const errorData = await response.json();
      
      if (response.status === 401) {
        showNotification('❌ Session expired. Please login again.', 'error');
        logout();
        return;
      }
      
      if (response.status === 429) {
        showNotification(`❌ ${errorData.error}`, 'error');
        throw new Error(errorData.error);
      }
      
      throw new Error(errorData.error || 'Generation failed');
    }
    
    const data = await response.json();
    
    if (!data.success || !data.audio) {
      throw new Error('Invalid response from server');
    }
    
    // Update user quota
    if (data.remainingGenerations !== undefined && !currentUser.isAdmin) {
      currentUser.generationsUsed = currentUser.monthlyLimit - data.remainingGenerations;
      localStorage.setItem('audioStudioUser', JSON.stringify(currentUser));
      showStudioInterface();
    }
    
    // Convert base64 to blob
    const audioBlob = base64ToBlob(data.audio, 'audio/mpeg');
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Set audio player
    audioPlayer.src = audioUrl;
    audioPlayer.dataset.audioBlob = audioUrl;
    
    // Update track info
    trackInfo.textContent = `Generated ${new Date().toLocaleTimeString()}`;
    
    // Update metadata
    trackMetadata.innerHTML = `
      <div class="metadata-item">
        <span class="metadata-label">Genre</span>
        <span class="metadata-value">${data.metadata?.genre || formData.genre}</span>
      </div>
      <div class="metadata-item">
        <span class="metadata-label">BPM</span>
        <span class="metadata-value">${data.metadata?.bpm || formData.bpm}</span>
      </div>
      <div class="metadata-item">
        <span class="metadata-label">Atmosphere</span>
        <span class="metadata-value">${data.metadata?.atmosphere || formData.atmosphere}</span>
      </div>
      <div class="metadata-item">
        <span class="metadata-label">File Size</span>
        <span class="metadata-value">${data.fileSizeMB || '?'} MB</span>
      </div>
    `;
    
    // Add to history
    addToHistory({
      timestamp: new Date().toISOString(),
      genre: formData.genre,
      bpm: formData.bpm,
      audioUrl: audioUrl
    });
    
    // Complete progress
    progressFill.style.width = '100%';
    
    // Show output
    setTimeout(() => {
      outputPlaceholder.classList.add('hidden');
      audioOutput.classList.remove('hidden');
      progressContainer.classList.add('hidden');
    }, 500);
    
    showNotification('✅ Track generated successfully!', 'success');
    
  } catch (err) {
    clearInterval(progressInterval);
    progressContainer.classList.add('hidden');
    showNotification('❌ ' + err.message, 'error');
  } finally {
    btnText.textContent = originalText;
    generateBtn.disabled = false;
  }
});

// ========================================
// DOWNLOAD BUTTON
// ========================================

downloadBtn?.addEventListener('click', () => {
  const audioUrl = audioPlayer.dataset.audioBlob;
  if (!audioUrl) {
    showNotification('❌ No audio to download', 'error');
    return;
  }
  
  const a = document.createElement('a');
  a.href = audioUrl;
  a.download = `ai-audio-studio-${Date.now()}.mp3`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  showNotification('💾 Download started!', 'success');
});

// ========================================
// REGENERATE BUTTON
// ========================================

regenerateBtn?.addEventListener('click', () => {
  studioForm.dispatchEvent(new Event('submit'));
});

// ========================================
// GENERATION HISTORY
// ========================================

function addToHistory(item) {
  generationHistory.unshift(item);
  
  // Keep only last 10
  if (generationHistory.length > 10) {
    generationHistory = generationHistory.slice(0, 10);
  }
  
  localStorage.setItem('generationHistory', JSON.stringify(generationHistory));
  renderHistory();
}

function renderHistory() {
  if (!historyList) return;
  
  if (generationHistory.length === 0) {
    historyList.innerHTML = '<p class="history-empty">No generations yet. Create your first track!</p>';
    return;
  }
  
  historyList.innerHTML = generationHistory.map((item, index) => {
    const date = new Date(item.timestamp);
    return `
      <div class="history-item" data-index="${index}">
        <div class="history-item-title">Track #${generationHistory.length - index}</div>
        <div class="history-item-info">
          ${item.genre} · ${item.bpm} BPM · ${date.toLocaleDateString()} ${date.toLocaleTimeString()}
        </div>
      </div>
    `;
  }).join('');
  
  // Add click handlers
  document.querySelectorAll('.history-item').forEach(item => {
    item.addEventListener('click', () => {
      const index = parseInt(item.dataset.index);
      const historyItem = generationHistory[index];
      
      if (historyItem.audioUrl) {
        audioPlayer.src = historyItem.audioUrl;
        audioPlayer.dataset.audioBlob = historyItem.audioUrl;
        
        outputPlaceholder.classList.add('hidden');
        audioOutput.classList.remove('hidden');
        
        showNotification('✅ Loaded from history', 'success');
      }
    });
  });
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteArrays = [];
  
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  
  return new Blob(byteArrays, { type: mimeType });
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'notification notification-' + type;
  notification.textContent = message;
  
  // Style
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: ${type === 'success' ? '#00FF88' : type === 'error' ? '#FF1493' : '#06FFF0'};
    color: #0B0F16;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    font-weight: 700;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  // Add to body
  document.body.appendChild(notification);
  
  // Remove after 4 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 4000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
