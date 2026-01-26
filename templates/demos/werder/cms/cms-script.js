// Werder CMS JavaScript

const API_BASE = './api';

// Tab Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = item.getAttribute('data-tab');
        switchTab(tab);
    });
});

function switchTab(tabName) {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    
    // Load tab content
    switch(tabName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'users':
            loadUsers();
            break;
        case 'spielplan':
            loadSpielplanTab();
            break;
        case 'galerie':
            loadGalerieTab();
            break;
        case 'videos':
            loadVideosTab();
            break;
    }
}

// ===== DASHBOARD =====
async function loadDashboard() {
    try {
        const stats = await fetch(`${API_BASE}/stats.php`).then(r => r.json());
        document.getElementById('stat-games').textContent = stats.games || 0;
        document.getElementById('stat-photos').textContent = stats.photos || 0;
        document.getElementById('stat-videos').textContent = stats.videos || 0;
        if (document.getElementById('stat-users')) {
            document.getElementById('stat-users').textContent = stats.users || 0;
        }
    } catch (error) {
        console.error('Fehler beim Laden der Statistiken:', error);
    }
}

// ===== BENUTZERVERWALTUNG (nur Admin) =====
async function loadUsers() {
    const container = document.getElementById('users');
    container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Lade Benutzer...</p></div>';
    
    try {
        const users = await fetch(`${API_BASE}/users.php`).then(r => r.json());
        
        let html = `
            <h2>Benutzerverwaltung</h2>
            <button class="btn btn-primary" onclick="showCreateUserModal()">+ Neuen Benutzer erstellen</button>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Benutzername</th>
                            <th>E-Mail</th>
                            <th>Status</th>
                            <th>Erstellt</th>
                            <th>Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        for (const [username, user] of Object.entries(users)) {
            const badge = user.approved ? 
                '<span class="badge badge-success">✓ Freigegeben</span>' :
                '<span class="badge badge-warning">⏳ Wartet auf Freigabe</span>';
            
            html += `
                <tr>
                    <td><strong>${escapeHtml(username)}</strong></td>
                    <td>${escapeHtml(user.email)}</td>
                    <td>${badge}</td>
                    <td>${user.created}</td>
                    <td>
                        ${!user.approved ? `<button class="btn btn-success" onclick="approveUser('${escapeHtml(username)}', '${escapeHtml(user.email)}')">Freigeben</button>` : ''}
                        <button class="btn btn-danger" onclick="deleteUser('${escapeHtml(username)}')">Löschen</button>
                    </td>
                </tr>
            `;
        }
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = '<div class="alert alert-error">Fehler beim Laden der Benutzer!</div>';
    }
}

function showCreateUserModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Neuen Benutzer erstellen</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <form id="createUserForm">
                <div class="form-group">
                    <label>Benutzername</label>
                    <input type="text" name="username" required>
                </div>
                <div class="form-group">
                    <label>E-Mail</label>
                    <input type="email" name="email" required>
                </div>
                <div class="form-group">
                    <label>Passwort</label>
                    <input type="password" name="password" required>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" name="approved" checked> Sofort freigeben
                    </label>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Erstellen</button>
                    <button type="button" class="btn" onclick="this.closest('.modal').remove()">Abbrechen</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        try {
            const result = await fetch(`${API_BASE}/users.php`, {
                method: 'POST',
                body: formData
            }).then(r => r.json());
            
            if (result.success) {
                modal.remove();
                showAlert('Benutzer erfolgreich erstellt!', 'success');
                loadUsers();
            } else {
                showAlert(result.error || 'Fehler beim Erstellen!', 'error');
            }
        } catch (error) {
            showAlert('Fehler beim Erstellen!', 'error');
        }
    });
}

async function approveUser(username, email) {
    if (!confirm(`Benutzer "${username}" freigeben?`)) return;
    
    try {
        const formData = new FormData();
        formData.append('action', 'approve');
        formData.append('username', username);
        formData.append('email', email);
        
        const result = await fetch(`${API_BASE}/users.php`, {
            method: 'POST',
            body: formData
        }).then(r => r.json());
        
        if (result.success) {
            showAlert('Benutzer freigegeben und E-Mail versendet!', 'success');
            loadUsers();
        } else {
            showAlert(result.error || 'Fehler!', 'error');
        }
    } catch (error) {
        showAlert('Fehler!', 'error');
    }
}

async function deleteUser(username) {
    if (!confirm(`Benutzer "${username}" wirklich löschen?`)) return;
    
    try {
        const formData = new FormData();
        formData.append('action', 'delete');
        formData.append('username', username);
        
        const result = await fetch(`${API_BASE}/users.php`, {
            method: 'POST',
            body: formData
        }).then(r => r.json());
        
        if (result.success) {
            showAlert('Benutzer gelöscht!', 'success');
            loadUsers();
        }
    } catch (error) {
        showAlert('Fehler!', 'error');
    }
}

// ===== SPIELPLAN =====
async function loadSpielplanTab() {
    const container = document.getElementById('spielplan');
    container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    try {
        const matches = await fetch(`${API_BASE}/spielplan.php`).then(r => r.json());
        
        let html = `
            <h2>Spielplan verwalten</h2>
            <button class="btn btn-primary" onclick="showAddMatchModal()">+ Spiel hinzufügen</button>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Datum</th>
                            <th>Zeit</th>
                            <th>Heim</th>
                            <th>Auswärts</th>
                            <th>Ort</th>
                            <th>Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        matches.forEach((match, index) => {
            html += `
                <tr>
                    <td>${escapeHtml(match.date)}</td>
                    <td>${escapeHtml(match.time)}</td>
                    <td><strong>${escapeHtml(match.home)}</strong></td>
                    <td><strong>${escapeHtml(match.away)}</strong></td>
                    <td>${escapeHtml(match.location)}</td>
                    <td>
                        <button class="btn" onclick="editMatch(${index})">✏️</button>
                        <button class="btn btn-danger" onclick="deleteMatch(${index})">🗑️</button>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table></div>';
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = '<div class="alert alert-error">Fehler beim Laden!</div>';
    }
}

function showAddMatchModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Spiel hinzufügen</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <form id="addMatchForm">
                <div class="form-group">
                    <label>Datum</label>
                    <input type="date" name="date" required>
                </div>
                <div class="form-group">
                    <label>Uhrzeit</label>
                    <input type="time" name="time" required>
                </div>
                <div class="form-group">
                    <label>Heimmannschaft</label>
                    <input type="text" name="home" value="Werder Bremen" required>
                </div>
                <div class="form-group">
                    <label>Auswärtsmannschaft</label>
                    <input type="text" name="away" required>
                </div>
                <div class="form-group">
                    <label>Spielort</label>
                    <input type="text" name="location" value="Weserstadion" required>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Hinzufügen</button>
                    <button type="button" class="btn" onclick="this.closest('.modal').remove()">Abbrechen</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        formData.append('action', 'add');
        
        try {
            const result = await fetch(`${API_BASE}/spielplan.php`, {
                method: 'POST',
                body: formData
            }).then(r => r.json());
            
            if (result.success) {
                modal.remove();
                showAlert('Spiel hinzugefügt!', 'success');
                loadSpielplanTab();
            }
        } catch (error) {
            showAlert('Fehler!', 'error');
        }
    });
}

async function deleteMatch(index) {
    if (!confirm('Spiel wirklich löschen?')) return;
    
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('index', index);
    
    try {
        const result = await fetch(`${API_BASE}/spielplan.php`, {
            method: 'POST',
            body: formData
        }).then(r => r.json());
        
        if (result.success) {
            showAlert('Spiel gelöscht!', 'success');
            loadSpielplanTab();
        }
    } catch (error) {
        showAlert('Fehler!', 'error');
    }
}

// ===== GALERIE =====
async function loadGalerieTab() {
    const container = document.getElementById('galerie');
    container.innerHTML = `
        <h2>Foto-Galerie</h2>
        <div class="upload-area" id="photoUploadArea">
            <div class="upload-icon">📷</div>
            <div class="upload-text">Fotos hochladen</div>
            <div class="upload-subtext">Ziehe Fotos hierher oder klicke zum Auswählen</div>
            <input type="file" id="photoInput" multiple accept="image/*" style="display:none">
        </div>
        <div class="gallery-grid" id="photosGrid">
            <div class="loading"><div class="spinner"></div></div>
        </div>
    `;
    
    const uploadArea = document.getElementById('photoUploadArea');
    const input = document.getElementById('photoInput');
    
    uploadArea.addEventListener('click', () => input.click());
    input.addEventListener('change', (e) => uploadPhotos(e.target.files));
    
    // Drag & Drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        uploadPhotos(e.dataTransfer.files);
    });
    
    loadPhotos();
}

async function uploadPhotos(files) {
    const formData = new FormData();
    for (let file of files) {
        formData.append('photos[]', file);
    }
    
    try {
        const result = await fetch(`${API_BASE}/galerie.php`, {
            method: 'POST',
            body: formData
        }).then(r => r.json());
        
        if (result.success) {
            showAlert(`${files.length} Foto(s) hochgeladen!`, 'success');
            loadPhotos();
        }
    } catch (error) {
        showAlert('Fehler beim Hochladen!', 'error');
    }
}

async function loadPhotos() {
    try {
        const photos = await fetch(`${API_BASE}/galerie.php`).then(r => r.json());
        const grid = document.getElementById('photosGrid');
        
        grid.innerHTML = photos.map((photo, index) => `
            <div class="gallery-item">
                <img src="${photo.url}" alt="${escapeHtml(photo.title)}">
                <div class="gallery-item-overlay">
                    <button class="gallery-item-btn" onclick="deletePhoto(${index})">🗑️</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        document.getElementById('photosGrid').innerHTML = '<div class="alert alert-error">Fehler beim Laden!</div>';
    }
}

async function deletePhoto(index) {
    if (!confirm('Foto wirklich löschen?')) return;
    
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('index', index);
    
    try {
        const result = await fetch(`${API_BASE}/galerie.php`, {
            method: 'POST',
            body: formData
        }).then(r => r.json());
        
        if (result.success) {
            showAlert('Foto gelöscht!', 'success');
            loadPhotos();
        }
    } catch (error) {
        showAlert('Fehler!', 'error');
    }
}

// ===== VIDEOS =====
async function loadVideosTab() {
    const container = document.getElementById('videos');
    container.innerHTML = `
        <h2>Videos</h2>
        <button class="btn btn-primary" onclick="showAddVideoModal()">+ Video hinzufügen</button>
        <div class="gallery-grid" id="videosGrid">
            <div class="loading"><div class="spinner"></div></div>
        </div>
    `;
    
    loadVideos();
}

function showAddVideoModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Video hinzufügen</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <form id="addVideoForm">
                <div class="form-group">
                    <label>Titel</label>
                    <input type="text" name="title" required>
                </div>
                <div class="form-group">
                    <label>YouTube URL (z.B. https://www.youtube.com/watch?v=...)</label>
                    <input type="url" name="url" placeholder="https://www.youtube.com/watch?v=..." required>
                </div>
                <div class="form-group">
                    <label>Thumbnail URL (optional)</label>
                    <input type="url" name="thumbnail">
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Hinzufügen</button>
                    <button type="button" class="btn" onclick="this.closest('.modal').remove()">Abbrechen</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        formData.append('action', 'add');
        
        try {
            const result = await fetch(`${API_BASE}/videos.php`, {
                method: 'POST',
                body: formData
            }).then(r => r.json());
            
            if (result.success) {
                modal.remove();
                showAlert('Video hinzugefügt!', 'success');
                loadVideos();
            }
        } catch (error) {
            showAlert('Fehler!', 'error');
        }
    });
}

async function loadVideos() {
    try {
        const videos = await fetch(`${API_BASE}/videos.php`).then(r => r.json());
        const grid = document.getElementById('videosGrid');
        
        grid.innerHTML = videos.map((video, index) => `
            <div class="gallery-item">
                <img src="${video.thumbnail || 'https://via.placeholder.com/400x225/1D9A50/FFFFFF?text=Video'}" alt="${escapeHtml(video.title)}">
                <div class="gallery-item-overlay">
                    <button class="gallery-item-btn" onclick="deleteVideo(${index})">🗑️</button>
                </div>
                <div style="padding:1rem;background:white;">
                    <strong>${escapeHtml(video.title)}</strong>
                </div>
            </div>
        `).join('');
    } catch (error) {
        document.getElementById('videosGrid').innerHTML = '<div class="alert alert-error">Fehler beim Laden!</div>';
    }
}

async function deleteVideo(index) {
    if (!confirm('Video wirklich löschen?')) return;
    
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('index', index);
    
    try {
        const result = await fetch(`${API_BASE}/videos.php`, {
            method: 'POST',
            body: formData
        }).then(r => r.json());
        
        if (result.success) {
            showAlert('Video gelöscht!', 'success');
            loadVideos();
        }
    } catch (error) {
        showAlert('Fehler!', 'error');
    }
}

// ===== HELPERS =====
function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.position = 'fixed';
    alert.style.top = '2rem';
    alert.style.right = '2rem';
    alert.style.zIndex = '9999';
    alert.style.minWidth = '300px';
    alert.style.animation = 'slideIn 0.3s';
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Init
loadDashboard();



