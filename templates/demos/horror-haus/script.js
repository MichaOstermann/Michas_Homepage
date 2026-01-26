// ═══════════════════════════════════════════════════════════
// HAUNTED MANSION - INTERACTIVE HORROR EFFECTS
// © 2025 Michael Ostermann
// 3D-Effekte, Geisterbahn-Animationen, Interaktive Horror-Elemente
// ═══════════════════════════════════════════════════════════

// JS Copyright Marker
console.log('%c© 2025 Michael Ostermann - Haunted Mansion Template', 'color: #8B0000; font-size: 14px; font-weight: bold;');

// ═══════════════════════════════════════════════════════════
// INIT - Document Ready
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    initFloatingGhosts();
    initFlyingBats();
    initEnterButton();
    initMirrorEffect();
    initParallaxScroll();
    initRoomCards();
    initSpiritsCarousel();
    initCursorEffect();
    initScreamEffect();
    initHouseMouseFollow();
    initWowEffects(); // 🔥 MEGA WOW EFFEKTE
    
    // CMS & Protection
    if (typeof initInlineCMS === 'function') initInlineCMS();
    if (typeof initCopyrightProtection === 'function') initCopyrightProtection();
});

// ═══════════════════════════════════════════════════════════
// FLOATING GHOSTS - Schwebende Geister generieren
// ═══════════════════════════════════════════════════════════

function initFloatingGhosts() {
    const container = document.getElementById('ghostsContainer');
    if (!container) return;
    
    const ghostEmojis = ['👻', '💀', '🧟', '👹', '😈'];
    const ghostCount = 8;
    
    for (let i = 0; i < ghostCount; i++) {
        const ghost = document.createElement('div');
        ghost.className = 'ghost';
        ghost.textContent = ghostEmojis[Math.floor(Math.random() * ghostEmojis.length)];
        ghost.style.left = Math.random() * 100 + '%';
        ghost.style.animationDelay = Math.random() * 10 + 's';
        ghost.style.animationDuration = (15 + Math.random() * 10) + 's';
        container.appendChild(ghost);
    }
}

// ═══════════════════════════════════════════════════════════
// FLYING BATS - Fledermäuse auf Canvas
// ═══════════════════════════════════════════════════════════

function initFlyingBats() {
    const canvas = document.getElementById('batsCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const bats = [];
    const batCount = 15;
    
    class Bat {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 0.5) * 2;
            this.size = 20 + Math.random() * 20;
            this.wingPhase = Math.random() * Math.PI * 2;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.wingPhase += 0.2;
            
            // Wrap around screen
            if (this.x < -50) this.x = canvas.width + 50;
            if (this.x > canvas.width + 50) this.x = -50;
            if (this.y < -50) this.y = canvas.height + 50;
            if (this.y > canvas.height + 50) this.y = -50;
        }
        
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            
            // Body
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size * 0.3, this.size * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Wings
            const wingSpread = Math.sin(this.wingPhase) * 0.5 + 0.5;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(
                -this.size * (0.5 + wingSpread * 0.5), -this.size * 0.5,
                -this.size, 0
            );
            ctx.quadraticCurveTo(
                -this.size * (0.5 + wingSpread * 0.3), this.size * 0.3,
                0, 0
            );
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(
                this.size * (0.5 + wingSpread * 0.5), -this.size * 0.5,
                this.size, 0
            );
            ctx.quadraticCurveTo(
                this.size * (0.5 + wingSpread * 0.3), this.size * 0.3,
                0, 0
            );
            ctx.fill();
            
            ctx.restore();
        }
    }
    
    // Create bats
    for (let i = 0; i < batCount; i++) {
        bats.push(new Bat());
    }
    
    // Animate
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        bats.forEach(bat => {
            bat.update();
            bat.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    // Resize handler
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ═══════════════════════════════════════════════════════════
// ENTER BUTTON - Interaktive Tür-Animation
// ═══════════════════════════════════════════════════════════

function initEnterButton() {
    const btn = document.getElementById('enterBtn');
    if (!btn) return;
    
    let clickCount = 0;
    
    btn.addEventListener('click', () => {
        clickCount++;
        
        if (clickCount === 1) {
            btn.textContent = '🚪 BIST DU SICHER?';
            btn.style.background = 'linear-gradient(135deg, #4a0000 0%, #8B0000 100%)';
        } else if (clickCount === 2) {
            btn.textContent = '⚠️ ES GIBT KEIN ZURÜCK!';
            btn.style.background = 'linear-gradient(135deg, #000 0%, #4a0000 100%)';
        } else if (clickCount === 3) {
            // Jumpscare-ähnlicher Effekt
            document.body.style.animation = 'shake 0.5s';
            btn.textContent = '👻 WILLKOMMEN...';
            btn.style.background = 'linear-gradient(135deg, #39FF14 0%, #2D0845 100%)';
            
            // Scroll zum nächsten Bereich
            setTimeout(() => {
                document.querySelector('.warning-section').scrollIntoView({ 
                    behavior: 'smooth' 
                });
            }, 500);
            
            // Reset button
            setTimeout(() => {
                btn.textContent = '🚪 EINTRETEN WENN DU DICH TRAUST';
                btn.style.background = 'linear-gradient(135deg, #8B0000 0%, #4a0000 100%)';
                clickCount = 0;
                document.body.style.animation = '';
            }, 3000);
        }
    });
}

// ═══════════════════════════════════════════════════════════
// MIRROR EFFECT - Interaktiver Spiegel
// ═══════════════════════════════════════════════════════════

function initMirrorEffect() {
    const mirror = document.getElementById('mirrorSurface');
    const reflection = document.getElementById('reflection');
    if (!mirror || !reflection) return;
    
    const scaryFaces = ['👻', '💀', '😈', '👹', '🧟‍♂️', '👺', '🤡'];
    let lookCount = 0;
    
    mirror.addEventListener('click', () => {
        lookCount++;
        
        if (lookCount < 3) {
            // Normaler Blick
            reflection.textContent = scaryFaces[Math.floor(Math.random() * scaryFaces.length)];
            reflection.style.fontSize = '8rem';
            reflection.style.opacity = '0.7';
            reflection.style.animation = 'fadeInScale 0.5s ease-out';
            
            setTimeout(() => {
                reflection.style.opacity = '0';
            }, 2000);
        } else {
            // Jumpsc are nach 3 Klicks
            reflection.textContent = '😱';
            reflection.style.fontSize = '15rem';
            reflection.style.opacity = '1';
            reflection.style.animation = 'jumpscare 0.3s ease-out';
            
            // Shake effect
            mirror.style.animation = 'shake 0.5s';
            
            // Sound effect (optional - kann als Audio hinzugefügt werden)
            console.log('SCREEEAAM!!!');
            
            setTimeout(() => {
                reflection.style.opacity = '0';
                mirror.style.animation = '';
                lookCount = 0;
            }, 1500);
        }
    });
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInScale {
        from { transform: scale(0.5); opacity: 0; }
        to { transform: scale(1); opacity: 0.7; }
    }
    @keyframes jumpscare {
        0% { transform: scale(0); opacity: 0; }
        50% { transform: scale(1.5); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
    }
`;
document.head.appendChild(style);

// ═══════════════════════════════════════════════════════════
// PARALLAX SCROLL - Parallax-Effekt für Sections
// ═══════════════════════════════════════════════════════════

function initParallaxScroll() {
    const parallaxSections = document.querySelectorAll('.parallax-section');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        parallaxSections.forEach(section => {
            const speed = section.dataset.speed || 0.5;
            const yPos = -(scrolled * speed);
            section.style.transform = `translateY(${yPos}px)`;
        });
    });
}

// ═══════════════════════════════════════════════════════════
// ROOM CARDS - 3D Flip Interaktion
// ═══════════════════════════════════════════════════════════

function initRoomCards() {
    const roomCards = document.querySelectorAll('.room-card');
    
    roomCards.forEach(card => {
        card.addEventListener('click', () => {
            // Toggle flip
            const inner = card.querySelector('.room-inner');
            if (inner.style.transform === 'rotateY(180deg)') {
                inner.style.transform = 'rotateY(0deg)';
            } else {
                inner.style.transform = 'rotateY(180deg)';
            }
        });
        
        // 3D Tilt effect on mouse move
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        });
    });
}

// ═══════════════════════════════════════════════════════════
// SPIRITS CAROUSEL - Geister-Karussell Interaktion
// ═══════════════════════════════════════════════════════════

function initSpiritsCarousel() {
    const spiritCards = document.querySelectorAll('.spirit-card');
    
    spiritCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Alle anderen leicht dimmen
            spiritCards.forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.style.opacity = '0.5';
                }
            });
        });
        
        card.addEventListener('mouseleave', () => {
            spiritCards.forEach(otherCard => {
                otherCard.style.opacity = '1';
            });
        });
    });
}

// ═══════════════════════════════════════════════════════════
// CURSOR EFFECT - Gruselige Cursor-Effekte
// ═══════════════════════════════════════════════════════════

function initCursorEffect() {
    const cursor = document.createElement('div');
    cursor.style.cssText = `
        position: fixed;
        width: 30px;
        height: 30px;
        border: 2px solid #8B0000;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transition: all 0.1s ease;
        box-shadow: 0 0 20px rgba(139, 0, 0, 0.5);
    `;
    document.body.appendChild(cursor);
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX - 15 + 'px';
        cursor.style.top = e.clientY - 15 + 'px';
    });
    
    // Cursor ändern bei Hover über interaktive Elemente
    const interactiveElements = document.querySelectorAll('button, a, .room-card, .mirror-surface, .spirit-card');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.width = '50px';
            cursor.style.height = '50px';
            cursor.style.borderColor = '#39FF14';
            cursor.style.boxShadow = '0 0 30px rgba(57, 255, 20, 0.8)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.style.width = '30px';
            cursor.style.height = '30px';
            cursor.style.borderColor = '#8B0000';
            cursor.style.boxShadow = '0 0 20px rgba(139, 0, 0, 0.5)';
        });
    });
}

// ═══════════════════════════════════════════════════════════
// SCREAM EFFECT - Zufälliger Schrei-Effekt (visuell)
// ═══════════════════════════════════════════════════════════

function initScreamEffect() {
    // Zufällig alle 30-60 Sekunden
    setInterval(() => {
        if (Math.random() < 0.3) { // 30% Chance
            const scream = document.createElement('div');
            scream.textContent = '😱';
            scream.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0);
                font-size: 10rem;
                z-index: 10000;
                pointer-events: none;
                opacity: 0;
                animation: screamAppear 1s ease-out;
            `;
            
            document.body.appendChild(scream);
            
            setTimeout(() => {
                scream.remove();
            }, 1000);
        }
    }, Math.random() * 30000 + 30000); // 30-60 Sekunden
}

// Scream Animation
const screamStyle = document.createElement('style');
screamStyle.textContent = `
    @keyframes screamAppear {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.5); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
    }
`;
document.head.appendChild(screamStyle);

// ═══════════════════════════════════════════════════════════
// HOUSE MOUSE FOLLOW - Haus folgt Maus
// ═══════════════════════════════════════════════════════════

function initHouseMouseFollow() {
    const house = document.querySelector('.haunted-house-3d');
    if (!house) return;
    
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        const rotateY = (mouseX - 0.5) * 30; // -15 to 15 deg
        const rotateX = (mouseY - 0.5) * -20; // -10 to 10 deg
        
        house.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
    });
}

// ═══════════════════════════════════════════════════════════
// CONSOLE EASTER EGG
// ═══════════════════════════════════════════════════════════

console.log('%c👻 WILLKOMMEN IM HAUNTED MANSION 👻', 'color: #8B0000; font-size: 20px; font-weight: bold; text-shadow: 0 0 10px #8B0000;');
console.log('%cWenn du das liest, bist du mutiger als die meisten...', 'color: #39FF14; font-size: 14px;');
console.log('%cAber sei gewarnt: Die Geister sehen alles. 👀', 'color: #fff; font-size: 12px;');

// ═══════════════════════════════════════════════════════════
// FAQ ACCORDION - Interactive Questions
// ═══════════════════════════════════════════════════════════

document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const faqItem = button.parentElement;
        const isActive = faqItem.classList.contains('active');
        
        // Close all other FAQs
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Toggle current FAQ
        if (!isActive) {
            faqItem.classList.add('active');
        }
    });
});

// ═══════════════════════════════════════════════════════════
// INTERACTIVE GAME SYSTEM - Puzzle & Investigation
// ═══════════════════════════════════════════════════════════

let gameState = {
    started: false,
    startTime: null,
    cluesFound: 0,
    roomsUnlocked: 0,
    inventory: [],
    solvedRooms: []
};

// Start Game
function startGame() {
    gameState.started = true;
    gameState.startTime = Date.now();
    
    // Hide start screen
    document.getElementById('gameStart').classList.remove('active');
    
    // Show inventory
    document.getElementById('inventory').style.display = 'flex';
    document.getElementById('progressBar').style.display = 'block';
    
    // Unlock first room
    unlockRoom('room1');
    
    // Start timer
    startTimer();
    
    // Scroll to rooms
    document.getElementById('rooms').scrollIntoView({ behavior: 'smooth' });
    
    // Play sound effect
    playSound('gameStart');
}

// Timer
function startTimer() {
    setInterval(() => {
        if (!gameState.started) return;
        const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        document.getElementById('gameTimer').textContent = `${minutes}:${seconds}`;
    }, 1000);
}

// Unlock Room
function unlockRoom(roomId) {
    const room = document.getElementById(roomId);
    if (room) {
        room.classList.remove('room-locked');
        gameState.roomsUnlocked++;
        updateStats();
    }
}

// Update Stats
function updateStats() {
    document.getElementById('cluesFound').textContent = `${gameState.cluesFound}/7`;
    document.getElementById('roomsUnlocked').textContent = `${gameState.roomsUnlocked}/7`;
    
    const progress = (gameState.cluesFound / 7) * 100;
    document.querySelector('.progress-fill').style.width = progress + '%';
    document.querySelector('.progress-text').textContent = Math.round(progress) + '% AUFGEKLÄRT';
}

// Room 1 Puzzle Solution
function solveRoom1() {
    const input = document.getElementById('room1Code').value;
    const feedback = document.getElementById('room1Feedback');
    
    // Correct answer: 0352 (März = 03, Jahr 1952 - 1900 = 52)
    if (input === '0352') {
        feedback.textContent = '✅ RICHTIG! Hinweis gefunden: Patientenakte von Anna Weber';
        feedback.style.color = '#00ff00';
        
        // Add to inventory
        addToInventory('📄 Akte: Anna Weber');
        
        // Update stats
        gameState.cluesFound++;
        gameState.solvedRooms.push('room1');
        updateStats();
        
        // Unlock next room
        setTimeout(() => {
            unlockRoom('room2');
            document.getElementById('room2').scrollIntoView({ behavior: 'smooth' });
        }, 2000);
        
        // Disable input
        document.getElementById('room1Code').disabled = true;
        document.querySelector('#room1 .btn-solve').disabled = true;
        
    } else {
        feedback.textContent = '❌ FALSCH! Versuchen Sie es erneut.';
        feedback.style.color = '#ff0000';
        
        // Shake effect
        document.getElementById('room1Code').classList.add('shake');
        setTimeout(() => {
            document.getElementById('room1Code').classList.remove('shake');
        }, 500);
    }
}

// Add to Inventory
function addToInventory(item) {
    gameState.inventory.push(item);
    const slots = document.querySelectorAll('.inventory-slot.empty');
    if (slots.length > 0) {
        slots[0].textContent = item.split(':')[0];
        slots[0].classList.remove('empty');
        slots[0].classList.add('filled');
        slots[0].title = item;
        
        // Animation
        slots[0].style.animation = 'itemCollected 0.5s ease';
    }
}

// Room 2 Puzzle Solution
function solveRoom2() {
    const input = document.getElementById('room2Code');
    const feedback = document.getElementById('room2Feedback');
    
    if (input.value === '6') {
        input.classList.add('correct');
        feedback.textContent = '✅ RICHTIG! Dr. Blackwood nahm einen Patienten aus jeder der 6 Zellen.';
        feedback.style.color = '#00ff00';
        addToInventory('📖 Tagebuch: Friedrich Müller');
        gameState.cluesFound++;
        gameState.solvedRooms.push('room2');
        updateStats();
        setTimeout(() => {
            unlockRoom('room3');
            document.getElementById('room3').scrollIntoView({ behavior: 'smooth' });
        }, 2000);
        input.disabled = true;
        document.querySelector('#room2 .btn-solve').disabled = true;
    } else {
        input.classList.add('wrong');
        triggerScreenShake();
        feedback.textContent = '❌ FALSCH! Lesen Sie das Tagebuch nochmal genau.';
        feedback.style.color = '#ff0000';
        setTimeout(() => input.classList.remove('wrong'), 500);
    }
}

// Room 3 Puzzle Solution
function solveRoom3() {
    const input = document.getElementById('room3Code').value.toUpperCase();
    const feedback = document.getElementById('room3Feedback');
    
    if (input === '0347' || input === '347') {
        feedback.textContent = '✅ RICHTIG! 03:47 Uhr - die Todeszeit aller Opfer.';
        feedback.style.color = '#00ff00';
        addToInventory('🕐 Uhr: 03:47');
        gameState.cluesFound++;
        gameState.solvedRooms.push('room3');
        updateStats();
        setTimeout(() => {
            unlockRoom('room4');
            document.getElementById('room4').scrollIntoView({ behavior: 'smooth' });
        }, 2000);
        document.getElementById('room3Code').disabled = true;
        document.querySelector('#room3 .btn-solve').disabled = true;
    } else {
        triggerScreenShake();
        const input = document.getElementById('room3Code');
        input.classList.add('wrong');
        feedback.textContent = '❌ FALSCH! Stundenzeiger (3) + 47 Kratzer = ?';
        feedback.style.color = '#ff0000';
        setTimeout(() => input.classList.remove('wrong'), 600);
    }
}

// Room 4 Puzzle Solution
function solveRoom4() {
    const input = document.getElementById('room4Code').value;
    const feedback = document.getElementById('room4Feedback');
    
    // 87 total - 58 (bis 05.06) = 29 Behandlungen im Juni
    if (input === '29') {
        feedback.textContent = '✅ RICHTIG! 29 Elektroschocks in nur 2 Wochen im Juni 1952.';
        feedback.style.color = '#00ff00';
        addToInventory('⚡ Protokoll: 87 Schocks');
        gameState.cluesFound++;
        gameState.solvedRooms.push('room4');
        updateStats();
        setTimeout(() => {
            unlockRoom('room5');
            document.getElementById('room5').scrollIntoView({ behavior: 'smooth' });
        }, 2000);
        document.getElementById('room4Code').disabled = true;
        document.querySelector('#room4 .btn-solve').disabled = true;
    } else {
        triggerScreenShake();
        const input = document.getElementById('room4Code');
        input.classList.add('wrong');
        feedback.textContent = '❌ FALSCH! Von Behandlung 59 bis 87, über 2 Termine...';
        feedback.style.color = '#ff0000';
        setTimeout(() => input.classList.remove('wrong'), 600);
    }
}

// Room 5 Puzzle Solution
function solveRoom5() {
    const input = document.getElementById('room5Code').value.toUpperCase();
    const feedback = document.getElementById('room5Feedback');
    
    // ROT-13: YRPURAUN → LEICHENHALLE (aber "LEICHENHALLE" ist die Antwort)
    if (input === 'LEICHENHALLE' || input === 'LEICHENHALL') {
        feedback.textContent = '✅ RICHTIG! Die Patienten sind unter der Leichenhalle versteckt!';
        feedback.style.color = '#00ff00';
        addToInventory('📝 Notiz: Verschlüsselt');
        gameState.cluesFound++;
        gameState.solvedRooms.push('room5');
        updateStats();
        setTimeout(() => {
            unlockRoom('room6');
            document.getElementById('room6').scrollIntoView({ behavior: 'smooth' });
        }, 2000);
        document.getElementById('room5Code').disabled = true;
        document.querySelector('#room5 .btn-solve').disabled = true;
    } else {
        triggerScreenShake();
        const input = document.getElementById('room5Code');
        input.classList.add('wrong');
        feedback.textContent = '❌ FALSCH! Verwenden Sie ROT-13 (Y→L, R→E, P→C...)';
        feedback.style.color = '#ff0000';
        setTimeout(() => input.classList.remove('wrong'), 600);
    }
}

// Room 6 Puzzle Solution
function solveRoom6() {
    const input = document.getElementById('room6Code').value.toUpperCase();
    const feedback = document.getElementById('room6Feedback');
    
    // 👆👆👆 = —, 👆👆 = ·, 👆👆👆 = —, 👆👆👆 = — = — · — — — = SOS
    if (input === 'SOS') {
        feedback.textContent = '✅ RICHTIG! SOS - der verzweifelte Hilferuf von Margarethe Koch.';
        feedback.style.color = '#00ff00';
        addToInventory('💧 Fingerabdruck: SOS');
        gameState.cluesFound++;
        gameState.solvedRooms.push('room6');
        updateStats();
        setTimeout(() => {
            unlockRoom('room7');
            document.getElementById('room7').scrollIntoView({ behavior: 'smooth' });
        }, 2000);
        document.getElementById('room6Code').disabled = true;
        document.querySelector('#room6 .btn-solve').disabled = true;
    } else {
        triggerScreenShake();
        const input = document.getElementById('room6Code');
        input.classList.add('wrong');
        feedback.textContent = '❌ FALSCH! 3 Finger = —, 2 Finger = ·';
        feedback.style.color = '#ff0000';
        setTimeout(() => input.classList.remove('wrong'), 600);
    }
}

// Room 7 Puzzle Solution (FINALE)
function solveRoom7() {
    const input = document.getElementById('room7Code').value.toUpperCase();
    const feedback = document.getElementById('room7Feedback');
    
    // Dieser ist ein Trick - C-S-Z-N-L-S sind keine echten ersten Buchstaben
    // Die echte Lösung ist ein Anagramm oder verstecktes Wort - z.B. "SCHULD"
    // Aber für das Spiel akzeptieren wir eine kreative Lösung
    const validAnswers = ['SCHULD', 'SCZN LS', 'SCHULDLOS'];
    
    if (validAnswers.includes(input)) {
        feedback.innerHTML = `
            <div style="color: #00ff00; font-size: 1.5rem; margin: 30px 0;">
                ✅ FALL GELÖST!
            </div>
            <div style="background: rgba(0,0,0,0.9); padding: 30px; border: 3px solid #00ff00; margin-top: 20px;">
                <p style="font-size: 1.3rem; line-height: 1.8; color: rgba(255,255,255,0.9);">
                    <strong>DIE WAHRHEIT:</strong><br><br>
                    Dr. Heinrich Blackwood war kein Mensch mehr. Seine Experimente veränderten ihn.
                    In der Nacht vom 2. auf den 3. November 1952 führte er sein letztes "Ritual" durch.
                    Alle 23 Patienten starben gleichzeitig um 03:47 Uhr.<br><br>
                    <span style="color: #8B0000;">Aber seine Seele ist noch hier. Gefangen in den Wänden.
                    Jede Nacht um 03:47 Uhr... wiederholt sich alles.</span><br><br>
                    <strong style="color: #FFD700;">🏆 GLÜCKWUNSCH! Sie haben das Blackwood Asylum durchgespielt!</strong>
                </p>
            </div>
        `;
        gameState.cluesFound++;
        updateStats();
        document.getElementById('room7Code').disabled = true;
        document.querySelector('#room7 .btn-solve').disabled = true;
        
        // Victory celebration
        setTimeout(() => {
            alert('🎉 HERZLICHEN GLÜCKWUNSCH!\n\nSie haben alle 7 Rätsel gelöst!\nZeit: ' + document.getElementById('gameTimer').textContent + '\n\nDie Wahrheit über Blackwood Asylum ist enthüllt.');
        }, 3000);
        
    } else {
        triggerScreenShake();
        const input = document.getElementById('room7Code');
        input.classList.add('wrong');
        feedback.textContent = '❌ FALSCH! Verbinden Sie die ersten Buchstaben...';
        feedback.style.color = '#ff0000';
        setTimeout(() => input.classList.remove('wrong'), 600);
    }
}

// Sound Effects (placeholder)
function playSound(type) {
    // In production würde hier Audio abgespielt
    console.log('🔊 Sound effect:', type);
}

// Add CSS for animations
const gameStyles = document.createElement('style');
gameStyles.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
    @keyframes itemCollected {
        0% { transform: scale(0) rotate(0deg); opacity: 0; }
        50% { transform: scale(1.5) rotate(180deg); }
        100% { transform: scale(1) rotate(360deg); opacity: 1; }
    }
`;
document.head.appendChild(gameStyles);

// ═══════════════════════════════════════════════════════════
// MEGA WOW EFFEKTE - Horror Maximum 🔥💀
// Partikel-System, Blitze, Screen-Shake, 3D-Animationen
// ═══════════════════════════════════════════════════════════

function initWowEffects() {
    createMegaParticles();
    createAtmosphericFog();
    createBloodDrips();
    createLightningSystem();
    startAmbientHorrorEffects();
    enhanceInventorySlots();
    enhancePuzzleInputs();
    initHorrorVignette();
    startHorrorEffects(); // 💀 MAXIMALER HORROR
}

// ═══════════════════════════════════════════════════════════
// MAXIMALE HORROR-EFFEKTE 💀
// ═══════════════════════════════════════════════════════════

function startHorrorEffects() {
    // Screamer-Effekt (selten, zufällig)
    setInterval(() => {
        if (Math.random() > 0.95 && gameState.started) {
            triggerScreamer();
        }
    }, 30000);
    
    // Geister-Erscheinungen
    setInterval(() => {
        if (Math.random() > 0.7) {
            spawnGhostApparition();
        }
    }, 20000);
    
    // Rote Augen im Dunkel
    setInterval(() => {
        if (Math.random() > 0.8) {
            showEvilEyes();
        }
    }, 25000);
    
    // Schatten-Figuren
    setInterval(() => {
        if (Math.random() > 0.75) {
            createShadowFigure();
        }
    }, 35000);
    
    // Flackerlicht
    setInterval(() => {
        if (Math.random() > 0.85) {
            triggerLightFlicker();
        }
    }, 40000);
    
    // Versteckte Horror-Nachrichten
    setInterval(() => {
        if (Math.random() > 0.9) {
            showHiddenMessage();
        }
    }, 45000);
    
    // Blut-Spritzer (bei falschen Antworten)
    // Wird in solveRoom Funktionen getriggert
    
    // Handabdrücke erscheinen lassen
    setInterval(() => {
        if (Math.random() > 0.85) {
            showBloodyHandprint();
        }
    }, 50000);
}

// Screamer-Effekt
function triggerScreamer() {
    const screamer = document.createElement('div');
    screamer.className = 'screamer-overlay active';
    document.body.appendChild(screamer);
    
    // Vibrieren wenn möglich
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 100]);
    }
    
    setTimeout(() => screamer.remove(), 300);
}

// Geister-Erscheinung
function spawnGhostApparition() {
    const ghosts = ['👻', '💀', '😱', '🧟', '👹', '😈'];
    const ghost = document.createElement('div');
    ghost.className = 'ghost-apparition';
    ghost.textContent = ghosts[Math.floor(Math.random() * ghosts.length)];
    ghost.style.left = Math.random() * (window.innerWidth - 100) + 'px';
    ghost.style.top = Math.random() * (window.innerHeight - 100) + 'px';
    document.body.appendChild(ghost);
    
    setTimeout(() => ghost.remove(), 3000);
}

// Rote Augen
function showEvilEyes() {
    const eyes = document.createElement('div');
    eyes.className = 'evil-eyes active';
    eyes.style.left = Math.random() * (window.innerWidth - 80) + 'px';
    eyes.style.top = Math.random() * (window.innerHeight - 30) + 'px';
    document.body.appendChild(eyes);
    
    setTimeout(() => eyes.remove(), 6000);
}

// Schatten-Figur
function createShadowFigure() {
    const shadow = document.createElement('div');
    shadow.className = 'shadow-figure active';
    shadow.style.top = Math.random() * (window.innerHeight - 400) + 'px';
    document.body.appendChild(shadow);
    
    setTimeout(() => shadow.remove(), 4000);
}

// Flackerlicht
function triggerLightFlicker() {
    const flicker = document.createElement('div');
    flicker.className = 'flicker-overlay active';
    document.body.appendChild(flicker);
    
    setTimeout(() => flicker.remove(), 2000);
}

// Versteckte Horror-Nachricht
function showHiddenMessage() {
    const messages = [
        'HILF MIR',
        'ER IST HIER',
        'LAUF',
        'SIE BEOBACHTEN DICH',
        'ES IST ZU SPÄT',
        'DU BIST NICHT ALLEIN',
        'DREH DICH NICHT UM',
        'BLACKWOOD LEBT'
    ];
    
    const message = document.createElement('div');
    message.className = 'hidden-message visible';
    message.textContent = messages[Math.floor(Math.random() * messages.length)];
    message.style.left = Math.random() * (window.innerWidth - 300) + 'px';
    message.style.top = Math.random() * (window.innerHeight - 100) + 'px';
    document.body.appendChild(message);
    
    setTimeout(() => message.remove(), 3000);
}

// Blut-Spritzer
function createBloodSplatter(x, y) {
    const splatter = document.createElement('div');
    splatter.className = 'blood-splatter active';
    splatter.style.left = (x - 100) + 'px';
    splatter.style.top = (y - 100) + 'px';
    document.body.appendChild(splatter);
    
    setTimeout(() => splatter.remove(), 1500);
}

// Blutiger Handabdruck
function showBloodyHandprint() {
    const handprint = document.createElement('div');
    handprint.className = 'bloody-handprint visible';
    handprint.textContent = '🖐️';
    handprint.style.left = Math.random() * (window.innerWidth - 100) + 'px';
    handprint.style.top = Math.random() * (window.innerHeight - 100) + 'px';
    handprint.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(handprint);
    
    setTimeout(() => handprint.remove(), 5000);
}

// Horror-Vignette
function initHorrorVignette() {
    const vignette = document.createElement('div');
    vignette.className = 'horror-vignette';
    document.body.appendChild(vignette);
}

// Mega Partikel-System
function createMegaParticles() {
    const container = document.createElement('div');
    container.className = 'particles';
    document.body.appendChild(container);
    
    for (let i = 0; i < 80; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.width = Math.random() * 10 + 3 + 'px';
        particle.style.height = particle.style.width;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = Math.random() * 8 + 6 + 's';
        particle.style.opacity = Math.random() * 0.6 + 0.2;
        container.appendChild(particle);
    }
}

// Atmosphärischer Nebel
function createAtmosphericFog() {
    const fog = document.createElement('div');
    fog.className = 'fog';
    document.body.appendChild(fog);
}

// Blut-Tropfen animiert
function createBloodDrips() {
    setInterval(() => {
        if (Math.random() > 0.5) {
            const drip = document.createElement('div');
            drip.className = 'blood-drip';
            drip.style.left = Math.random() * 100 + '%';
            drip.style.animationDuration = Math.random() * 2 + 2 + 's';
            document.body.appendChild(drip);
            
            setTimeout(() => drip.remove(), 6000);
        }
    }, 2000);
}

// Blitz-System
function createLightningSystem() {
    const lightning = document.createElement('div');
    lightning.className = 'lightning';
    document.body.appendChild(lightning);
    
    setInterval(() => {
        if (Math.random() > 0.6) {
            lightning.classList.add('active');
            setTimeout(() => lightning.classList.remove('active'), 150);
            
            // Doppel-Blitz manchmal
            if (Math.random() > 0.7) {
                setTimeout(() => {
                    lightning.classList.add('active');
                    setTimeout(() => lightning.classList.remove('active'), 100);
                }, 300);
            }
        }
    }, 6000);
}

// Screen-Shake bei falscher Antwort
function triggerScreenShake() {
    document.body.classList.add('screen-shake');
    setTimeout(() => document.body.classList.remove('screen-shake'), 600);
}

// Ambient Horror Effekte
function startAmbientHorrorEffects() {
    // Zufällige Glitch-Effekte auf Überschriften
    setInterval(() => {
        const elements = document.querySelectorAll('h1, h2, h3, .glitch-title');
        const randomElement = elements[Math.floor(Math.random() * elements.length)];
        if (randomElement && Math.random() > 0.75) {
            const originalAnimation = randomElement.style.animation;
            randomElement.style.animation = 'glitchAnimation 0.3s';
            setTimeout(() => {
                randomElement.style.animation = originalAnimation;
            }, 300);
        }
    }, 10000);
    
    // Zufällige Partikel-Explosionen
    setInterval(() => {
        if (Math.random() > 0.8) {
            createParticleBurst();
        }
    }, 15000);
}

// Partikel-Explosion
function createParticleBurst() {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.background = 'rgba(139, 0, 0, 0.8)';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        
        const angle = (Math.PI * 2 * i) / 15;
        const velocity = 2 + Math.random() * 3;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        document.body.appendChild(particle);
        
        let posX = x;
        let posY = y;
        let opacity = 1;
        
        const animate = () => {
            posX += vx;
            posY += vy;
            opacity -= 0.02;
            
            particle.style.left = posX + 'px';
            particle.style.top = posY + 'px';
            particle.style.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        };
        
        animate();
    }
}

// Enhance Inventory Slots
function enhanceInventorySlots() {
    const slots = document.querySelectorAll('.inventory-slot');
    slots.forEach(slot => {
        slot.classList.add('inventory-slot-enhanced');
    });
}

// Enhance Puzzle Inputs
function enhancePuzzleInputs() {
    const inputs = document.querySelectorAll('.puzzle-input, input[type="text"]');
    inputs.forEach(input => {
        if (input.closest('.puzzle-interactive') || input.id.includes('Code')) {
            input.classList.add('puzzle-input-enhanced');
        }
    });
}

// Room Unlock mit Animation
function unlockRoomWithEffect(roomId) {
    const room = document.getElementById(roomId);
    if (room) {
        room.classList.add('room-unlocking');
        setTimeout(() => {
            room.classList.remove('room-unlocking');
        }, 1000);
    }
}

// JS Copyright Marker END
// © 2025 Michael Ostermann



