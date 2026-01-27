

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
  const genre = document.getElementById('genre').value;
  const mood = document.getElementById('mood').value;
  const theme = document.getElementById('theme').value;
  const structure = document.getElementById('structure').value;
  const rhyme = document.getElementById('rhyme').value;
  const artist = document.getElementById('artist').value;

  // Ultimate System Prompt mit Premium-Qualität
  const systemPrompt = `
Du bist ein Platin-Songwriter und Musikproduzent. Schreibe einen Songtext im Genre: ${genre} (${mood}), Thema: "${theme}"${artist ? `, im Stil von ${artist}` : ''}.

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

VERMEIDE KLISCHEES:
❌ NICHT: "Keine Angst vor dem Sturm", "Hör den Motor brüllen", "Wir sind unsterblich"
✅ SONDERN: Spezifische Details (echte Orte, Markennamen, ungewöhnliche Metaphern)

Genre-typische Vokabeln und Slang (z.B. Punchlines bei Trap, Metaphern bei Schlager).
Füge musikalische Regieanweisungen in runden Klammern hinzu, z.B. (Bass setzt aus), (Stimme wird emotionaler), (Beat-Drop).

Die Lyrics müssen für echte Musikproduktionen geeignet sein. Gliedere und markiere die Abschnitte klar.
Gib nur den Songtext im gewünschten Format aus, keine Erklärungen.`;

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
    setTimeout(() => copyBtn.textContent = 'Kopieren', 1200);
  });
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
  a.download = 'songtext.txt';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
});
