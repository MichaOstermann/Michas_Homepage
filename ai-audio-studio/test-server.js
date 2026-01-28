/**
 * 🧪 AI Audio Studio - Local Test Server
 * Simple Express server for testing API endpoints locally
 * 
 * Usage:
 * 1. npm install express cors dotenv
 * 2. node test-server.js
 * 3. Open http://127.0.0.1:5500/ai-audio-studio/
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock User Database
const users = new Map();
const tokens = new Map();

// ============================================
// AUTH ENDPOINTS
// ============================================

app.post('/api/register', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email und Passwort erforderlich' });
  }
  
  if (users.has(email)) {
    return res.status(400).json({ error: 'User existiert bereits' });
  }
  
  const user = {
    email,
    password, // In production: hash this!
    isAdmin: process.env.ADMIN_WHITELIST?.includes(email) || false,
    songsGenerated: 0
  };
  
  users.set(email, user);
  
  const token = 'test-token-' + Date.now();
  tokens.set(token, email);
  
  res.json({
    token,
    user: {
      email: user.email,
      isAdmin: user.isAdmin
    }
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.get(email);
  
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
  }
  
  const token = 'test-token-' + Date.now();
  tokens.set(token, email);
  
  res.json({
    token,
    user: {
      email: user.email,
      isAdmin: user.isAdmin
    }
  });
});

app.get('/api/check-session', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  
  const email = tokens.get(token);
  
  if (!email) {
    return res.status(401).json({ error: 'Ungültiger Token' });
  }
  
  const user = users.get(email);
  
  res.json({
    email: user.email,
    isAdmin: user.isAdmin
  });
});

// ============================================
// GENERATION ENDPOINTS
// ============================================

app.post('/api/generate', async (req, res) => {
  const { model, prompt, maxTokens } = req.body;
  
  console.log('📝 Generate Request:', {
    model,
    promptLength: prompt?.length,
    maxTokens
  });
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check if we have OpenAI API key
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    return res.status(500).json({
      error: '⚠️ OPENAI_API_KEY nicht konfiguriert! Bitte .env Datei erstellen.'
    });
  }
  
  // TODO: Replace with real OpenAI API call
  // For now, return test lyrics
  const testLyrics = `[INTRO]
Walking through the city at midnight
Neon signs reflecting in the rain
Searching for a feeling that feels right
Trying to escape this endless pain

[VERSE 1]
Every corner holds a memory
Of the times we used to share
Now I'm walking through this reverie
Wondering if you still care

The streets are empty, cold and grey
Just like the words we left unsaid
I'm trying to find another way
To get you out of my head

[CHORUS]
But I'm lost in the echoes
Of everything we used to be
Drowning in these shadows
Can't find my way back to me

I'm calling out but no one hears
These silent screams inside my soul
Been fighting all these lonely fears
Trying to feel whole

[VERSE 2]
Neon lights are fading now
Dawn is breaking through the night
Still don't know when or how
I'll make it back to the light

[CHORUS]
But I'm lost in the echoes
Of everything we used to be
Drowning in these shadows
Can't find my way back to me

I'm calling out but no one hears
These silent screams inside my soul
Been fighting all these lonely fears
Trying to feel whole

[BRIDGE]
Maybe someday I'll understand
Why we had to fall apart
But until then I'll make my stand
And try to heal this broken heart

[CHORUS]
I'm lost in the echoes
Of everything we used to be
Drowning in these shadows
Can't find my way back to me

I'm calling out but no one hears
These silent screams inside my soul
Been fighting all these lonely fears
But now I'm learning to be whole

[OUTRO]
The sun is rising, new day's here
Maybe it's time to let you go
Face tomorrow without fear
And let my true colors show

---
✨ Generated with Test Server
`;

  res.json({ text: testLyrics });
});

app.post('/api/generate-music', async (req, res) => {
  const { lyrics, genre, bpm, atmosphere } = req.body;
  
  console.log('🎵 Music Generation Request:', {
    genre,
    bpm,
    atmosphere,
    lyricsLength: lyrics?.length
  });
  
  // Check authorization
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  const email = tokens.get(token);
  
  if (!email) {
    return res.status(401).json({ error: 'Login erforderlich' });
  }
  
  const user = users.get(email);
  
  // Check limits (unless admin)
  if (!user.isAdmin && user.songsGenerated >= 5) {
    return res.status(403).json({
      error: 'Monatslimit erreicht! Du hast bereits 5 Songs generiert.'
    });
  }
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Check if we have ElevenLabs API key
  if (!process.env.ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY === 'your_elevenlabs_api_key_here') {
    return res.status(500).json({
      error: '⚠️ ELEVENLABS_API_KEY nicht konfiguriert! Bitte .env Datei erstellen.'
    });
  }
  
  // TODO: Replace with real ElevenLabs API call
  
  user.songsGenerated++;
  
  res.json({
    success: true,
    audioUrl: 'https://example.com/test-audio.mp3',
    metadata: {
      genre,
      bpm,
      atmosphere,
      duration: '3:45'
    }
  });
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '🧪 Test Server Running',
    users: users.size,
    tokens: tokens.size,
    env: {
      openai: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here',
      elevenlabs: !!process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_API_KEY !== 'your_elevenlabs_api_key_here'
    }
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║   🧪 AI Audio Studio Test Server        ║
║                                          ║
║   🚀 Running on http://localhost:${PORT}  ║
║                                          ║
║   📝 Endpoints:                          ║
║   POST /api/register                     ║
║   POST /api/login                        ║
║   GET  /api/check-session                ║
║   POST /api/generate                     ║
║   POST /api/generate-music               ║
║   GET  /api/health                       ║
║                                          ║
║   🔧 Environment:                        ║
║   OpenAI: ${process.env.OPENAI_API_KEY ? '✅' : '❌'}                          ║
║   ElevenLabs: ${process.env.ELEVENLABS_API_KEY ? '✅' : '❌'}                   ║
╚══════════════════════════════════════════╝
  `);
  
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    console.log('\n⚠️  WARNUNG: OPENAI_API_KEY nicht konfiguriert!');
    console.log('   Bitte .env Datei mit echten API Keys erstellen.\n');
  }
});
