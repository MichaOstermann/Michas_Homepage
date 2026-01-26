// Werder Bremen Template - JavaScript

// API Base URL - Lädt aus CMS wenn verfügbar, sonst Demo-Daten
const API_BASE_CMS = './cms/api';
const API_BASE_DEMO = './api';

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== PARALLAX SCROLL EFFEKT =====
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.hero, .hero-badge');
    
    parallaxElements.forEach(el => {
        const speed = el.classList.contains('hero-badge') ? 0.3 : 0.5;
        el.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// ===== MOUSE CURSOR EFFEKT =====
let cursorGlow = null;

function initCursorGlow() {
    cursorGlow = document.createElement('div');
    cursorGlow.style.cssText = `
        position: fixed;
        width: 400px;
        height: 400px;
        background: radial-gradient(circle, rgba(29, 154, 80, 0.15) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        transition: opacity 0.3s ease;
        opacity: 0;
    `;
    document.body.appendChild(cursorGlow);
    
    document.addEventListener('mousemove', (e) => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
        cursorGlow.style.opacity = '1';
    });
    
    document.addEventListener('mouseleave', () => {
        cursorGlow.style.opacity = '0';
    });
}

// ===== BUTTON RIPPLE EFFEKT =====
function initButtonRipple() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                top: ${y}px;
                left: ${x}px;
                width: 0;
                height: 0;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: translate(-50%, -50%);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// Ripple Animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            width: 300px;
            height: 300px;
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===== 1. RAUTEN-HINTERGRUND =====
function initRautenCanvas() {
    const canvas = document.getElementById('rautenCanvas');
    const ctx = canvas.getContext('2d');
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drawRauten();
    }
    
    function drawRauten() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const size = 40;
        const rows = Math.ceil(canvas.height / size);
        const cols = Math.ceil(canvas.width / size);
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * size + (row % 2) * (size / 2);
                const y = row * size;
                
                ctx.save();
                ctx.translate(x + size / 2, y + size / 2);
                ctx.rotate(45 * Math.PI / 180);
                
                ctx.strokeStyle = 'rgba(29, 154, 80, 0.3)';
                ctx.lineWidth = 1;
                ctx.strokeRect(-size / 4, -size / 4, size / 2, size / 2);
                
                ctx.restore();
            }
        }
    }
    
    window.addEventListener('resize', resize);
    resize();
}

// ===== 2. FLOATING FOOTBALLS =====
function initFloatingFootballs() {
    const container = document.querySelector('.footballs-container');
    const count = 8;
    
    for (let i = 0; i < count; i++) {
        const football = document.createElement('div');
        football.className = 'football';
        football.style.left = Math.random() * 100 + '%';
        football.style.animationDelay = Math.random() * 20 + 's';
        football.style.animationDuration = (15 + Math.random() * 10) + 's';
        container.appendChild(football);
    }
}

// ===== SCROLL REVEAL ANIMATION =====
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.stat-card, .player-card, .match-item, .gallery-item, .video-item, .news-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        observer.observe(el);
    });
}

// ===== 3. STATS COUNTER =====
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateValue(entry.target, 0, target, 2000);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => observer.observe(stat));
}

function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString('de-DE');
    }, 16);
}

// ===== 4. SPIELPLAN LADEN - MIT CMS SUPPORT =====
async function loadSpielplan() {
    try {
        // Versuche ZUERST aus CMS zu laden
        const cmsResponse = await fetch(`${API_BASE_CMS}/spielplan.php?action=get`);
        if (cmsResponse.ok) {
            const data = await cmsResponse.json();
            console.log('✅ Spielplan aus CMS geladen');
            displaySpielplan(data);
            return;
        }
    } catch (error) {
        console.log('CMS nicht verfügbar, versuche Demo-Daten...');
    }
    
    // Fallback: Demo-JSON
    try {
        const response = await fetch(`${API_BASE_DEMO}/spielplan.json`);
        if (response.ok) {
            const data = await response.json();
            displaySpielplan(data);
            return;
        }
    } catch (error) {
        console.log('Demo-Daten nicht verfügbar');
    }
    
    // Letzter Fallback: Hardcoded Demo
    displayDemoSpielplan();
}

function displayDemoSpielplan() {
    const demoData = [
        { date: '23.11.2025', time: '15:30', home: 'Werder Bremen', away: 'FC Bayern', location: 'Weserstadion' },
        { date: '30.11.2025', time: '18:30', home: 'Borussia Dortmund', away: 'Werder Bremen', location: 'Signal Iduna Park' },
        { date: '07.12.2025', time: '15:30', home: 'Werder Bremen', away: 'RB Leipzig', location: 'Weserstadion' }
    ];
    displaySpielplan(demoData);
}

function displaySpielplan(matches) {
    const container = document.getElementById('spielplan-list');
    if (!container) return;
    
    container.innerHTML = matches.map(match => {
        // Format: Unterstützt beide Formate (home/away oder teams)
        const teamsDisplay = match.teams || `${match.home} <span class="match-separator">vs</span> ${match.away}`;
        const dateDisplay = match.date ? new Date(match.date).toLocaleDateString('de-DE') : match.date;
        
        return `
            <div class="match-item">
                <div class="match-date">${dateDisplay}</div>
                <div class="match-teams">${teamsDisplay}</div>
                <div class="match-info">
                    <span class="match-time">${match.time}${match.time && !match.time.includes('Uhr') ? ' Uhr' : ''}</span>
                    <span class="match-location">${match.location}</span>
                </div>
            </div>
        `;
    }).join('');
}

// ===== 5. GALERIE LADEN - MIT CMS SUPPORT =====
async function loadGalerie() {
    try {
        // Versuche ZUERST aus CMS zu laden
        const cmsResponse = await fetch(`${API_BASE_CMS}/galerie.php?action=get`);
        if (cmsResponse.ok) {
            const data = await cmsResponse.json();
            console.log('✅ Galerie aus CMS geladen');
            displayGalerie(data);
            return;
        }
    } catch (error) {
        console.log('CMS nicht verfügbar, versuche Demo-Daten...');
    }
    
    // Fallback: Demo-JSON
    try {
        const response = await fetch(`${API_BASE_DEMO}/galerie.json`);
        if (response.ok) {
            const data = await response.json();
            displayGalerie(data);
            return;
        }
    } catch (error) {
        console.log('Demo-Daten nicht verfügbar');
    }
    
    // Letzter Fallback: Hardcoded Demo
    displayDemoGalerie();
}

function displayDemoGalerie() {
    const demoData = [
        { url: 'https://via.placeholder.com/400x300/1D9A50/FFFFFF?text=Training', title: 'Training' },
        { url: 'https://via.placeholder.com/400x300/1D9A50/FFFFFF?text=Stadion', title: 'Weserstadion' },
        { url: 'https://via.placeholder.com/400x300/1D9A50/FFFFFF?text=Fans', title: 'Unsere Fans' },
        { url: 'https://via.placeholder.com/400x300/1D9A50/FFFFFF?text=Team', title: 'Mannschaft' },
        { url: 'https://via.placeholder.com/400x300/1D9A50/FFFFFF?text=Sieg', title: 'Derby-Sieg' },
        { url: 'https://via.placeholder.com/400x300/1D9A50/FFFFFF?text=Jubel', title: 'Torjubel' }
    ];
    displayGalerie(demoData);
}

function displayGalerie(photos) {
    const container = document.getElementById('galerie-grid');
    if (!container) return;
    
    container.innerHTML = photos.map((photo, index) => `
        <div class="gallery-item" onclick="openLightbox(${index})">
            <img src="${photo.url}" alt="${photo.title}" loading="lazy">
            <div class="gallery-overlay">
                <span class="gallery-title">${photo.title}</span>
            </div>
        </div>
    `).join('');
    
    // Store photos globally for lightbox
    window.galeriePhotos = photos;
}

// Lightbox für Galerie
function openLightbox(index) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            <img src="${window.galeriePhotos[index].url}" alt="${window.galeriePhotos[index].title}">
            <div class="lightbox-title">${window.galeriePhotos[index].title}</div>
        </div>
    `;
    document.body.appendChild(lightbox);
    
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) lightbox.remove();
    });
}

// ===== 6. VIDEOS LADEN - MIT CMS SUPPORT =====
async function loadVideos() {
    try {
        // Versuche ZUERST aus CMS zu laden
        const cmsResponse = await fetch(`${API_BASE_CMS}/videos.php?action=get`);
        if (cmsResponse.ok) {
            const data = await cmsResponse.json();
            console.log('✅ Videos aus CMS geladen');
            displayVideos(data);
            return;
        }
    } catch (error) {
        console.log('CMS nicht verfügbar, versuche Demo-Daten...');
    }
    
    // Fallback: Demo-JSON
    try {
        const response = await fetch(`${API_BASE_DEMO}/videos.json`);
        if (response.ok) {
            const data = await response.json();
            displayVideos(data);
            return;
        }
    } catch (error) {
        console.log('Demo-Daten nicht verfügbar');
    }
    
    // Letzter Fallback: Hardcoded Demo
    displayDemoVideos();
}

function displayDemoVideos() {
    const demoData = [
        { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', title: 'Highlights letzte Spiel', thumbnail: 'https://via.placeholder.com/400x225/1D9A50/FFFFFF?text=Video+1' },
        { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', title: 'Training der Woche', thumbnail: 'https://via.placeholder.com/400x225/1D9A50/FFFFFF?text=Video+2' },
        { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', title: 'Interview Trainer', thumbnail: 'https://via.placeholder.com/400x225/1D9A50/FFFFFF?text=Video+3' }
    ];
    displayVideos(demoData);
}

function displayVideos(videos) {
    const container = document.getElementById('videos-grid');
    if (!container) return;
    
    container.innerHTML = videos.map((video, index) => `
        <div class="video-item" onclick="playVideo('${video.url}', ${index})">
            <div class="video-thumbnail" style="background-image: url('${video.thumbnail}')">
                <div class="video-play-btn">▶</div>
            </div>
            <div class="video-title">${video.title}</div>
        </div>
    `).join('');
}

function playVideo(url, index) {
    const modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.innerHTML = `
        <div class="video-modal-content">
            <button class="video-modal-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            <iframe src="${url}?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// ===== 7. STATS LADEN - MIT CMS SUPPORT =====
async function loadStats() {
    try {
        const cmsResponse = await fetch(`${API_BASE_CMS}/stats.php?action=get`);
        if (cmsResponse.ok) {
            const data = await cmsResponse.json();
            console.log('✅ Stats aus CMS geladen');
            updateStatsDisplay(data);
            return;
        }
    } catch (error) {
        console.log('Stats aus CMS nicht verfügbar - Standard-Werte bleiben');
    }
}

function updateStatsDisplay(stats) {
    const statCards = document.querySelectorAll('.stat-card');
    stats.forEach((stat, index) => {
        if (statCards[index]) {
            const numberEl = statCards[index].querySelector('.stat-number');
            const labelEl = statCards[index].querySelector('.stat-label');
            if (numberEl && labelEl) {
                numberEl.setAttribute('data-target', stat.number);
                labelEl.textContent = stat.label;
            }
        }
    });
}

// ===== 8. COMMUNITY LADEN - MIT CMS SUPPORT =====
async function loadCommunity() {
    try {
        const cmsResponse = await fetch(`${API_BASE_CMS}/community.php?action=get`);
        if (cmsResponse.ok) {
            const data = await cmsResponse.json();
            console.log('✅ Community aus CMS geladen');
            updateCommunityDisplay(data);
            return;
        }
    } catch (error) {
        console.log('Community aus CMS nicht verfügbar - Standard-Werte bleiben');
    }
}

function updateCommunityDisplay(members) {
    const teamGrid = document.querySelector('.team-grid');
    if (!teamGrid) return;
    
    teamGrid.innerHTML = members.map((member, index) => `
        <div class="player-card">
            <div class="player-number">👤</div>
            <div class="player-image" ${member.image ? `style="background-image: url('${member.image}')"` : ''}></div>
            <h3 class="player-name">${member.name}</h3>
            <p class="player-position">${member.since}</p>
        </div>
    `).join('');
}

// ===== 9. EVENTS LADEN - MIT CMS SUPPORT =====
async function loadEvents() {
    try {
        const cmsResponse = await fetch(`${API_BASE_CMS}/events.php?action=get`);
        if (cmsResponse.ok) {
            const data = await cmsResponse.json();
            console.log('✅ Events aus CMS geladen');
            updateEventsDisplay(data);
            return;
        }
    } catch (error) {
        console.log('Events aus CMS nicht verfügbar - Standard-Werte bleiben');
    }
}

function updateEventsDisplay(event) {
    const matchCard = document.querySelector('.match-card');
    if (!matchCard || !event.title) return;
    
    const dateEl = matchCard.querySelector('.match-time');
    const scoreEl = matchCard.querySelector('.match-score');
    const locationEl = matchCard.querySelector('.match-location');
    const titleEl = matchCard.querySelector('.match-team h3');
    
    if (dateEl && event.date) dateEl.textContent = new Date(event.date).toLocaleDateString('de-DE');
    if (scoreEl && event.time) scoreEl.textContent = event.time + ' Uhr';
    if (locationEl && event.location) locationEl.textContent = event.location;
    if (titleEl && event.title) titleEl.textContent = event.title;
}

// ===== 10. STORIES LADEN - MIT CMS SUPPORT =====
async function loadStories() {
    try {
        const cmsResponse = await fetch(`${API_BASE_CMS}/stories.php?action=get`);
        if (cmsResponse.ok) {
            const data = await cmsResponse.json();
            console.log('✅ Stories aus CMS geladen');
            updateStoriesDisplay(data);
            return;
        }
    } catch (error) {
        console.log('Stories aus CMS nicht verfügbar - Standard-Werte bleiben');
    }
}

function updateStoriesDisplay(stories) {
    const newsGrid = document.querySelector('.news-grid');
    if (!newsGrid) return;
    
    newsGrid.innerHTML = stories.map(story => `
        <div class="news-card">
            <div class="news-badge">${story.badge || 'Story'}</div>
            <h3 class="news-title">${story.title}</h3>
            <p class="news-excerpt">${story.content}</p>
            <a href="#" class="news-link">Weiterlesen →</a>
        </div>
    `).join('');
}

// ===== INITIALISIERUNG =====
document.addEventListener('DOMContentLoaded', () => {
    initRautenCanvas();
    initFloatingFootballs();
    initScrollReveal();
    initCursorGlow();
    initButtonRipple();
    
    // Lade Stats und animiere dann
    loadStats().then(() => animateStats());
    
    // Lade alle Content-Bereiche aus CMS
    loadCommunity();
    loadEvents();
    loadSpielplan();
    loadGalerie();
    loadVideos();
    loadStories();
});

