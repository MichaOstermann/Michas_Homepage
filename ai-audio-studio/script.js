// AI Audio Studio - Frontend Logic
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

async function generateAudio(e) {
  e.preventDefault();
  
  const buttonText = generateBtn.querySelector('span');
  buttonText.textContent = '✨ Generating...';
  loadingSpinner.classList.remove('hidden');
  generateBtn.disabled = true;
  progressBarContainer.classList.remove('hidden');
  progressBar.style.width = '0%';
  audioOutputContainer.classList.add('hidden');

  // Collect user inputs
  const genre = document.getElementById('genre').value;
  const bpm = document.getElementById('bpm').value;
  const atmosphere = document.getElementById('atmosphere').value;
  const mastering = document.getElementById('mastering').value;
  const description = document.getElementById('description').value;

  // Build the 5-Pillar Prompt according to SOTA framework
  const audioPrompt = buildSOTAPrompt(genre, bpm, atmosphere, mastering, description);

  // Simulate progress
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress > 90) progress = 90;
    progressBar.style.width = progress + '%';
  }, 500);

  try {
    // TODO: Connect to AI Audio API endpoint
    // For now, we'll show a placeholder
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate API call
    
    clearInterval(progressInterval);
    progressBar.style.width = '100%';
    
    // TODO: Replace with actual audio file from API
    // audioPlayer.src = audioData;
    
    // Show output container
    audioOutputContainer.classList.remove('hidden');
    
    buttonText.textContent = '🎵 Generate Audio';
    loadingSpinner.classList.add('hidden');
    generateBtn.disabled = false;
    
    setTimeout(() => progressBarContainer.classList.add('hidden'), 600);
    
  } catch (err) {
    clearInterval(progressInterval);
    alert('Error generating audio: ' + err.message);
    buttonText.textContent = '🎵 Generate Audio';
    loadingSpinner.classList.add('hidden');
    generateBtn.disabled = false;
    progressBarContainer.classList.add('hidden');
  }
}

function buildSOTAPrompt(genre, bpm, atmosphere, mastering, description) {
  // Build the 5-Pillar SOTA Prompt:
  // [CLOCK] | [GENRE-DNA] | [INSTRUMENTAL-LAYERING] | [ATMOSPHERE] | [ENGINEERING-STAMP]
  
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
[CLOCK: ${bpm} BPM] | [GENRE-DNA: ${template.genreDNA}] | [INSTRUMENTAL-LAYERING: ${template.instrumental}] | [ATMOSPHERE: ${atmosphereMap[atmosphere]}] | [ENGINEERING-STAMP: ${template.engineering}, ${masteringMap[mastering]}]

ADDITIONAL CONTEXT:
${description}

STRUCTURE TAGS:
[SECTION: INTRO] - Reduced instrumentation, filter sweeps
[SECTION: VERSE] - Rhythm stability, vocal pocket (300Hz-3kHz)
[SECTION: BUILD-UP] - Snare rolls, pitch risers, increasing complexity
[SECTION: CHORUS] - Maximum spectral width, density increase, main melody focus
[SECTION: BRIDGE] - Dynamic break, textural variation
[SECTION: OUTRO] - Gradual reduction, fadeout or hard stop

QUALITY REQUIREMENTS:
- Loudness-Matching to target LUFS
- BPM validation and quantization
- Transient-Check for kick drums
- Phase coherence in stereo field
- Professional mastering chain
`.trim();

  console.log('SOTA Prompt:', prompt);
  return prompt;
}

// Event Listeners
form.addEventListener('submit', generateAudio);

regenBtn.addEventListener('click', () => {
  form.dispatchEvent(new Event('submit'));
});

downloadBtn.addEventListener('click', () => {
  // TODO: Implement actual download when API is connected
  alert('Download functionality will be available once the AI Audio API is connected.');
});
