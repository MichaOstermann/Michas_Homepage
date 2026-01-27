// AI Audio Studio - Frontend Logic with Authentication
// Professional Text-to-Audio Generation with State-of-the-Art Production

const form = document.getElementById('audioForm');
const generateBtn = document.getElementById('generateBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const progressBar = document.getElementById('progressBar');
const progressBarContainer = document.getElementById('progressBarContainer');
const audioOutputContainer = document.getElementById('audioOutputContainer');
const audioPlayer = document.getElementById('audioPlayer');
const downloadBtn = document.getElementById('downloadBtn');
const regenBtn = document.getElementById('regenBtn');

// Auth elements
const authModal = document.getElementById('authModal');
const authStatus = document.getElementById('authStatus');
const loginBtn = document.getElementById('loginBtn');
const closeModal = document.getElementById('closeModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const generatorSection = document.getElementById('generatorSection');

// Auth state
let authToken = null;
let currentUser = null;

// Check for existing session on load
window.addEventListener('DOMContentLoaded', () => {
  const savedToken = localStorage.getItem('audioStudioToken');
  const savedUser = localStorage.getItem('audioStudioUser');
  
  if (savedToken && savedUser) {
    authToken = savedToken;
    currentUser = JSON.parse(savedUser);
    showGeneratorUI();
  }
});

// Modal controls
loginBtn.addEventListener('click', () => {
  authModal.classList.remove('hidden');
});

closeModal.addEventListener('click', () => {
  authModal.classList.add('hidden');
});

// Click outside modal to close
authModal.addEventListener('click', (e) => {
  if (e.target === authModal) {
    authModal.classList.add('hidden');
  }
});

// Login handler
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    const response = await fetch('https://michas-homepage-3em5.vercel.app/api/auth-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      alert('Login failed: ' + data.error);
      return;
    }
    
    // Store auth
    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem('audioStudioToken', authToken);
    localStorage.setItem('audioStudioUser', JSON.stringify(currentUser));
    
    // Show generator
    authModal.classList.add('hidden');
    showGeneratorUI();
    
  } catch (err) {
    alert('Login error: ' + err.message);
  }
});

// Register handler
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  
  try {
    const response = await fetch('https://michas-homepage-3em5.vercel.app/api/auth-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      alert('Registration failed: ' + data.error);
      return;
    }
    
    alert('Registration successful! Please login now.');
    
    // Clear register form and focus login
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('loginEmail').value = email;
    document.getElementById('loginEmail').focus();
    
  } catch (err) {
    alert('Registration error: ' + err.message);
  }
});

function showGeneratorUI() {
  // Update UI
  authStatus.innerHTML = `
    <div style="display: flex; align-items: center; gap: 1rem; justify-content: center; flex-wrap: wrap;">
      <span class="txt-dim" style="font-size: 0.95rem;">
        👤 <strong style="color: #06FFF0;">${currentUser.email}</strong>
        ${currentUser.isAdmin ? '<span style="color: #FFD700;">⭐ Admin</span>' : ''}
      </span>
      <span class="txt-dim" style="font-size: 0.9rem;">
        🎵 ${currentUser.isAdmin ? 'Unlimited' : `${currentUser.generationsUsed}/${currentUser.monthlyLimit}`} Songs
      </span>
      <button id="logoutBtn" class="btn" style="background: rgba(255,20,147,0.2); color: #FF1493; padding: 0.5rem 1.5rem; border: 1px solid rgba(255,20,147,0.4); border-radius: 8px; font-size: 0.9rem; cursor: pointer;">
        Logout
      </button>
    </div>
  `;
  
  document.getElementById('logoutBtn').addEventListener('click', logout);
  
  generatorSection.classList.remove('hidden');
}

function logout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('audioStudioToken');
  localStorage.removeItem('audioStudioUser');
  location.reload();
}

async function generateAudio(e) {
  e.preventDefault();
  
  const buttonText = generateBtn.querySelector('span');
  buttonText.textContent = '✨ Generating Song...';
  loadingSpinner.classList.remove('hidden');
  generateBtn.disabled = true;
  progressBarContainer.classList.remove('hidden');
  progressBar.style.width = '0%';
  audioOutputContainer.classList.add('hidden');

  // Collect user inputs
  const lyrics = document.getElementById('lyrics').value;
  const genre = document.getElementById('genre').value;
  const bpm = document.getElementById('bpm').value;
  const atmosphere = document.getElementById('atmosphere').value;
  const mastering = document.getElementById('mastering').value;
  const description = document.getElementById('description').value;

  // Simulate progress
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.random() * 10;
    if (progress > 85) progress = 85;
    progressBar.style.width = progress + '%';
  }, 800);

  try {
    // Call our Vercel API endpoint for ElevenLabs Music generation
    const response = await fetch('https://michas-homepage-3em5.vercel.app/api/generate-music', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ 
        lyrics,
        genre, 
        bpm: parseInt(bpm), 
        atmosphere, 
        mastering,
        description 
      })
    });
    
    clearInterval(progressInterval);
    
    if (!response.ok) {
      const errorData = await response.json();
      
      // Check for auth error
      if (response.status === 401) {
        alert('Session expired. Please login again.');
        logout();
        throw new Error('Authentication expired');
      }
      
      // Check for limit error
      if (response.status === 429) {
        alert(`Monthly limit reached!\n\n${errorData.error}\n\nFalls du mehr Generationen brauchst, kontaktiere uns!`);
        throw new Error(errorData.error);
      }
      
      throw new Error(errorData.error || 'Failed to generate music');
    }
    
    const data = await response.json();
    
    if (!data.success || !data.audio) {
      throw new Error('Invalid response from server');
    }
    
    // Update remaining generations display
    if (data.remainingGenerations !== undefined && !currentUser.isAdmin) {
      currentUser.generationsUsed = currentUser.monthlyLimit - data.remainingGenerations;
      localStorage.setItem('audioStudioUser', JSON.stringify(currentUser));
      showGeneratorUI(); // Refresh UI
    }
    
    // Convert base64 to audio blob
    const audioBlob = base64ToBlob(data.audio, 'audio/mpeg');
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Set audio player source
    audioPlayer.src = audioUrl;
    
    // Store for download
    audioPlayer.dataset.audioBlob = audioUrl;
    
    progressBar.style.width = '100%';
    
    // Show output container
    audioOutputContainer.classList.remove('hidden');
    
    buttonText.textContent = '� Generate Song with Vocals';
    loadingSpinner.classList.add('hidden');
    generateBtn.disabled = false;
    
    setTimeout(() => progressBarContainer.classList.add('hidden'), 600);
    
  } catch (err) {
    clearInterval(progressInterval);
    alert('Error generating song: ' + err.message);
    buttonText.textContent = '🎤 Generate Song with Vocals';
    loadingSpinner.classList.add('hidden');
    generateBtn.disabled = false;
    progressBarContainer.classList.add('hidden');
  }
}

// Helper function to convert base64 to Blob
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

function buildLyricsToMusicPrompt(lyrics, genre, bpm, atmosphere, mastering, description) {
  // Build SOTA Prompt for Lyrics-to-Music (like Suno/Udio/Musicful)
  // [CLOCK] | [GENRE-DNA] | [INSTRUMENTAL-LAYERING] | [ATMOSPHERE] | [ENGINEERING-STAMP] | [VOCALS + LYRICS]
  
  const genreTemplates = {
    'modern-trap': {
      genreDNA: 'Trap',
      instrumental: '808-Sub-Bass (tuned to Key), Rattling Triple-Hi-Hats, Sharp Snare',
      engineering: 'Side-chained Low-end, Surgical EQ, No-Mud Filter'
    },
    'boom-bap': {
      genreDNA: '90s Hip-Hop',
      instrumental: 'MPC-style swing, Vinyl-crackle, Jazz-sample chops, Thick Bass',
      engineering: 'Mid-range saturation, Authentic Lo-fi textures'
    },
    'radio-pop': {
      genreDNA: 'Modern Pop',
      instrumental: 'Polished Synth-Layers, Hybrid Drums, Clean Electric Bass',
      engineering: 'Ultra-wide Stereo, Multiband-compressed, High-Gloss Finish'
    },
    'stadium-rock': {
      genreDNA: 'Hard Rock',
      instrumental: 'Multi-tracked Guitars (Double-tracked L/R), Acoustic Drum Kit (Live Room)',
      engineering: 'High Dynamic Range, Analog Console Emulation'
    },
    'edm': {
      genreDNA: 'Electronic Dance',
      instrumental: 'Synthesized Leads, Sub-Bass, Build-up FX, Drop Elements',
      engineering: 'Sidechain Compression, Wide Stereo Field, Limiter at -0.1dB'
    },
    'indie-alternative': {
      genreDNA: 'Indie/Alternative',
      instrumental: 'Organic Guitars, Live Drums, Ambient Pads, Textured Vocals',
      engineering: 'Natural Dynamics, Room Ambience, Warm Saturation'
    },
    'rnb': {
      genreDNA: 'R&B/Soul',
      instrumental: 'Smooth Keys, Sub-Bass, Tight Drums, Vocal Harmonies',
      engineering: 'Vocal-forward Mix, Lush Reverb, Warm EQ'
    },
    'metal': {
      genreDNA: 'Metal/Heavy',
      instrumental: 'Distorted Guitars (Quad-tracked), Double-kick Drums, Aggressive Bass',
      engineering: 'Tight Low-end, Brick-wall Compression, Aggressive EQ'
    }
  };

  const atmosphereMap = {
    'dark-aggressive': 'Dark, Aggressive',
    'euphoric': 'Euphoric, Uplifting',
    'melancholic': 'Melancholic, Emotional',
    'energetic': 'Energetic, Powerful',
    'chill': 'Chill, Laid-back',
    'anthemic': 'Anthemic, Epic'
  };

  const masteringMap = {
    'streaming': 'Streaming-Ready (-14 LUFS, Transparent Master)',
    'club': 'Club-Ready (Mono-compatible Bass, Phase-Check)',
    'mobile': 'Mobile-Ready (Mid-boost 700Hz-2kHz, Smartphone-optimized)'
  };

  const template = genreTemplates[genre] || genreTemplates['radio-pop'];
  
  const prompt = `
[LYRICS-TO-MUSIC GENERATION]
[CLOCK: ${bpm} BPM] | [GENRE-DNA: ${template.genreDNA}] | [INSTRUMENTAL-LAYERING: ${template.instrumental}] | [ATMOSPHERE: ${atmosphereMap[atmosphere]}] | [ENGINEERING-STAMP: ${template.engineering}, ${masteringMap[mastering]}]

LYRICS (sing these exactly as written):
${lyrics}

VOCAL STYLE & PRODUCTION:
${description || 'Natural vocals matching the genre and mood'}

IMPORTANT INSTRUCTIONS:
- Generate a COMPLETE SONG with VOCALS singing the provided lyrics
- Follow the structure markers in the lyrics ([Intro], [Verse], [Chorus], etc.)
- Vocals must be clear, professional, and match the genre
- Add appropriate backing vocals, harmonies, ad-libs where fitting
- Instrumental arrangement must support and enhance the vocals
- Apply genre-appropriate vocal effects (reverb, delay, Auto-Tune if specified)

STRUCTURE REQUIREMENTS:
- Follow the exact structure in the provided lyrics
- Intro: Set the mood with instrumental, vocals may start sparse
- Verse: Full vocal delivery with rhythm section
- Chorus/Hook: Maximum energy, layered vocals, full instrumentation
- Bridge: Dynamic variation, possible vocal breakdown or build
- Outro: Natural fadeout or hard ending as fitting

QUALITY REQUIREMENTS:
- Loudness-Matching to ${mastering === 'streaming' ? '-14 LUFS (Spotify)' : mastering === 'club' ? '-10 LUFS (Club)' : '-12 LUFS (Mobile)'}
- BPM locked to ${bpm} BPM
- Vocals sit perfectly in the mix (not too loud, not buried)
- Professional mastering chain applied
- Phase coherence, transient punch, spectral balance
`.trim();

  console.log('Lyrics-to-Music SOTA Prompt:', prompt);
  return prompt;
}

// Event Listeners
form.addEventListener('submit', generateAudio);

regenBtn.addEventListener('click', () => {
  form.dispatchEvent(new Event('submit'));
});

downloadBtn.addEventListener('click', () => {
  const audioUrl = audioPlayer.dataset.audioBlob;
  if (!audioUrl) {
    alert('No audio to download. Please generate a song first.');
    return;
  }
  
  // Create download link
  const a = document.createElement('a');
  a.href = audioUrl;
  a.download = `song-${Date.now()}.mp3`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});
