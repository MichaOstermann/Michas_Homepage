// Vercel Serverless Function – Music Generation with Replicate
// Generates complete songs using MusicGen, Stable Audio, and other AI models

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

    // Check Replicate API Token
    const replicateToken = process.env.REPLICATE_API_TOKEN;

    if (!replicateToken) {
      return res.status(500).json({ 
        error: 'Music generation service not configured. Please add REPLICATE_API_TOKEN to environment variables.',
        code: 'NO_API_KEY'
      });
    }

    // Build comprehensive music prompt
    const musicPrompt = buildMusicPrompt(prompt || description, genre, mood, tempo, vocals, duration, lyrics);

    console.log('[Music Generation Replicate] Starting generation...', { genre, mood, tempo });

    // Generate with Replicate
    const audioUrl = await generateWithReplicate(musicPrompt, replicateToken, duration, vocals);
    
    return res.status(200).json({ 
      success: true,
      audioUrl: audioUrl,
      provider: 'replicate',
      model: 'musicgen',
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Music Generation] Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Music generation failed. Please try again.',
      code: 'GENERATION_FAILED'
    });
  }
}

// Generate with Replicate API using Stable Audio 2.0 (MAXIMUM DURATION MODE)
async function generateWithReplicate(prompt, apiToken, duration, vocals) {
  // Stable Audio 2.0 Large - Push it to the LIMIT!
  const model = 'b05b1dff1d8c6dc63d14b0cdb42135378dcb87f6373b0d3d341ede46e59e2b38';

  // Calculate duration in seconds - GOING FOR 2:30 MIN!
  let durationSeconds = 90; // default
  if (duration === 'short') durationSeconds = 60;
  else if (duration === 'medium') durationSeconds = 120; // 2 minutes
  else if (duration === 'long') durationSeconds = 150; // 2:30 minutes!

  console.log('[Replicate] MAXIMUM MODE: Generating', durationSeconds, 'seconds with Stable Audio 2.0!');

  // Create prediction
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      version: model,
      input: {
        prompt: prompt,
        seconds_total: durationSeconds,
        steps: 100,
        cfg_scale: 7
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Replicate API Error:', errorText);
    throw new Error(`Replicate API Error ${response.status}: ${errorText}`);
  }

  let prediction;
  try {
    prediction = await response.json();
  } catch (parseError) {
    const rawText = await response.text();
    console.error('Failed to parse Replicate response:', rawText);
    throw new Error(`Invalid API response format: ${parseError.message}`);
  }
  
  // Wait for completion
  let result = prediction;
  let attempts = 0;
  const maxAttempts = 60; // 60 seconds timeout
  
  while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
    
    const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
      headers: {
        'Authorization': `Token ${apiToken}`
      }
    });
    
    if (!statusResponse.ok) {
      throw new Error(`Status check failed: ${statusResponse.status}`);
    }
    
    try {
      result = await statusResponse.json();
    } catch (parseError) {
      console.error('Failed to parse status response');
      throw new Error('Failed to check generation status');
    }
    
    if (result.status === 'failed') {
      throw new Error(`Generation failed: ${result.error || 'Unknown error'}`);
    }
  }
  
  if (attempts >= maxAttempts) {
    throw new Error('Generation timeout - took longer than 60 seconds');
  }
  
  // Return audio URL
  if (!result.output) {
    throw new Error('No audio output generated');
  }
  
  return result.output;
}

// Build comprehensive music generation prompt
function buildMusicPrompt(description, genre, mood, tempo, vocals, duration, lyrics) {
  let prompt = '';

  // Genre and style
  if (genre) {
    const genreMap = {
      'Pop': 'upbeat pop music',
      'Hip-Hop': 'hip hop beat with bass',
      'Rap': 'rap beat with hard drums',
      'Trap': 'trap music with 808s',
      'Rock': 'rock music with electric guitars',
      'Electronic': 'electronic dance music',
      'R&B': 'smooth r&b with soul',
      'Country': 'country music with acoustic guitar',
      'Jazz': 'jazz with piano and saxophone',
      'Classical': 'classical orchestral music',
      'Reggae': 'reggae with offbeat rhythm',
      'Metal': 'heavy metal with distorted guitars'
    };
    prompt += genreMap[genre] || genre.toLowerCase();
  }

  // Mood/Atmosphere
  if (mood) {
    prompt += `, ${mood.toLowerCase()} mood`;
  }

  // Tempo
  if (tempo) {
    if (tempo.includes('60-80')) prompt += ', slow tempo';
    else if (tempo.includes('80-100')) prompt += ', medium tempo';
    else if (tempo.includes('100-120')) prompt += ', moderate tempo';
    else if (tempo.includes('120-140')) prompt += ', fast tempo';
    else if (tempo.includes('140+')) prompt += ', very fast tempo';
  }

  // Vocals
  if (vocals === 'instrumental') {
    prompt += ', instrumental only no vocals';
  } else if (vocals === 'male') {
    prompt += ', with male vocals';
  } else if (vocals === 'female') {
    prompt += ', with female vocals';
  }

  // Main description
  if (description && description !== prompt) {
    prompt += '. ' + description;
  }

  // Add lyrics context if provided
  if (lyrics) {
    const lyricsPreview = lyrics.substring(0, 200);
    prompt += `. Song about: ${lyricsPreview}`;
  }

  // Production quality
  prompt += ', high quality, professional production, clear mix';

  return prompt;
}
