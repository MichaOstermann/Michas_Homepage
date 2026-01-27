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

    // Validate input
    const { lyrics, genre, bpm, atmosphere, description } = req.body || {};
  
    if (!lyrics) {
      return res.status(400).json({ error: 'Lyrics are required' });
    }

    // Validate optional parameters
    const validGenres = ['modern-trap', 'boom-bap', 'radio-pop', 'stadium-rock', 'edm', 'indie-alternative', 'rnb', 'metal'];
    const validAtmospheres = ['dark-aggressive', 'euphoric', 'melancholic', 'energetic', 'chill', 'anthemic'];
    
    if (genre && !validGenres.includes(genre)) {
      return res.status(400).json({ error: 'Invalid genre selected' });
    }
    
    if (atmosphere && !validAtmospheres.includes(atmosphere)) {
      return res.status(400).json({ error: 'Invalid atmosphere selected' });
    }

    // Check lyrics length (max 5000 characters for optimal quality)
    if (lyrics.length > 5000) {
      return res.status(400).json({ error: 'Lyrics too long. Maximum 5000 characters.' });
    }

    try {
      const apiKey = process.env.ELEVENLABS_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: 'Music generation service not configured. Please contact support.',
          code: 'NO_API_KEY'
        });
      }

      // Build the music generation prompt with lyrics
      const musicPrompt = buildMusicPrompt(lyrics, genre, bpm, atmosphere, description);

      // Log request for debugging
      console.log(`[Music Generation] User: ${email}, Genre: ${genre || 'default'}, BPM: ${bpm || 'default'}`);

      // Call ElevenLabs Music API with proper endpoint
      // Docs: https://elevenlabs.io/docs/api-reference/music-generation
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-sound-effects', {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: musicPrompt,
          duration_seconds: null, // Auto-detect from lyrics length
          prompt_influence: 0.3 // Balance between prompt and model creativity
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('ElevenLabs API Error:', errorData);
        
        // Handle specific error codes
        if (response.status === 401) {
          return res.status(500).json({ 
            error: 'Music generation service authentication failed. Please contact support.',
            code: 'API_AUTH_FAILED'
          });
        }
        
        if (response.status === 429) {
          return res.status(503).json({ 
            error: 'Music generation service is temporarily busy. Please try again in a moment.',
            code: 'API_RATE_LIMIT'
          });
        }
        
        return res.status(response.status).json({ 
          error: `Music generation failed: ${response.statusText}`,
          details: errorData,
          code: 'API_ERROR'
        });
      }

      // Get audio buffer
      const audioBuffer = await response.arrayBuffer();
      
      // Validate audio output
      if (!audioBuffer || audioBuffer.byteLength === 0) {
        return res.status(500).json({ 
          error: 'Music generation produced empty result. Please try again.',
          code: 'EMPTY_AUDIO'
        });
      }

      // Update user generation count
      user.generationsUsed += 1;
      user.lastGeneration = new Date().toISOString();
      users[email] = user;
      await saveUsers(users);
      
      // Convert to base64 for frontend
      const base64Audio = Buffer.from(audioBuffer).toString('base64');
      
      // Calculate file size in MB
      const fileSizeMB = (audioBuffer.byteLength / (1024 * 1024)).toFixed(2);
      
      console.log(`[Music Generation] Success for ${email}. File size: ${fileSizeMB}MB, Remaining: ${isAdmin ? 'unlimited' : user.monthlyLimit - user.generationsUsed}`);
      
      res.status(200).json({ 
        success: true,
        audio: base64Audio,
        format: 'mp3',
        fileSizeMB: parseFloat(fileSizeMB),
        generatedAt: new Date().toISOString(),
        remainingGenerations: isAdmin ? -1 : (user.monthlyLimit - user.generationsUsed),
        metadata: {
          genre: genre || 'default',
          bpm: bpm || 'auto',
          atmosphere: atmosphere || 'energetic'
        }
      });

    } catch (apiError) {
      console.error('[Music Generation] API Error:', apiError);
      return res.status(500).json({ 
        error: 'Music generation API failed. Please try again.',
        code: 'API_EXCEPTION',
        details: apiError.message
      });
    }

  } catch (err) {
    console.error('[Music Generation] Backend error:', err);
    
    // Check if JWT error
    if (err.code === 'ERR_JWT_EXPIRED' || err.code === 'ERR_JWS_INVALID') {
      return res.status(401).json({ 
        error: 'Session expired. Please login again.',
  // Genre definitions with production details
  const genreMap = {
    'modern-trap': 'Modern Trap with deep 808 bass, rapid trap hi-hats, auto-tuned melodic vocals, and ambient synth pads',
    'boom-bap': '90s Boom Bap Hip-Hop with jazzy piano samples, vinyl crackle texture, punchy kick and snare, crisp rap vocals',
    'radio-pop': 'Radio-ready Pop with polished vocal production, catchy melodic hooks, wide stereo imaging, and dynamic chorus',
    'stadium-rock': 'Stadium Rock with powerful distorted guitars, live acoustic drums, anthemic vocal harmonies, and epic build-ups',
    'edm': 'Electronic Dance Music with synthesizer leads, build-up risers, powerful bass drops, and energetic beat patterns',
    'indie-alternative': 'Indie Alternative with organic guitar tones, authentic drum grooves, emotional raw vocals, and atmospheric layers',
    'rnb': 'R&B/Soul with smooth silky vocals, sultry vibe, rich chord progressions, and tasteful background harmonies',
    'metal': 'Metal with heavily distorted rhythm guitars, aggressive double kick drums, powerful screaming/singing vocals, and breakdown sections'
  };

  // Atmosphere/mood definitions
  const atmosphereMap = {
    'dark-aggressive': 'dark, aggressive, and intense with heavy low-end presence',
    'euphoric': 'euphoric, uplifting, and inspiring with bright melodic elements',
    'melancholic': 'melancholic, emotional, and introspective with tender dynamics',
    'energetic': 'energetic, powerful, and driving with high-impact percussion',
    'chill': 'chill, laid-back, and relaxed with smooth flowing arrangements',
    'anthemic': 'anthemic, epic, and grandiose with massive chorus sections'
  };

  // Calculate estimated duration from lyrics length
  const wordCount = lyrics.split(/\s+/).length;
  const estimatedDuration = Math.ceil(wordCount / 2.5); // ~150 words per minute average singing speed

  // Build structured prompt
  const selectedGenre = genreMap[genre] || 'Modern Pop with professional production, clear vocals, and radio-ready mix';
  const selectedAtmosphere = atmosphereMap[atmosphere] || 'energetic and engaging with dynamic arrangement';
  const targetBPM = bpm || 120;

  const prompt = `
🎵 MUSIC GENERATION REQUEST 🎵

GENRE & STYLE:
${selectedGenre}

TEMPO: ${targetBPM} BPM
ATMOSPHERE: ${selectedAtmosphere}
${description ? `VOCAL DIRECTION: ${description}` : 'VOCAL STYLE: Professional, expressive, and genre-appropriate'}

SONG STRUCTURE:
Follow the exact structure markers in the lyrics below ([Intro], [Verse], [Chorus], [Bridge], [Outro], etc.)

PRODUCTION REQUIREMENTS:
✓ Professional studio-quality mixing and mastering
✓ Clear, expressive lead vocals with proper pitch and timing
✓ Genre-authentic instrumentation and sound design
✓ Balanced frequency spectrum (lows, mids, highs)
✓ Dynamic range appropriate to genre
✓ Stereo width and depth for immersive experience
✓ Streaming-ready output (Spotify/Apple Music standard: -14 LUFS)

LYRICS TO PERFORM:
${lyrics}

TECHNICAL SPECS:
- Target Duration: ~${estimatedDuration} seconds (based on lyrics length)
- Format: MP3, 320kbps
- Sample Rate: 48kHz
- Bit Depth: 16-bit

Generate a complete, professional-quality song that brings these lyrics to life with emotion, energy, and technical excellence.
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
