// Vercel Serverless Function – Simplified Music Generation (No Auth Required for Demo)
// Generates complete songs with vocals using ElevenLabs or Suno API

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const { prompt, description, genre, mood, tempo, vocals, duration, lyrics } = req.body || {};

    // Validate input
    if (!prompt && !description) {
      return res.status(400).json({ error: 'Song description or prompt is required' });
    }

    // Check API Key from environment
    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    const sunoKey = process.env.SUNO_API_KEY;

    if (!elevenLabsKey && !sunoKey) {
      return res.status(500).json({ 
        error: 'Music generation service not configured. Please add ELEVENLABS_API_KEY or SUNO_API_KEY to environment variables.',
        code: 'NO_API_KEY'
      });
    }

    // Build comprehensive music prompt
    const musicPrompt = buildMusicPrompt(prompt || description, genre, mood, tempo, vocals, duration, lyrics);

    console.log('[Music Generation Simple] Starting generation...', { genre, mood, tempo });

    // Try ElevenLabs first if available
    if (elevenLabsKey) {
      try {
        const audioUrl = await generateWithElevenLabs(musicPrompt, elevenLabsKey, lyrics);
        return res.status(200).json({ 
          success: true,
          audioUrl: audioUrl,
          provider: 'elevenlabs',
          generatedAt: new Date().toISOString()
        });
      } catch (elevenLabsError) {
        console.error('[ElevenLabs] Failed:', elevenLabsError.message);
        // Fall through to try Suno
      }
    }

    // Try Suno as fallback if available
    if (sunoKey) {
      try {
        const audioUrl = await generateWithSuno(musicPrompt, sunoKey, lyrics);
        return res.status(200).json({ 
          success: true,
          audioUrl: audioUrl,
          provider: 'suno',
          generatedAt: new Date().toISOString()
        });
      } catch (sunoError) {
        console.error('[Suno] Failed:', sunoError.message);
        throw sunoError;
      }
    }

    throw new Error('All music generation providers failed');

  } catch (error) {
    console.error('[Music Generation Simple] Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Music generation failed. Please try again.',
      code: 'GENERATION_FAILED'
    });
  }
}

// Generate with ElevenLabs API
async function generateWithElevenLabs(prompt, apiKey, lyrics) {
  const endpoint = 'https://api.elevenlabs.io/v1/text-to-sound-effects';
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: lyrics ? `${prompt}\n\nLyrics:\n${lyrics}` : prompt,
      duration_seconds: null, // Auto-detect
      prompt_influence: 0.3
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs API Error ${response.status}: ${errorText}`);
  }

  // Get audio buffer and convert to data URL
  const audioBuffer = await response.arrayBuffer();
  const base64Audio = Buffer.from(audioBuffer).toString('base64');
  
  // Return as data URL for immediate playback
  return `data:audio/mpeg;base64,${base64Audio}`;
}

// Generate with Suno API (if available)
async function generateWithSuno(prompt, apiKey, lyrics) {
  // Suno API endpoint - update with actual endpoint when available
  const endpoint = 'https://api.suno.ai/v1/generate';
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: prompt,
      lyrics: lyrics || null,
      make_instrumental: !lyrics
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Suno API Error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  
  // Return audio URL from Suno response
  return data.audio_url || data.url || data.audioUrl;
}

// Build comprehensive music generation prompt
function buildMusicPrompt(description, genre, mood, tempo, vocals, duration, lyrics) {
  let prompt = '';

  // Genre and style
  if (genre) {
    prompt += `Genre: ${genre}. `;
  }

  // Mood/Atmosphere
  if (mood) {
    prompt += `Mood: ${mood}. `;
  }

  // Tempo
  if (tempo) {
    prompt += `Tempo: ${tempo}. `;
  }

  // Vocals
  if (vocals) {
    if (vocals === 'male') {
      prompt += `Male vocals. `;
    } else if (vocals === 'female') {
      prompt += `Female vocals. `;
    } else if (vocals === 'instrumental') {
      prompt += `Instrumental only, no vocals. `;
    }
  }

  // Duration
  if (duration) {
    if (duration === 'short') {
      prompt += `Duration: approximately 2 minutes. `;
    } else if (duration === 'medium') {
      prompt += `Duration: approximately 3 minutes. `;
    } else if (duration === 'long') {
      prompt += `Duration: approximately 4 minutes. `;
    }
  }

  // Main description
  prompt += description;

  // Production quality
  prompt += ` Professional studio production, high quality mixing and mastering.`;

  return prompt;
}
