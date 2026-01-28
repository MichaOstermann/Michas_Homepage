

// Songwriting KI-Tool – script.js
// WICHTIG: API-Keys NIEMALS im Frontend speichern! Die Kommunikation läuft über /api/generate (Vercel Serverless Function). Keys liegen sicher in .env.

const form = document.getElementById('lyricsForm');
const output = document.getElementById('lyricsOutput');
const copyBtn = document.getElementById('copyBtn');
const copyBtnInline = document.getElementById('copyBtnInline');
const downloadBtn = document.getElementById('downloadBtn');
const generateBtn = document.getElementById('generateBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const progressBar = document.getElementById('progressBar');
const progressBarContainer = document.getElementById('progressBarContainer');

// Provider-Switch: 'openai' oder 'anthropic'
const provider = 'openai'; // oder 'anthropic'

async function generateLyrics(e) {
  e.preventDefault();
  output.textContent = '';
  const buttonText = generateBtn.querySelector('span');
  buttonText.textContent = '✨ Generiere...';
  loadingSpinner.classList.remove('hidden');
  generateBtn.disabled = true;
  progressBarContainer.classList.remove('hidden');
  progressBar.style.width = '0%';

  // Nutzereingaben sammeln
  const language = document.getElementById('language').value;
  const genre = document.getElementById('genre').value;
  const mood = document.getElementById('mood').value;
  const theme = document.getElementById('theme').value;
  const structure = document.getElementById('structure').value;
  const rhyme = document.getElementById('rhyme').value;
  const artist = document.getElementById('artist').value;

  const isGerman = language === 'de';

  // Ultimate System Prompt mit Premium-Qualität
  const systemPrompt = isGerman ? `
Du bist ein Platin-Songwriter und Musikproduzent. Schreibe einen DEUTSCHEN Songtext im Genre: ${genre} (${mood}), Thema: "${theme}"${artist ? `, im Stil von ${artist}` : ''}.

Songstruktur: Nutze explizit [Intro], [Verse], [Hook/Chorus], [Bridge], [Outro].

REIMSCHEMA: ${rhyme} – ABER nutze SLANT RHYMES (unreine Reime wie Stahl/Fahr, Blick/Schritt, Nacht/macht) statt perfekter Kinderreime. Das klingt moderner und authentischer.
WICHTIG: Achte darauf, dass die Reime zumindest ähnliche Endlaute haben (z.B. -ung/-ung, -cht/-ft). Vermeide zu unsaubere Reime wie "Rüstung/Dunst".

SILBEN & METRUM: 
- Verse: 10-12 Silben pro Zeile (konstanter Flow)
- Bridge: 6-8 Silben (abgehackt, spannungsreich)
- Hook: 8-10 Silben (eingängig)

SCHREIBSTIL "SHOW, DON'T TELL":
❌ NICHT: "Ich bin der King" (behaupten)
✅ SONDERN: "Der Regen perlt an der Lederjacke ab, während die Stadt im Rückspiegel verblasst" (zeigen)
Nutze KONKRETE BILDER, SINNESEINDRÜCKE und SPEZIFISCHE DETAILS statt abstrakte Behauptungen.

METAPHERN-LOGIK:
Achte auf logisch konsistente Metaphern. Beispiele:
❌ NICHT: "fliegt wie ein Fisch" (Fische schwimmen, fliegen nicht)
❌ NICHT: "schwebt wie ein Stein" (Steine fallen, schweben nicht)
✅ SONDERN: "fliegt wie ein Pfeil", "Zeit bleibt kurz stehen", "zieht vorbei wie Rauch"
Metaphern müssen der Realität entsprechen, auch wenn sie poetisch sind.

VERMEIDE KLISCHEES:
❌ NICHT: "Keine Angst vor dem Sturm", "Hör den Motor brüllen", "Wir sind unsterblich"
✅ SONDERN: Spezifische Details (echte Orte, Markennamen, ungewöhnliche Metaphern)

Genre-typische Vokabeln und Slang (z.B. Punchlines bei Trap, Metaphern bei Schlager).
Füge musikalische Regieanweisungen in runden Klammern hinzu, z.B. (Bass setzt aus), (Stimme wird emotionaler), (Beat-Drop).

Die Lyrics müssen für echte Musikproduktionen geeignet sein. Gliedere und markiere die Abschnitte klar.
Gib nur den Songtext im gewünschten Format aus, keine Erklärungen.` : `
IMPORTANT: You MUST write in ENGLISH ONLY. Do NOT use ANY German words or phrases!

You are a platinum songwriter and music producer. Write ENGLISH lyrics in genre: ${genre} (${mood}), theme: "${theme}"${artist ? `, style of ${artist}` : ''}.

LANGUAGE REQUIREMENT: Write EXCLUSIVELY in English. NO German words allowed!

Song Structure: Use explicit [Intro], [Verse], [Hook/Chorus], [Bridge], [Outro].

RHYME SCHEME: ${rhyme} – BUT use SLANT RHYMES (imperfect rhymes like night/side, deep/keep, lost/frost) instead of perfect childish rhymes. This sounds more modern and authentic.
IMPORTANT: Make sure rhymes have at least similar end sounds. Avoid too rough rhymes.

SYLLABLES & METER:
- Verse: 10-12 syllables per line (constant flow)
- Bridge: 6-8 syllables (choppy, suspenseful)
- Hook: 8-10 syllables (catchy)

WRITING STYLE "SHOW, DON'T TELL":
❌ NOT: "I am the king" (claiming)
✅ INSTEAD: "Rain beads off the leather jacket as the city fades in the rearview" (showing)
Use CONCRETE IMAGES, SENSORY IMPRESSIONS and SPECIFIC DETAILS instead of abstract claims.

METAPHOR LOGIC:
Pay attention to logically consistent metaphors. Examples:
❌ NOT: "flies like a fish" (fish swim, don't fly)
❌ NOT: "floats like a stone" (stones fall, don't float)
✅ INSTEAD: "flies like an arrow", "time stands still briefly", "drifts by like smoke"
Metaphors must correspond to reality, even if they are poetic.

AVOID CLICHÉS:
❌ NOT: "No fear of the storm", "Hear the engine roar", "We are immortal"
✅ INSTEAD: Specific details (real places, brand names, unusual metaphors)

Genre-typical vocabulary and slang (e.g. punchlines for trap, metaphors for pop).
Add musical stage directions in parentheses, e.g. (bass drops out), (voice becomes emotional), (beat drop).

The lyrics must be suitable for real music productions. Structure and mark the sections clearly.
REMINDER: Write ONLY in English, NO German!
Output only the lyrics in the desired format, no explanations.`;

  // Streaming-Effekt: Text wird "getippt"
  function streamText(text) {
    output.textContent = '';
    let i = 0;
    let interval = setInterval(() => {
      output.textContent += text[i] || '';
      i++;
      // Fortschritt simulieren
      progressBar.style.width = Math.min(100, (i / text.length) * 100) + '%';
      if (i >= text.length) {
        clearInterval(interval);
        const buttonText = generateBtn.querySelector('span');
        buttonText.textContent = '🎵 Lyrics generieren';
        loadingSpinner.classList.add('hidden');
        progressBar.style.width = '100%';
        setTimeout(() => progressBarContainer.classList.add('hidden'), 600);
        generateBtn.disabled = false;
      }
    }, 12);
  }

  // API-Request an das eigene Backend (Vercel)
  try {
    const response = await fetch('https://michas-homepage-3em5.vercel.app/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ provider, systemPrompt })
    });
    let data;
    try {
      data = await response.json();
    } catch (jsonErr) {
      throw new Error('Ungültige Server-Antwort (kein JSON). Bitte später erneut versuchen.');
    }
    if (!response.ok) {
      throw new Error(data.error || 'Serverfehler');
    }
    streamText(data.lyrics || 'Keine Lyrics generiert.');
  } catch (err) {
    output.textContent = 'Fehler: ' + (err.message || 'Unbekannter Fehler. Bitte API-Key prüfen.');
    loadingSpinner.classList.add('hidden');
    progressBarContainer.classList.add('hidden');
    generateBtn.disabled = false;
  }
}

form.addEventListener('submit', generateLyrics);

// Kopieren-Button (oben)
copyBtn.addEventListener('click', () => {
  const text = output.textContent;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    copyBtn.textContent = 'Kopiert!';
    setTimeout(() => copyBtn.textContent = '📋 Kopieren', 1200);
  });
});

// Zum Song Creator Button
const toSongCreatorBtn = document.getElementById('toSongCreatorBtn');
toSongCreatorBtn.addEventListener('click', () => {
  const text = output.textContent;
  if (!text || text.includes('Keine Lyrics generiert') || text.includes('Fehler:')) {
    alert('Bitte generiere zuerst Lyrics!');
    return;
  }
  // Save lyrics to sessionStorage
  sessionStorage.setItem('generatedLyrics', text);
  // Navigate to song creator
  window.location.href = '../song-creator/';
});

// Kopieren-Button (im Ausgabefenster)
copyBtnInline.addEventListener('click', () => {
  const text = output.textContent;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    copyBtnInline.textContent = 'Kopiert!';
    setTimeout(() => copyBtnInline.textContent = '⧉', 1200);
  });
});

// Download-Button (Export als .txt)
downloadBtn.addEventListener('click', () => {
  const text = output.textContent;
  if (!text) return;
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lyrics-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});
