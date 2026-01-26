// Werder Bremen - Inline CMS System
// Jede Section hat ihr eigenes Mini-CMS

// ===== CMS STATE =====
let cmsState = {
    isLoggedIn: false,
    username: '',
    isAdmin: false,
    editMode: false
};

// ===== LOGIN SYSTEM =====
function initCMSLogin() {
    // Check if already logged in (Session)
    fetch('./cms/api/check-session.php')
        .then(r => r.json())
        .then(data => {
            if (data.loggedIn) {
                cmsState.isLoggedIn = true;
                cmsState.username = data.username;
                cmsState.isAdmin = data.isAdmin;
                showCMSButtons();
            } else {
                // Zeige Login-Button
                showCMSLoginButton();
            }
        })
        .catch(err => console.log('CMS nicht verfügbar'));
}

// ===== LOGIN BUTTON ANZEIGEN =====
function showCMSLoginButton() {
    // Prüfe ob Button schon existiert
    if (document.getElementById('cms-login-trigger')) return;
    
    const loginBtn = document.createElement('button');
    loginBtn.id = 'cms-login-trigger';
    loginBtn.className = 'cms-login-trigger';
    loginBtn.innerHTML = '🔐 CMS Login';
    loginBtn.onclick = showLoginModal;
    
    document.body.appendChild(loginBtn);
}

// ===== LOGIN MODAL =====
function showLoginModal() {
    const modal = document.createElement('div');
    modal.className = 'cms-modal';
    modal.id = 'cms-login-modal';
    
    modal.innerHTML = `
        <div class="cms-modal-content" style="max-width: 400px;">
            <div class="cms-modal-header">
                <h2>🔐 CMS Login</h2>
                <button onclick="closeLoginModal()" class="cms-close-btn">&times;</button>
            </div>
            <div class="cms-modal-body">
                <form id="cms-login-form" onsubmit="handleLogin(event)">
                    <div class="cms-form-group">
                        <label>Benutzername</label>
                        <input type="text" id="cms-username" required placeholder="admin">
                    </div>
                    <div class="cms-form-group">
                        <label>Passwort</label>
                        <input type="password" id="cms-password" required placeholder="••••••••">
                    </div>
                    <div id="login-error" class="cms-login-error" style="display: none;"></div>
                </form>
            </div>
            <div class="cms-modal-footer">
                <button onclick="closeLoginModal()" class="cms-btn-cancel">Abbrechen</button>
                <button onclick="document.getElementById('cms-login-form').requestSubmit()" class="cms-btn-save">🔓 Anmelden</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus auf Username-Feld
    setTimeout(() => document.getElementById('cms-username').focus(), 100);
    
    // Click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeLoginModal();
    });
}

// ===== LOGIN VERARBEITEN =====
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('cms-username').value;
    const password = document.getElementById('cms-password').value;
    const errorDiv = document.getElementById('login-error');
    
    // Zeige Loading
    errorDiv.style.display = 'block';
    errorDiv.style.color = 'var(--werder-gruen)';
    errorDiv.textContent = '⏳ Anmeldung läuft...';
    
    // Sende Login-Request
    fetch('./cms/api/cms-login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            errorDiv.style.color = 'var(--werder-gruen)';
            errorDiv.textContent = '✅ ' + data.message;
            
            // Erfolgreich - Seite neu laden
            setTimeout(() => {
                location.reload();
            }, 500);
        } else {
            errorDiv.style.color = '#FF4444';
            errorDiv.textContent = '❌ ' + data.message;
        }
    })
    .catch(err => {
        errorDiv.style.color = '#FF4444';
        errorDiv.textContent = '❌ Verbindungsfehler!';
    });
}

function closeLoginModal() {
    const modal = document.getElementById('cms-login-modal');
    if (modal) modal.remove();
}

// ===== CMS BUTTONS ANZEIGEN =====
function showCMSButtons() {
    if (!cmsState.isLoggedIn) return;
    
    // Bearbeiten-Buttons zu jeder Section hinzufügen
    const sections = [
        { id: 'stats-section', name: 'Stats', api: 'stats' },
        { id: 'team-section', name: 'Community', api: 'community' },
        { id: 'match-section', name: 'Fan-Treffen', api: 'events' },
        { id: 'spielplan-section', name: 'Events', api: 'spielplan' },
        { id: 'galerie-section', name: 'Galerie', api: 'galerie' },
        { id: 'videos-section', name: 'Videos', api: 'videos' },
        { id: 'news-section', name: 'Stories', api: 'stories' }
    ];
    
    sections.forEach(section => {
        const sectionEl = document.querySelector(`.${section.id}`);
        if (!sectionEl) return;
        
        // Prüfe ob Button schon existiert
        if (sectionEl.querySelector('.cms-edit-btn')) return;
        
        // CMS Button erstellen
        const btn = document.createElement('button');
        btn.className = 'cms-edit-btn';
        btn.innerHTML = '✏️ Bearbeiten';
        btn.onclick = () => openSectionEditor(section);
        
        // Button einfügen (oben rechts in der Section)
        sectionEl.style.position = 'relative';
        sectionEl.insertBefore(btn, sectionEl.firstChild);
    });
    
    // Login-Status anzeigen
    createCMSStatusBar();
}

// ===== CMS STATUS BAR =====
function createCMSStatusBar() {
    if (document.getElementById('cms-status-bar')) return;
    
    const statusBar = document.createElement('div');
    statusBar.id = 'cms-status-bar';
    statusBar.innerHTML = `
        <div class="cms-status-content">
            <span>👤 ${cmsState.username} ${cmsState.isAdmin ? '(Admin)' : ''}</span>
            <button onclick="cmsLogout()" class="cms-logout-btn">Logout</button>
        </div>
    `;
    document.body.appendChild(statusBar);
}

// ===== SECTION EDITOR ÖFFNEN =====
function openSectionEditor(section) {
    // Lade aktuelle Daten
    fetch(`./cms/api/${section.api}.php?action=get`)
        .then(r => r.json())
        .then(data => {
            showEditorModal(section, data);
        })
        .catch(err => {
            alert('Fehler beim Laden der Daten!');
        });
}

// ===== EDITOR MODAL =====
function showEditorModal(section, currentData) {
    // Entferne altes Modal
    const oldModal = document.getElementById('cms-editor-modal');
    if (oldModal) oldModal.remove();
    
    // Erstelle neues Modal
    const modal = document.createElement('div');
    modal.id = 'cms-editor-modal';
    modal.className = 'cms-modal';
    
    let editorContent = '';
    
    // Unterschiedliche Editoren je nach Section
    switch(section.api) {
        case 'stats':
            editorContent = createStatsEditor(currentData);
            break;
        case 'community':
            editorContent = createCommunityEditor(currentData);
            break;
        case 'events':
            editorContent = createEventsEditor(currentData);
            break;
        case 'spielplan':
            editorContent = createSpielplanEditor(currentData);
            break;
        case 'galerie':
            editorContent = createGalerieEditor(currentData);
            break;
        case 'videos':
            editorContent = createVideosEditor(currentData);
            break;
        case 'stories':
            editorContent = createStoriesEditor(currentData);
            break;
    }
    
    modal.innerHTML = `
        <div class="cms-modal-content">
            <div class="cms-modal-header">
                <h2>✏️ ${section.name} bearbeiten</h2>
                <button onclick="closeCMSModal()" class="cms-close-btn">&times;</button>
            </div>
            <div class="cms-modal-body">
                ${editorContent}
            </div>
            <div class="cms-modal-footer">
                <button onclick="closeCMSModal()" class="cms-btn-cancel">Abbrechen</button>
                <button onclick="saveSectionData('${section.api}')" class="cms-btn-save">💾 Speichern</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeCMSModal();
    });
}

// ===== EDITOREN FÜR JEDE SECTION =====

function createStatsEditor(data) {
    const stats = data || [
        { number: 250, label: 'Aktive Mitglieder' },
        { number: 1200, label: 'Hochgeladene Fotos' },
        { number: 85, label: 'Fan-Stories' },
        { number: 42, label: 'Community-Events' }
    ];
    
    return `
        <div class="cms-editor-grid">
            ${stats.map((stat, i) => `
                <div class="cms-stat-item">
                    <label>Stat ${i + 1}</label>
                    <input type="number" id="stat_${i}_number" value="${stat.number}" placeholder="Zahl">
                    <input type="text" id="stat_${i}_label" value="${stat.label}" placeholder="Beschreibung">
                </div>
            `).join('')}
        </div>
    `;
}

function createCommunityEditor(data) {
    const members = data || [];
    
    return `
        <div class="cms-editor-list">
            <button onclick="addCommunityMember()" class="cms-btn-add">➕ Mitglied hinzufügen</button>
            <div id="community-members-list">
                ${members.map((member, i) => `
                    <div class="cms-member-item">
                        <input type="text" id="member_${i}_name" value="${member.name}" placeholder="Name">
                        <input type="text" id="member_${i}_since" value="${member.since}" placeholder="Fan seit">
                        <input type="url" id="member_${i}_image" value="${member.image || ''}" placeholder="Bild-URL">
                        <button onclick="removeMember(${i})">🗑️</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function createEventsEditor(data) {
    return `
        <div class="cms-editor-form">
            <label>Event-Titel</label>
            <input type="text" id="event_title" value="${data?.title || ''}" placeholder="z.B. Public Viewing">
            
            <label>Datum</label>
            <input type="date" id="event_date" value="${data?.date || ''}">
            
            <label>Uhrzeit</label>
            <input type="time" id="event_time" value="${data?.time || ''}">
            
            <label>Ort</label>
            <input type="text" id="event_location" value="${data?.location || ''}" placeholder="z.B. Fan-Stammtisch 'Zur Raute'">
            
            <label>Beschreibung</label>
            <textarea id="event_description" rows="4">${data?.description || ''}</textarea>
        </div>
    `;
}

function createSpielplanEditor(data) {
    const events = data || [];
    
    return `
        <div class="cms-editor-list">
            <button onclick="addSpielplanEvent()" class="cms-btn-add">➕ Spiel hinzufügen</button>
            <div id="spielplan-events-list">
                ${events.map((event, i) => `
                    <div class="cms-event-item">
                        <input type="date" id="spielplan_${i}_date" value="${event.date}" placeholder="Datum">
                        <input type="text" id="spielplan_${i}_teams" value="${event.teams || event.title}" placeholder="Teams">
                        <input type="time" id="spielplan_${i}_time" value="${event.time}" placeholder="Uhrzeit">
                        <input type="text" id="spielplan_${i}_location" value="${event.location}" placeholder="Ort">
                        <button onclick="removeSpielplanEvent(${i})">🗑️</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function createGalerieEditor(data) {
    const photos = data || [];
    
    return `
        <div class="cms-editor-gallery">
            <div class="cms-upload-area">
                <input type="file" id="gallery-upload" multiple accept="image/*">
                <button onclick="uploadGalleryImages()" class="cms-btn-upload">📤 Bilder hochladen</button>
            </div>
            <div class="cms-gallery-grid" id="gallery-images">
                ${photos.map((photo, i) => `
                    <div class="cms-gallery-item">
                        <img src="${photo.url}" alt="${photo.title}">
                        <input type="text" id="photo_${i}_title" value="${photo.title}" placeholder="Titel">
                        <button onclick="removePhoto(${i})">🗑️</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function createVideosEditor(data) {
    const videos = data || [];
    
    return `
        <div class="cms-editor-list">
            <button onclick="addVideo()" class="cms-btn-add">➕ Video hinzufügen</button>
            <div id="videos-list">
                ${videos.map((video, i) => `
                    <div class="cms-video-item">
                        <input type="url" id="video_${i}_url" value="${video.url}" placeholder="YouTube-URL">
                        <input type="text" id="video_${i}_title" value="${video.title}" placeholder="Titel">
                        <button onclick="removeVideo(${i})">🗑️</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function createStoriesEditor(data) {
    const stories = data || [];
    
    return `
        <div class="cms-editor-list">
            <button onclick="addStory()" class="cms-btn-add">➕ Story hinzufügen</button>
            <div id="stories-list">
                ${stories.map((story, i) => `
                    <div class="cms-story-item">
                        <input type="text" id="story_${i}_title" value="${story.title}" placeholder="Titel">
                        <textarea id="story_${i}_content" rows="3">${story.content}</textarea>
                        <input type="text" id="story_${i}_badge" value="${story.badge}" placeholder="Badge (z.B. Story)">
                        <button onclick="removeStory(${i})">🗑️</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ===== SPEICHERN =====
function saveSectionData(api) {
    let data = {};
    
    // Sammle Daten je nach Section
    switch(api) {
        case 'stats':
            data = collectStatsData();
            break;
        case 'community':
            data = collectCommunityData();
            break;
        case 'events':
            data = collectEventsData();
            break;
        case 'spielplan':
            data = collectSpielplanData();
            break;
        case 'galerie':
            data = collectGalerieData();
            break;
        case 'videos':
            data = collectVideosData();
            break;
        case 'stories':
            data = collectStoriesData();
            break;
    }
    
    // Sende an API
    fetch(`./cms/api/${api}.php?action=save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(r => r.json())
    .then(result => {
        if (result.success) {
            alert('✅ Erfolgreich gespeichert!');
            closeCMSModal();
            location.reload(); // Seite neu laden
        } else {
            alert('❌ Fehler beim Speichern!');
        }
    })
    .catch(err => {
        alert('❌ Verbindungsfehler!');
    });
}

// ===== DATEN SAMMELN =====
function collectStatsData() {
    const stats = [];
    for (let i = 0; i < 4; i++) {
        const number = document.getElementById(`stat_${i}_number`)?.value;
        const label = document.getElementById(`stat_${i}_label`)?.value;
        if (number && label) {
            stats.push({ number: parseInt(number), label });
        }
    }
    return stats;
}

function collectCommunityData() {
    const members = [];
    let i = 0;
    while (document.getElementById(`member_${i}_name`)) {
        members.push({
            name: document.getElementById(`member_${i}_name`).value,
            since: document.getElementById(`member_${i}_since`).value,
            image: document.getElementById(`member_${i}_image`).value
        });
        i++;
    }
    return members;
}

function collectEventsData() {
    return {
        title: document.getElementById('event_title')?.value || '',
        date: document.getElementById('event_date')?.value || '',
        time: document.getElementById('event_time')?.value || '',
        location: document.getElementById('event_location')?.value || '',
        description: document.getElementById('event_description')?.value || ''
    };
}

function collectSpielplanData() {
    const events = [];
    let i = 0;
    while (document.getElementById(`spielplan_${i}_date`)) {
        events.push({
            date: document.getElementById(`spielplan_${i}_date`).value,
            teams: document.getElementById(`spielplan_${i}_teams`).value,
            time: document.getElementById(`spielplan_${i}_time`).value,
            location: document.getElementById(`spielplan_${i}_location`).value
        });
        i++;
    }
    return events;
}

function collectGalerieData() {
    const photos = [];
    let i = 0;
    while (document.getElementById(`photo_${i}_title`)) {
        const img = document.querySelectorAll('.cms-gallery-item img')[i];
        photos.push({
            url: img ? img.src : '',
            title: document.getElementById(`photo_${i}_title`).value
        });
        i++;
    }
    return photos;
}

function collectVideosData() {
    const videos = [];
    let i = 0;
    while (document.getElementById(`video_${i}_url`)) {
        videos.push({
            url: document.getElementById(`video_${i}_url`).value,
            title: document.getElementById(`video_${i}_title`).value
        });
        i++;
    }
    return videos;
}

function collectStoriesData() {
    const stories = [];
    let i = 0;
    while (document.getElementById(`story_${i}_title`)) {
        stories.push({
            title: document.getElementById(`story_${i}_title`).value,
            content: document.getElementById(`story_${i}_content`).value,
            badge: document.getElementById(`story_${i}_badge`).value
        });
        i++;
    }
    return stories;
}

// ===== HILFSFUNKTIONEN =====
function closeCMSModal() {
    const modal = document.getElementById('cms-editor-modal');
    if (modal) modal.remove();
}

function cmsLogout() {
    fetch('./cms/api/logout.php')
        .then(() => {
            cmsState.isLoggedIn = false;
            location.reload();
        });
}

// Community Member hinzufügen
function addCommunityMember() {
    const list = document.getElementById('community-members-list');
    const index = list.children.length;
    const item = document.createElement('div');
    item.className = 'cms-member-item';
    item.innerHTML = `
        <input type="text" id="member_${index}_name" placeholder="Name">
        <input type="text" id="member_${index}_since" placeholder="Fan seit">
        <input type="url" id="member_${index}_image" placeholder="Bild-URL">
        <button onclick="removeMember(${index})">🗑️</button>
    `;
    list.appendChild(item);
}

function removeMember(index) {
    const item = document.getElementById(`member_${index}_name`)?.closest('.cms-member-item');
    if (item && confirm('Mitglied wirklich entfernen?')) {
        item.remove();
    }
}

// Event hinzufügen/entfernen
function addEvent() {
    const list = document.getElementById('events-list');
    const index = list.children.length;
    const item = document.createElement('div');
    item.className = 'cms-event-item';
    item.innerHTML = `
        <input type="date" id="event_${index}_date">
        <input type="text" id="event_${index}_title" placeholder="Event-Name">
        <input type="text" id="event_${index}_location" placeholder="Ort">
        <button onclick="removeEvent(${index})">🗑️</button>
    `;
    list.appendChild(item);
}

function removeEvent(index) {
    const item = document.getElementById(`event_${index}_date`)?.closest('.cms-event-item');
    if (item && confirm('Event wirklich entfernen?')) {
        item.remove();
    }
}

// Photo entfernen
function removePhoto(index) {
    const item = document.getElementById(`photo_${index}_title`)?.closest('.cms-gallery-item');
    if (item && confirm('Foto wirklich entfernen?')) {
        item.remove();
    }
}

// Video hinzufügen/entfernen
function addVideo() {
    const list = document.getElementById('videos-list');
    const index = list.children.length;
    const item = document.createElement('div');
    item.className = 'cms-video-item';
    item.innerHTML = `
        <input type="url" id="video_${index}_url" placeholder="YouTube-URL">
        <input type="text" id="video_${index}_title" placeholder="Titel">
        <button onclick="removeVideo(${index})">🗑️</button>
    `;
    list.appendChild(item);
}

function removeVideo(index) {
    const item = document.getElementById(`video_${index}_url`)?.closest('.cms-video-item');
    if (item && confirm('Video wirklich entfernen?')) {
        item.remove();
    }
}

// Story hinzufügen/entfernen
function addStory() {
    const list = document.getElementById('stories-list');
    const index = list.children.length;
    const item = document.createElement('div');
    item.className = 'cms-story-item';
    item.innerHTML = `
        <input type="text" id="story_${index}_title" placeholder="Titel">
        <textarea id="story_${index}_content" rows="3" placeholder="Story-Text..."></textarea>
        <input type="text" id="story_${index}_badge" placeholder="Badge (z.B. Story)">
        <button onclick="removeStory(${index})">🗑️</button>
    `;
    list.appendChild(item);
}

function removeStory(index) {
    const item = document.getElementById(`story_${index}_title`)?.closest('.cms-story-item');
    if (item && confirm('Story wirklich entfernen?')) {
        item.remove();
    }
}

// Galerie Bilder hochladen
function uploadGalleryImages() {
    const input = document.getElementById('gallery-upload');
    const files = input.files;
    
    if (files.length === 0) {
        alert('Bitte wähle Bilder aus!');
        return;
    }
    
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('photos[]', files[i]);
    }
    
    alert('⏳ Upload läuft... (Demo: In Produktion werden Bilder hochgeladen)');
    
    // In Produktion: fetch('./cms/api/upload.php', { method: 'POST', body: formData })
}

// Spielplan Event hinzufügen/entfernen
function addSpielplanEvent() {
    const list = document.getElementById('spielplan-events-list');
    const index = list.children.length;
    const item = document.createElement('div');
    item.className = 'cms-event-item';
    item.innerHTML = `
        <input type="date" id="spielplan_${index}_date" placeholder="Datum">
        <input type="text" id="spielplan_${index}_teams" placeholder="Teams">
        <input type="time" id="spielplan_${index}_time" placeholder="Uhrzeit">
        <input type="text" id="spielplan_${index}_location" placeholder="Ort">
        <button onclick="removeSpielplanEvent(${index})">🗑️</button>
    `;
    list.appendChild(item);
}

function removeSpielplanEvent(index) {
    const item = document.getElementById(`spielplan_${index}_date`)?.closest('.cms-event-item');
    if (item && confirm('Spiel wirklich entfernen?')) {
        item.remove();
    }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    initCMSLogin();
});

