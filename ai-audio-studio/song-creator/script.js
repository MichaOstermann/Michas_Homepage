document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('songForm');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const statusText = document.getElementById('statusText');
    const audioPlayer = document.getElementById('audioPlayer');
    const progressBarContainer = document.getElementById('progressBarContainer');
    const progressBar = document.getElementById('progressBar');
    const lyricsImportGroup = document.getElementById('lyricsImportGroup');
    const importedLyrics = document.getElementById('importedLyrics');
    const clearLyricsBtn = document.getElementById('clearLyricsBtn');

    let currentAudioURL = null;

    // Download Button disabled by default
    downloadBtn.disabled = true;
    downloadBtn.style.opacity = '0.5';
    downloadBtn.style.cursor = 'not-allowed';

    // Check for imported lyrics from Lyrics Generator
    const savedLyrics = sessionStorage.getItem('generatedLyrics');
    if (savedLyrics) {
        importedLyrics.value = savedLyrics;
        lyricsImportGroup.style.display = 'block';
        // Scroll to lyrics
        setTimeout(() => {
            lyricsImportGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    }

    // Clear lyrics button
    if (clearLyricsBtn) {
        clearLyricsBtn.addEventListener('click', () => {
            sessionStorage.removeItem('generatedLyrics');
            lyricsImportGroup.style.display = 'none';
            importedLyrics.value = '';
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form values
        const description = document.getElementById('description').value.trim();
        const genre = document.getElementById('genre').value;
        const mood = document.getElementById('mood').value;
        const tempo = document.getElementById('tempo').value;
        const vocals = document.getElementById('vocals').value;
        const duration = document.getElementById('duration').value;

        if (!description) {
            statusText.textContent = '❌ Bitte gib eine Song-Beschreibung ein!';
            statusText.style.color = '#ff4444';
            return;
        }

        // UI Updates - Loading State
        generateBtn.disabled = true;
        generateBtn.style.opacity = '0.5';
        generateBtn.style.cursor = 'not-allowed';
        loadingSpinner.classList.remove('hidden');
        statusText.textContent = '🎵 Generiere deinen Song... Dies kann 1-2 Minuten dauern.';
        statusText.style.color = '#06FFF0';
        audioPlayer.style.display = 'none';
        
        // Show progress bar
        progressBarContainer.classList.remove('hidden');
        progressBar.style.width = '20%';

        try {
            // Build prompt for music generation
            const musicPrompt = buildMusicPrompt(description, genre, mood, tempo, vocals, duration);
            
            // Get lyrics if imported
            const lyrics = importedLyrics ? importedLyrics.value.trim() : null;

            // Call Vercel Music Generation API (Simplified - No Auth Required)
            const response = await fetch('https://michas-homepage-3em5.vercel.app/api/generate-music-simple', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: musicPrompt,
                    description: description,
                    genre: genre,
                    mood: mood,
                    tempo: tempo,
                    vocals: vocals,
                    duration: duration,
                    lyrics: lyrics
                })
            });

            progressBar.style.width = '60%';

            if (!response.ok) {
                let errorMessage = `API Error: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (parseError) {
                    // If JSON parsing fails, try to get text
                    const errorText = await response.text();
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                const rawText = await response.text();
                console.error('Failed to parse response:', rawText);
                throw new Error('Invalid API response. Please try again.');
            }
            
            progressBar.style.width = '100%';

            // Check if audio URL is returned
            if (data.audioUrl) {
                currentAudioURL = data.audioUrl;
                
                // Display audio player
                audioPlayer.src = currentAudioURL;
                audioPlayer.style.display = 'block';
                statusText.innerHTML = `✅ Song erfolgreich generiert! Hör dir dein Meisterwerk an 🎧<br><small style="color:#8B5CF6;font-size:0.9rem;">Provider: ${data.provider || 'AI'}</small>`;
                statusText.style.color = '#06FFF0';

                // Enable download button
                downloadBtn.disabled = false;
                downloadBtn.style.opacity = '1';
                downloadBtn.style.cursor = 'pointer';

            } else {
                throw new Error('Keine Audio-URL in der API-Antwort gefunden');
            }

        } catch (error) {
            console.error('Error generating song:', error);
            statusText.textContent = `❌ Fehler bei der Song-Generierung: ${error.message}`;
            statusText.style.color = '#ff4444';
            audioPlayer.style.display = 'none';
        } finally {
            // Reset UI
            generateBtn.disabled = false;
            generateBtn.style.opacity = '1';
            generateBtn.style.cursor = 'pointer';
            loadingSpinner.classList.add('hidden');
            
            // Hide progress bar after a delay
            setTimeout(() => {
                progressBarContainer.classList.add('hidden');
                progressBar.style.width = '0%';
            }, 2000);
        }
    });

    // Download Button Handler
    downloadBtn.addEventListener('click', async () => {
        if (!currentAudioURL) {
            alert('Kein Song zum Download verfügbar!');
            return;
        }

        try {
            const response = await fetch(currentAudioURL);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `song_${Date.now()}.mp3`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download error:', error);
            alert('Fehler beim Download. Versuche es erneut.');
        }
    });

    // Build music generation prompt
    function buildMusicPrompt(description, genre, mood, tempo, vocals, duration) {
        let prompt = `Create a ${genre} song with a ${mood.toLowerCase()} mood. `;
        prompt += `Description: ${description}. `;
        prompt += `Tempo: ${tempo} BPM. `;
        
        if (vocals === 'male') {
            prompt += `Include male vocals. `;
        } else if (vocals === 'female') {
            prompt += `Include female vocals. `;
        } else {
            prompt += `Instrumental only, no vocals. `;
        }
        
        if (duration === 'short') {
            prompt += `Duration: approximately 2 minutes. `;
        } else if (duration === 'medium') {
            prompt += `Duration: approximately 3 minutes. `;
        } else {
            prompt += `Duration: approximately 4 minutes. `;
        }

        prompt += `High production quality, studio mix.`;
        
        return prompt;
    }

    // Navigation Toggle (Mobile)
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
        });
    }
});
