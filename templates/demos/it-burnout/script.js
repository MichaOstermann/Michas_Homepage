// ═══════════════════════════════════════════════════════════════
// IT-ADMIN SURVIVAL MODE - INTERACTIVE JAVASCRIPT
// © 2025 Michael Ostermann
// ═══════════════════════════════════════════════════════════════

// JS Copyright Protection Marker
// ©2025-MICHAEL-OSTERMANN-IT-BURNOUT-JS

document.addEventListener('DOMContentLoaded', () => {
    initMatrixRain();
    initTicketCounter();
    initCaffeineLevel();
    initBurnoutMeter();
    initBudgetCounter();
    initErrorPopups();
    initServerTime();
    initCoffeeCounter();
    initTypingAnimation();
    
    // CMS & Protection
    if (typeof initInlineCMS === 'function') {
        initInlineCMS();
    }
    if (typeof initCopyrightProtection === 'function') {
        initCopyrightProtection();
    }
});

// Matrix Rain Background
function initMatrixRain() {
    const canvas = document.getElementById('matrixCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);
    
    function draw() {
        ctx.fillStyle = 'rgba(10, 14, 15, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00ff41';
        ctx.font = `${fontSize}px monospace`;
        
        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    
    setInterval(draw, 33);
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Ticket Counter (increasing chaos)
function initTicketCounter() {
    const counter = document.getElementById('ticketCount');
    if (!counter) return;
    
    let count = 247;
    
    setInterval(() => {
        const change = Math.random() > 0.3 ? 1 : -1;
        count += change;
        count = Math.max(200, Math.min(300, count)); // Keep between 200-300
        counter.textContent = count;
        
        // Visual feedback on increase
        if (change > 0) {
            counter.style.color = '#ff3333';
            setTimeout(() => {
                counter.style.color = '#ff3333';
            }, 200);
        }
    }, 5000);
}

// Caffeine Level (decreasing, then refills)
function initCaffeineLevel() {
    const level = document.getElementById('caffeineLevel');
    if (!level) return;
    
    let caffeine = 94;
    
    setInterval(() => {
        caffeine -= Math.floor(Math.random() * 3) + 1;
        
        if (caffeine < 20) {
            // Refill coffee!
            caffeine = 95;
            showErrorPopup('☕ COFFEE REFILL! Caffeine restored to 95%', 'success');
        }
        
        level.textContent = `${caffeine}%`;
        
        // Color coding
        if (caffeine < 30) {
            level.style.color = '#ff3333';
        } else if (caffeine < 60) {
            level.style.color = '#ff9933';
        } else {
            level.style.color = '#00ff41';
        }
    }, 8000);
}

// Burnout Meter (steadily increasing)
function initBurnoutMeter() {
    const meter = document.getElementById('burnoutMeter');
    if (!meter) return;
    
    let burnout = 87;
    
    setInterval(() => {
        burnout += Math.random() > 0.5 ? 1 : 0;
        burnout = Math.min(99, burnout); // Max 99%
        
        if (burnout > 95) {
            showErrorPopup('⚠️ BURNOUT LEVEL CRITICAL! Take a break!', 'error');
        }
        
        meter.textContent = `${burnout}%`;
        meter.style.color = burnout > 90 ? '#ff3333' : '#ff9933';
    }, 12000);
}

// Budget Counter (always denied)
function initBudgetCounter() {
    const budget = document.getElementById('budgetLeft');
    if (!budget) return;
    
    setInterval(() => {
        budget.textContent = '€0';
        budget.style.color = '#ff3333';
    }, 1000);
}

// Random Error Popups
function initErrorPopups() {
    const messages = [
        '🔥 CRITICAL: Server MAIL-SRV-01 is down!',
        '⚠️ WARNING: Disk space at 99% on DB-SRV-03',
        '❌ ERROR: Backup failed for the 47th time',
        '🚨 ALERT: 15 new tickets opened in last 5 minutes',
        '💀 CRITICAL: CEO demands immediate fix for "slow internet"',
        '⏰ REMINDER: You have 23 hours of overtime this week',
        '☕ WARNING: Coffee machine out of order',
        '🔒 ALERT: Security vulnerability detected (no budget for fix)',
        '📧 URGENT: 247 unread emails from users',
        '🖥️ ERROR: Windows Update forced restart in 10 minutes'
    ];
    
    function showRandomError() {
        const message = messages[Math.floor(Math.random() * messages.length)];
        showErrorPopup(message, 'error');
    }
    
    // Random intervals between 15-45 seconds
    function scheduleNextError() {
        const delay = (Math.random() * 30000) + 15000;
        setTimeout(() => {
            showRandomError();
            scheduleNextError();
        }, delay);
    }
    
    scheduleNextError();
}

// Show Error Popup
function showErrorPopup(message, type = 'error') {
    const container = document.getElementById('errorPopups');
    if (!container) return;
    
    const popup = document.createElement('div');
    popup.className = 'error-popup';
    popup.textContent = message;
    
    if (type === 'success') {
        popup.style.background = 'rgba(0, 204, 102, 0.95)';
        popup.style.borderColor = '#00cc66';
    }
    
    container.appendChild(popup);
    
    // Remove after 4 seconds
    setTimeout(() => {
        popup.remove();
    }, 4000);
}

// Server Time Update
function initServerTime() {
    const serverTime = document.getElementById('serverTime');
    if (!serverTime) return;
    
    function updateTime() {
        const now = new Date();
        const seconds = Math.floor((Date.now() - now.setHours(0, 0, 0, 0)) / 1000);
        serverTime.textContent = `${seconds} seconds ago (refreshing never)`;
    }
    
    updateTime();
    setInterval(updateTime, 1000);
}

// Coffee Counter
function initCoffeeCounter() {
    const counter = document.getElementById('coffeeCount');
    if (!counter) return;
    
    let count = 14;
    
    setInterval(() => {
        count++;
        counter.textContent = count;
        
        if (count > 20) {
            showErrorPopup('☕ Coffee intake dangerously high! (But you need it)', 'error');
        }
    }, 30000); // Every 30 seconds (because IT admins drink FAST)
}

// Typing Animation in Terminal
function initTypingAnimation() {
    const cursor = document.querySelector('.typing-cursor');
    if (!cursor) return;
    
    const commands = [
        'systemctl status httpd',
        'tail -f /var/log/messages',
        'df -h',
        'ps aux | grep zombie',
        'htop',
        'vim /etc/config',
        'git blame production.php',
        'sudo reboot',
        'pkill -9 everything',
        'rm -rf / --no-preserve-root',
        'echo "I quit"'
    ];
    
    let cmdIndex = 0;
    let charIndex = 0;
    let currentCommand = '';
    
    function type() {
        if (charIndex < commands[cmdIndex].length) {
            currentCommand += commands[cmdIndex][charIndex];
            cursor.parentElement.innerHTML = `<span class="prompt">root@server:~#</span> <span class="command">${currentCommand}</span><span class="typing-cursor"></span>`;
            charIndex++;
            setTimeout(type, 100 + Math.random() * 100);
        } else {
            setTimeout(() => {
                cmdIndex = (cmdIndex + 1) % commands.length;
                charIndex = 0;
                currentCommand = '';
                type();
            }, 2000);
        }
    }
    
    setTimeout(type, 2000);
}

// JS Copyright Protection Marker END
// ©2025-MICHAEL-OSTERMANN



