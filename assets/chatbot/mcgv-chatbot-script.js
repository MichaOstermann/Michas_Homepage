// Code & Beats Chatbot - Speziell für mcgv.de

class CodeBeatsChatbot {
    constructor() {
        this.messagesContainer = document.getElementById('chatbot-messages');
        this.inputField = document.getElementById('chatbot-input');
        this.sendButton = document.getElementById('chatbot-send');
        this.toggleButton = document.getElementById('chatbot-toggle');
        this.closeButton = document.getElementById('chatbot-close');
        this.chatbotContainer = document.getElementById('chatbot-container');
        this.quickReplies = document.querySelectorAll('.quick-reply');

        this.dynamicEntries = [];
        this.feed = null;

        this.initializeEventListeners();
        this.knowledgeBase = this.initializeKnowledgeBase();
        this.loadExternalKnowledge();
    }

    initializeEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        this.toggleButton.addEventListener('click', () => this.toggleChat());
        this.closeButton.addEventListener('click', () => this.toggleChat());

        this.quickReplies.forEach(button => {
            button.addEventListener('click', (e) => {
                const message = e.target.dataset.message;
                this.sendUserMessage(message);
            });
        });
    }

    initializeKnowledgeBase() {
        return {
            'musik_upload': {
                keywords: ['upload', 'hochladen', 'song hochladen', 'neuen song', 'track hochladen', 'audio hochladen', 'mp3 hochladen', 'wav hochladen', 'upload funktioniert nicht', 'fehlermeldung upload', 'auflagen upload'],
                response: '📤 <strong>Song-Upload Schritt für Schritt:</strong><br><br>' +
                    '1️⃣ <strong>Datei wählen:</strong> Unterstützt werden MP3 & WAV bis 40&nbsp;MB.<br>' +
                    '2️⃣ <strong>Kategorie festlegen:</strong> Party, Rapp, Love oder Gemischt – der Track wird direkt in den passenden Ordner &amp; die JSON-Dateien geschrieben.<br>' +
                    '3️⃣ <strong>Duplikate?</strong> Das System prüft Titel + Dateiname und verhindert doppelte Einträge.<br>' +
                    '4️⃣ <strong>Upload abschließen:</strong> Nach erfolgreichem Upload startet automatisch die Cover-Generierung (SVG).<br><br>' +
                    '💡 <em>Tipp:</em> Falls etwas schief geht, nutze den Parameter <code>?selftest=1</code> auf <code>upload.php</code> für eine Diagnose.'
            },
            'cover_generator': {
                keywords: ['cover', 'svg', 'cover generator', 'cover generierung', 'cover neu', 'cover fehlgeschlagen', 'cover aktualisieren', 'cover problem'],
                response: '🖼️ <strong>Cover-Generator Fakten:</strong><br><br>' +
                    '• 33 professionelle SVG-Layouts werden per Hash (Titel + Kategorie) gewählt.<br>' +
                    '• Jede Kategorie hat eigene Farbwelten (Party Cyan/Violett, Rapp Gold/Orange, Love Pink/Orange, Gemischt Violett/Cyan).<br>' +
                    '• Nach dem Upload führt die Weiterleitung <code>?generateCover={songId}</code> die Erstellung aus.<br>' +
                    '• Bei Bedarf kannst du über <code>manage.php?regenerateCover={songId}</code> ein Cover neu erzeugen.<br>' +
                    '• Fehler? Prüfe Schreibrechte von <code>covers/</code> und <code>audio/</code>.'
            },
            'verwaltung_manage': {
                keywords: ['manage', 'verwaltung', 'admin', 'bearbeiten', 'löschen', 'song löschen', 'song bearbeiten', 'kennwort', 'passwort', 'passwort ändern'],
                response: '🔐 <strong>Song-Management:</strong><br><br>' +
                    '• Zugang über <code>manage.php</code> (passwortgeschützt mit Hash + Salt in <code>config/config.php</code>).<br>' +
                    '• Bearbeiten &amp; Löschen funktioniert pro Song inkl. CSRF-Schutz.<br>' +
                    '• Beim Löschen werden Audio, Cover und JSON-Einträge (Kategorie + global) vollständig entfernt.<br>' +
                    '• Passwortwechsel? Neuen Hash generieren und in der Config austauschen.'
            },
            'musik_stats': {
                keywords: ['statistik', 'stats', 'zahlen', 'anzahl songs', 'top rated', 'bewertung', 'ratings', 'firebase'],
                response: '📊 <strong>Musik-Statistiken:</strong><br><br>' +
                    '• Song-Anzahl wird pro Kategorie dynamisch ermittelt.<br>' +
                    '• Top-Bewertungen: Firebase Realtime DB liefert Rating-Score &amp; Vote-Count.<br>' +
                    '• Neueste Uploads werden aus <code>tracks.json</code> sortiert.<br>' +
                    '• Ausgabe erfolgt im Statistik-Dashboard auf der Musik-Seite.'
            },
            'musik_comments': {
                keywords: ['kommentar', 'kommentare', 'feedback', 'comments', 'freigabe', 'moderation'],
                response: '💬 <strong>Kommentar-System:</strong><br><br>' +
                    '• Nutzer können pro Song Feedback hinterlassen.<br>' +
                    '• Die API <code>comments.php</code> speichert Beiträge zunächst als "pending".<br>' +
                    '• Freigabe &amp; Löschung erfolgen im geschützten Bereich <code>comments-manage.php</code>.<br>' +
                    '• Struktur: JSON-Dateien unter <code>data/comments/</code> – sauber getrennt pro Song.'
            },
            'musik_share': {
                keywords: ['teilen', 'share', 'social media', 'link teilen', 'song teilen'],
                response: '📣 <strong>Share-Funktionen:</strong><br><br>' +
                    '• Jeder Track besitzt Share-Buttons für WhatsApp, Telegram, Facebook &amp; X.<br>' +
                    '• Der Button kopiert Titel, Kurzbeschreibung und Direkt-Link (inkl. Kategorie).<br>' +
                    '• Highlighting sorgt dafür, dass der entsprechende Song visuell markiert wird, wenn jemand über einen Share-Link kommt.'
            },
            'rechtliches': {
                keywords: ['impressum', 'rechtliches', 'anbieterkennzeichnung', 'anschrift', 'firma', 'haftung', 'urheberrecht'],
                response: '⚖️ <strong>Rechtliche Angaben:</strong><br><br>' +
                    '• Impressum: <a href="/impressum.html" class="nav-link">mcgv.de/impressum.html</a><br>' +
                    '• Verantwortlich: Michael Ostermann, Lattweg 32, 49377 Vechta.<br>' +
                    '• Es handelt sich um eine private, nicht kommerzielle Internetseite.<br>' +
                    '• Datenschutzhinweise: <a href="/datenschutz.html" class="nav-link">mcgv.de/datenschutz.html</a>.'
            },
            'cookies': {
                keywords: ['cookie', 'cookies', 'cookie banner', 'cookie einstellungen', 'cookie consent'],
                response: '🍪 <strong>Cookie-Hinweise:</strong><br><br>' +
                    '• Notwendige Cookies: Speicherung deiner Entscheidung im Local Storage.<br>' +
                    '• Optionale Analytics: werden nur nach expliziter Zustimmung gesetzt.<br>' +
                    '• Du kannst jederzeit über den Footer-Button "Cookie-Einstellungen" widerrufen.'
            },
            'support': {
                keywords: ['hilfe kontakt', 'support', 'problem', 'bug', 'störung', 'kontakt support', 'frage stellen', 'wie kontakt'],
                response: '🆘 <strong>Direktkontakt:</strong><br><br>' +
                    '• Schreib eine Mail an <a href="mailto:support@mcgv.de" class="nav-link">support@mcgv.de</a>.<br>' +
                    '• Oder nutze das Formular unter <a href="/kontakt.html" class="nav-link">mcgv.de/kontakt.html</a> – wir melden uns innerhalb von 24&nbsp;Stunden.<br>' +
                    '• Für dringende technische Fragen hilft auch ein Blick in die Selbsttests (z.&nbsp;B. <code>upload.php?selftest=1</code>).'
            },
            'musik': {
                keywords: ['musik', 'music', 'track', 'tracks', 'song', 'songs', 'synthwave', 'ballermann', 'audio', 'sound', 'beat', 'beats', 'download musik', 'neon', 'atmos', 'sounddesign', 'hören', 'anhören', 'höre', 'abspielen', 'lieder', 'welche lieder', 'liste', 'song liste', 'tracklist'],
                response: '🎵 <strong>Verfügbare Songs (Auswahl):</strong><br><br>' +
                    '<strong>🎉 Party:</strong><br>' +
                    '• Life am Strand – Ballermann Hit über Micha den Barkeeper<br>' +
                    '• Keiner hat noch Geld – Gesellschaftskritischer Party-Track<br><br>' +
                    '<strong>🎤 Rapp:</strong><br>' +
                    '• Aus dem Schatten – Dunkler Synthwave mit treibendem Beat<br>' +
                    '• Kein Lied für Helden – Kraftvoller Rocksong mit Message<br><br>' +
                    '<strong>❤️ Love:</strong><br>' +
                    '• Love 2025 – Moderne Liebesballade mit elektronischen Elementen<br>' +
                    '• Jam und Krabbe – Für Freunde von Freunden<br><br>' +
                    '<strong>🔀 Gemischt:</strong><br>' +
                    '• 20 Jahre RDMC Oldenburg – Fetziger Rock Song<br>' +
                    '• Mein kleiner König – Emotionale Ballade<br>' +
                    '• Die Nacht zählt mit uns – Nächtlicher Synthwave-Track<br><br>' +
                    '📍 Alle Tracks unter <a href="/Musik/index.html" class="nav-link">Musik</a> – Anhören, Bewerten & Download!'
            },
            'powershell': {
                keywords: ['powershell', 'ps', 'script', 'scripts', 'skript', 'skripte', 'ps1', 'code', 'codes', 'admin', 'automation', 'automatisierung', 'download script', 'tool', 'tools'],
                response: '⚡ <strong>PowerShell-Suite:</strong><br><br>' +
                    '• <strong>MailStore Analyse</strong> – Auswertung großer PST/Archive.<br>' +
                    '• <strong>WSUS Scan</strong> – Compliance-Check für Windows Updates.<br>' +
                    '• <strong>AD User Creation Tool v4.0</strong> – Schnellanlage inkl. Templates.<br>' +
                    '• Plus weitere Admin-Snippets im Blog dokumentiert.<br><br>' +
                    'Alle Scripte gibt es signiert als <code>.ps1</code>-Download.'
            },
            'gaming': {
                keywords: ['gaming', 'game', 'games', 'spiel', 'spiele', 'zocken', 'zockst', 'diablo', 'ark', 'enshrouded', 'soulmask', 'build', 'builds', 'guide', 'guides', 'stats', 'statistik', 'boss', 'bosse', 'survival', 'rpg', 'video', 'videos', 'gameplay'],
                response: '🎮 <strong>Featured Games:</strong><br><br>' +
                    '• Diablo IV – 6 Builds, Boss-Guides, Season-Setups.<br>' +
                    '• Enshrouded – Basen, Klassen &amp; Crafting-Tipps.<br>' +
                    '• Soulmask – Stamm-Strategien &amp; Maskenfortschritt.<br>' +
                    '• ARK – 180+ Dinos, Boss-Routen, Breeding-Infos.<br><br>' +
                    'Jede Seite enthält Videos, Stats und direkte Tipps.'
            },
            'michael': {
                keywords: ['michael', 'ostermann', 'über', 'about', 'wer', 'who', 'du', 'dich', 'creator', 'autor', 'entwickler', 'macher', 'ersteller'],
                response: '👤 <strong>Über Michael Ostermann:</strong><br><br>' +
                    '• PowerShell by Day, Synthwave by Night.<br>' +
                    '• 2.100+ Spielstunden in 4 Lieblings-Games.<br>' +
                    '• Produziert Musik &amp; entwickelt eigene Tools.<br><br>' +
                    'Code &amp; Beats verbindet Musik, Code und Gaming in einem Projekt.'
            },
            'blog': {
                keywords: ['blog', 'artikel', 'news', 'update', 'updates', 'beitrag', 'beiträge', 'neuigkeiten', 'neu', 'neues', 'alien', 'hero', 'gaming sektion', 'musik relaunch', 'was gibt es neues', 'was gibts neues', 'was ist neu'],
                response: '📝 <strong>Frische Artikel:</strong><br><br>' +
                    '• <strong>Musik-Sektion neu aufgebaut</strong> – Upload, Cover, Bewertungen &amp; SEO.<br>' +
                    '• <strong>Gaming-Sektion massiv erweitert</strong> – Vier Game-Hubs mit Builds.<br>' +
                    '• <strong>Alien Bio-Tech Hero-Sektion</strong> – Making-of der Startseite.<br>' +
                    '• <strong>Chatbot-Integration</strong> – Self-hosted KI ohne externe APIs.<br><br>' +
                    'Alles zu finden unter <a href="/blog/index.html" class="nav-link">mcgv.de/blog</a>.'
            },
            'download': {
                keywords: ['download', 'herunterladen', 'runterladen', 'speichern', 'mp3', 'wav', 'mp3 download', 'wav download'],
                response: '📥 <strong>Download-Infos:</strong><br><br>' +
                    '• Tracks stehen als MP3 &amp; WAV zur Verfügung – Buttons direkt auf jeder Karte.<br>' +
                    '• Scripte findest du im PowerShell-Bereich als <code>.ps1</code>-Dateien.<br>' +
                    '• Covers werden als SVG generiert und können heruntergeladen werden.'
            },
            'kontakt': {
                keywords: ['kontakt', 'contact', 'email', 'mail', 'nachricht', 'anfrage', 'erreichen', 'kontaktformular'],
                response: '📬 <strong>Kontaktmöglichkeiten:</strong><br><br>' +
                    '• E-Mail: <a href="mailto:support@mcgv.de" class="nav-link">support@mcgv.de</a><br>' +
                    '• Formular: <a href="/kontakt.html" class="nav-link">mcgv.de/kontakt.html</a><br>' +
                    '• Rückmeldung erfolgt in der Regel innerhalb von 24 Stunden.'
            },
            'hilfe': {
                keywords: ['hilfe', 'help', 'frage', 'fragen', 'was kannst du', 'funktionen', 'können', 'kannst', 'zeig', 'zeige', 'hilfe bitte'],
                response: '💡 <strong>Frag mich nach:</strong><br><br>' +
                    '• Musik – Uploads, Cover, Kommentare, Bewertungen.<br>' +
                    '• PowerShell – Tools, Downloads, Blog-Guides.<br>' +
                    '• Gaming – Builds, Videos, Statistiken.<br>' +
                    '• Rechtliches &amp; Support – Impressum, Cookies, Kontakt.<br><br>' +
                    'Schreib einfach dein Thema, ich filtere die passenden Infos heraus!'
            },
            'codebeats': {
                keywords: ['code beats', 'codebeats', 'code & beats', 'website', 'seite', 'homepage', 'worum geht', 'plattform'],
                response: '🚀 <strong>Code & Beats auf einen Blick:</strong><br><br>' +
                    '• Musik: Eigene Releases mit Bewertungen &amp; SVG-Covern.<br>' +
                    '• PowerShell: Admin-Skripte inkl. Tutorials.<br>' +
                    '• Gaming: Builds, Stats &amp; Videos zu Lieblings-Games.<br>' +
                    '• Blog: Making-of, Tutorials und Projekt-Updates.'
            }
        };
    }

    loadExternalKnowledge() {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        fetch(`/assets/knowledge/chatbot-feed.json?nocache=${Date.now()}`, {
            cache: 'no-store',
            signal: controller.signal
        })
            .then((res) => {
                clearTimeout(timeout);
                if (!res.ok) throw new Error(`Feed HTTP ${res.status}`);
                return res.json();
            })
            .then((data) => {
                this.feed = data;
                this.mergeDynamicKnowledge(data);
                console.info('💾 Chatbot-Feed geladen:', data.lastUpdate);
            })
            .catch((err) => {
                console.warn('⚠️ Chatbot-Feed konnte nicht geladen werden:', err.message);
            });
    }

    mergeDynamicKnowledge(data) {
        if (!data) return;

        // Reset dynamic entries
        this.dynamicEntries = [];

        const formatList = (items) => items.filter(Boolean).join('<br>');

        if (data.musik && Array.isArray(data.musik.tracks)) {
            const tracks = data.musik.tracks;
            const highlightList = formatList(tracks.map(track => `• <strong>${track.title}</strong> (${track.genre}) – ${track.description}`));
            const categories = (data.musik.categories || []).map(cat => `• <strong>${cat.name}</strong> – ${cat.focus}`);
            const categoryList = categories.length ? `<br><br><strong>Kategorien:</strong><br>${formatList(categories)}` : '';
            const production = data.musik.production ? [
                data.musik.production.composition,
                data.musik.production.ai,
                data.musik.production.workflow
            ].filter(Boolean) : [];
            const productionBlock = production.length ? `<strong>Produktion:</strong><br>${formatList(production)}<br><br>` : '';
            const genres = (data.musik.genres || []).map(genre => `• ${genre.name}: ${genre.description}`);
            const genresBlock = genres.length ? `<br><strong>Genres:</strong><br>${formatList(genres)}` : '';
            const footer = data.lastUpdate ? `<br><br><em>Stand: ${new Date(data.lastUpdate).toLocaleDateString('de-DE')}</em>` : '';
            this.knowledgeBase.musik.response = `🎵 <strong>Musik-Highlights:</strong><br><br>${productionBlock}${highlightList || 'Aktuelle Tracks werden bald ergänzt.'}${categoryList}${genresBlock}${footer}`;

            tracks.forEach(track => {
                const keywords = [track.title.toLowerCase()];
                (track.tags || []).forEach(tag => keywords.push(String(tag).toLowerCase()));
                keywords.push(track.id.toLowerCase());
                this.dynamicEntries.push({
                    keywords,
                    response: `🎵 <strong>${track.title}</strong><br>${track.description}<br><br>Genre: ${track.genre}${track.duration ? ` • Dauer: ${track.duration}` : ''}<br>${track.url ? `🔗 <a href="${track.url}" class="nav-link">Direkt zur Kategorie</a><br>` : ''}${track.downloadUrl ? `⬇️ <a href="${track.downloadUrl}" class="nav-link">Download</a>` : ''}`
                });
            });
        }

        if (data.powershell && Array.isArray(data.powershell.scripts)) {
            const scripts = data.powershell.scripts;
            const scriptList = formatList(scripts.map(script => `• <strong>${script.name}</strong> (${script.category}) – ${script.description}${script.verified ? ' ✅' : ''}`));
            const header = data.powershell.headline ? `${data.powershell.headline}<br><br>` : '';
            const summary = data.powershell.summary ? `${data.powershell.summary}<br><br>` : '';
            const focus = (data.powershell.focus || []).length ? `<strong>Schwerpunkte:</strong><br>${formatList(data.powershell.focus)}<br><br>` : '';
            this.knowledgeBase.powershell.response = `⚡ <strong>PowerShell-Suite:</strong><br><br>${header}${summary}${focus}${scriptList}`;

            scripts.forEach(script => {
                const keywords = [script.name.toLowerCase()];
                keywords.push(script.category.toLowerCase());
                this.dynamicEntries.push({
                    keywords,
                    response: `⚡ <strong>${script.name}</strong><br>${script.description}<br>${script.downloadUrl ? `⬇️ <a href="${script.downloadUrl}" class="nav-link">Download als .ps1</a><br>` : ''}${script.verified ? '✅ Produktionsgetestet<br>' : ''}${script.example ? `<pre><code>${script.example}</code></pre>` : ''}`
                });
            });
        }

        if (data.gaming && Array.isArray(data.gaming.games)) {
            const games = data.gaming.games;
            const gameList = formatList(games.map(game => `• <strong>${game.title}</strong> (${game.hours}+ Std.) – ${game.highlight}`));
            const header = data.gaming.focus ? `${data.gaming.focus}<br><br>` : '';
            const summary = data.gaming.summary ? `${data.gaming.summary}<br><br>` : '';
            this.knowledgeBase.gaming.response = `🎮 <strong>Gaming-Hub:</strong><br><br>${header}${summary}${gameList}`;

            games.forEach(game => {
                const keywords = [game.title.toLowerCase()];
                if (game.genre) keywords.push(game.genre.toLowerCase());
                this.dynamicEntries.push({
                    keywords,
                    response: `🎮 <strong>${game.title}</strong><br>${game.description || game.highlight}<br>${game.genre ? `Genre: ${game.genre}<br>` : ''}${game.hours ? `${game.hours}+ Spielstunden<br>` : ''}${game.link ? `🔗 <a href="${game.link}" class="nav-link">Mehr zu ${game.title}</a>` : ''}`
                });
            });
        }

        if (data.blog && Array.isArray(data.blog.posts)) {
            const posts = data.blog.posts;
            const postList = formatList(posts.map(post => `• <strong>${post.title}</strong> (${post.date}) – ${post.summary}`));
            this.knowledgeBase.blog.response = `📝 <strong>Neueste Blogposts:</strong><br><br>${postList}<br><br>Alle Beiträge: <a href="/blog/index.html" class="nav-link">mcgv.de/blog</a>`;

            posts.forEach(post => {
                const keywords = [post.title.toLowerCase(), post.slug.replace('.html', '').toLowerCase()];
                this.dynamicEntries.push({
                    keywords,
                    response: `📝 <strong>${post.title}</strong><br>${post.summary}<br>${post.slug ? `🔗 <a href="/blog/${post.slug}" class="nav-link">Zum Beitrag</a>` : ''}`
                });
            });
        }

        if (Array.isArray(data.faq) && data.faq.length) {
            const faqList = formatList(data.faq.map(item => `• <strong>${item.question}</strong><br>${item.answer}`));
            this.knowledgeBase.faq = {
                keywords: ['faq', 'häufige fragen', 'fragenkatalog', 'fragen', 'antworten'],
                response: `❓ <strong>FAQ</strong><br><br>${faqList}`
            };
        }

        if (data.about) {
            const aboutParts = [];
            if (data.about.summary) {
                aboutParts.push(data.about.summary);
            }
            if (Array.isArray(data.about.hobbies) && data.about.hobbies.length) {
                aboutParts.push(`<strong>Hobbys:</strong><br>${formatList(data.about.hobbies)}`);
            }
            if (data.about.philosophy) {
                aboutParts.push(`<strong>Philosophie:</strong><br>${data.about.philosophy}`);
            }
            if (data.about.contact) {
                const contact = data.about.contact;
                const contactLines = [];
                if (contact.email) contactLines.push(`E-Mail: <a href="mailto:${contact.email}" class="nav-link">${contact.email}</a>`);
                if (contact.responseTime) contactLines.push(contact.responseTime);
                if (contact.form) contactLines.push(`Kontaktformular: <a href="${contact.form}" class="nav-link">${contact.form}</a>`);
                if (contactLines.length) aboutParts.push(`<strong>Kontakt:</strong><br>${formatList(contactLines)}`);
            }
            if (Array.isArray(data.about.links) && data.about.links.length) {
                const links = data.about.links.map(link => `• <a href="${link.url}" class="nav-link" target="_blank" rel="noopener">${link.label}</a>`);
                aboutParts.push(`<strong>Links:</strong><br>${formatList(links)}`);
            }
            this.knowledgeBase.michael.response = `👤 <strong>Über Michael Ostermann:</strong><br><br>${formatList(aboutParts)}`;

            this.dynamicEntries.push({
                keywords: ['michael', 'ostermann', 'wer ist michael', 'über dich', 'betreiber', 'wer steckt dahinter'],
                response: this.knowledgeBase.michael.response
            });
        }
    }

    toggleChat() {
        this.chatbotContainer.classList.toggle('hidden');
        if (!this.chatbotContainer.classList.contains('hidden')) {
            this.inputField.focus();
        }
    }

    sendMessage() {
        const message = this.inputField.value.trim();
        if (message === '') return;

        this.sendUserMessage(message);
        this.inputField.value = '';
    }

    sendUserMessage(message) {
        this.addMessage(message, 'user');

        this.showTypingIndicator();

        setTimeout(() => {
            this.removeTypingIndicator();
            const response = this.getResponse(message);
            this.addMessage(response, 'bot');
        }, 800 + Math.random() * 800);
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.textContent = sender === 'user' ? '👤' : '🎵';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = `<p>${text}</p>`;

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);

        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message';
        typingDiv.id = 'typing-indicator';

        typingDiv.innerHTML = `
            <div class="message-avatar">🎵</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    getResponse(message) {
        const lowerMessage = message.toLowerCase();

        // Begrüßungen
        if (this.matchKeywords(lowerMessage, ['hallo', 'hi', 'hey', 'servus', 'moin', 'grüß', 'tag'])) {
            const greetings = [
                'Hey! 🎵 Bereit für Musik, Code oder Gaming?',
                'Hallo! 👋 Was bringt dich zu Code & Beats?',
                'Hi! ⚡ PowerShell, Synthwave oder Gaming - was darf es sein?',
                'Servus! 🎮 Wie kann ich dir helfen?'
            ];
            return greetings[Math.floor(Math.random() * greetings.length)];
        }

        // Verabschiedung
        if (this.matchKeywords(lowerMessage, ['tschüss', 'bye', 'ciao', 'danke', 'bis dann', 'später'])) {
            return 'Viel Spaß auf mcgv.de! 🚀 Bei Fragen bin ich hier. Stay awesome! ✨';
        }

        // Durchsuche Wissensdatenbank
        for (const entry of this.dynamicEntries) {
            if (this.matchKeywords(lowerMessage, entry.keywords)) {
                return entry.response;
            }
        }

        for (const [category, data] of Object.entries(this.knowledgeBase)) {
            if (this.matchKeywords(lowerMessage, data.keywords)) {
                return data.response;
            }
        }

        // Standard-Antwort mit Persönlichkeit
        const defaultResponses = [
            'Ich konnte nichts Passendes finden. Schreib mir mehr Details oder nutze das Kontaktformular: <a href="/kontakt.html" class="nav-link">mcgv.de/kontakt.html</a>.',
            'Das weiß ich leider nicht genau. 🤖 Hilfreich sind Fragen zu Musik-Uploads, Cover, Admin, Blog oder Support – oder schreib an <a href="mailto:support@mcgv.de" class="nav-link">support@mcgv.de</a>.',
            'Leider habe ich dafür keine Info. Schau doch im Menü vorbei oder melde dich direkt per Mail: <a href="mailto:support@mcgv.de" class="nav-link">support@mcgv.de</a>.'
        ];

        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }

    matchKeywords(message, keywords) {
        return keywords.some(keyword => message.includes(keyword));
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    new CodeBeatsChatbot();
});