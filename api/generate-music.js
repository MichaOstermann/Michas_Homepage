// Vercel Serverless Function – ElevenLabs Music API Integration
// Generates complete songs with vocals from lyrics
import { jwtVerify } from 'jose';
import { promises as fs } from 'fs';
import path from 'path';

const USERS_FILE = path.join('/tmp', 'audio-studio-users.json');
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');

async function getUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  // Auth check
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.substring(7);
  
  try {
    // Verify JWT
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const email = payload.email;
    const isAdmin = payload.isAdmin || false;

    // Check user limits
    const users = await getUsers();
    const user = users[email];

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check monthly limit (admins have unlimited)
    if (!isAdmin && user.generationsUsed >= user.monthlyLimit) {
      return res.status(429).json({ 
        error: `Monthly limit reached (${user.monthlyLimit} songs/month). Please contact us for more access.`,
        limit: user.monthlyLimit,
        used: user.generationsUsed
      });
    }

    const { lyrics, genre, bpm, atmosphere, description } = req.body || {};
  
  if (!lyrics) {
    return res.status(400).json({ error: 'Lyrics are required' });
  }

  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'ElevenLabs API key not configured. Please add ELEVENLABS_API_KEY to Vercel environment variables.' 
      });
    }

    // Build the music generation prompt
    const musicPrompt = buildMusicPrompt(lyrics, genre, bpm, atmosphere, description);

    // Call ElevenLabs Music API
    // Note: Adjust endpoint based on actual ElevenLabs Music API documentation
    const response = await fetch('https://api.elevenlabs.io/v1/music/generate', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: musicPrompt,
        duration_seconds: null, // Auto-detect based on lyrics length
        prompt_influence: 0.7, // Higher = more precise to prompt
        model_id: 'eleven_music_v1' // Adjust based on actual model name
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('ElevenLabs API Error:', errorData);
      return res.status(response.status).json({ 
        error: `ElevenLabs API error: ${response.statusText}`,
        details: errorData
      });
    }

    // Get audio buffer
    const audioBuffer = await response.arrayBuffer();
    
    // Update user generation count
    user.generationsUsed += 1;
    users[email] = user;
    await saveUsers(users);
    
    // Convert to base64 for frontend
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    
    res.status(200).json({ 
      success: true,
      audio: base64Audio,
      format: 'mp3',
      remainingGenerations: isAdmin ? -1 : (user.monthlyLimit - user.generationsUsed)
    });

  } catch (err) {
    console.error('Backend error:', err);
    
    // Check if JWT error
    if (err.code === 'ERR_JWT_EXPIRED' || err.code === 'ERR_JWS_INVALID') {
      return res.status(401).json({ error: 'Session expired. Please login again.' });
    }
    
    res.status(500).json({ 
      error: err.message || 'Server error during music generation' 
    });
  }
}

function buildMusicPrompt(lyrics, genre, bpm, atmosphere, description) {
  // Build comprehensive prompt for ElevenLabs Music API
  const genreMap = {
    'modern-trap': 'Modern Trap with 808 bass, trap hi-hats, melodic vocals',
    'boom-bap': '90s Boom Bap Hip-Hop with jazz samples, vinyl crackle, punchy drums',
    'radio-pop': 'Radio-ready Pop with polished production, catchy hooks, wide stereo',
    'stadium-rock': 'Stadium Rock with powerful guitars, live drums, anthemic vocals',
    'edm': 'Electronic Dance Music with synthesizers, build-ups, powerful drops',
    'indie-alternative': 'Indie Alternative with organic instruments, emotional vocals',
    'rnb': 'R&B/Soul with smooth vocals, sultry mood, rich harmonies',
    'metal': 'Metal with distorted guitars, double kick drums, aggressive vocals'
  };

  const atmosphereMap = {
    'dark-aggressive': 'dark and aggressive',
    'euphoric': 'euphoric and uplifting',
    'melancholic': 'melancholic and emotional',
    'energetic': 'energetic and powerful',
    'chill': 'chill and laid-back',
    'anthemic': 'anthemic and epic'
  };

  const prompt = `
Create a complete ${genreMap[genre] || 'Pop'} song at ${bpm} BPM with a ${atmosphereMap[atmosphere] || 'energetic'} atmosphere.

${description ? `Vocal Style: ${description}` : 'Professional vocals matching the genre'}

LYRICS TO SING:
${lyrics}

PRODUCTION REQUIREMENTS:
- Follow the exact structure markers in the lyrics ([Intro], [Verse], [Chorus], etc.)
- Professional mixing and mastering
- Clear, expressive vocals that match the genre and mood
- Genre-appropriate instrumentation
- Balanced frequency spectrum
- Streaming-ready quality (Spotify standard)
`.trim();

  return prompt;
}
