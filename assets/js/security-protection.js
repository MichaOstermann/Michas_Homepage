// ═══════════════════════════════════════════════════════════════
// MCGV.DE - SECURITY PROTECTION SYSTEM
// © 2025 Michael Ostermann
// Bot-Detection • Anti-Scraping • Content-Protection
// ═══════════════════════════════════════════════════════════════

(function() {
    'use strict';
    
    // ===== 1. BOT DETECTION =====
    function detectBot() {
        const botPatterns = [
            /bot/i, /crawler/i, /spider/i, /scraper/i,
            /GPTBot/i, /ChatGPT/i, /Claude/i, /anthropic/i,
            /CCBot/i, /Bytespider/i, /Amazonbot/i,
            /AhrefsBot/i, /SemrushBot/i, /MJ12bot/i,
            /curl/i, /wget/i, /python/i, /scrapy/i,
            /headless/i, /phantom/i, /selenium/i, /puppeteer/i
        ];
        
        const userAgent = navigator.userAgent;
        
        for (let pattern of botPatterns) {
            if (pattern.test(userAgent)) {
                logSecurityEvent('BOT_DETECTED', userAgent);
                return true;
            }
        }
        
        // Prüfe auf fehlende Browser-Features (Headless-Browser)
        if (!navigator.plugins || navigator.plugins.length === 0) {
            if (!navigator.mimeTypes || navigator.mimeTypes.length === 0) {
                logSecurityEvent('HEADLESS_BROWSER_SUSPECTED');
                return true;
            }
        }
        
        // WebDriver Detection (Selenium, Puppeteer)
        if (navigator.webdriver) {
            logSecurityEvent('WEBDRIVER_DETECTED');
            return true;
        }
        
        return false;
    }
    
    // ===== 2. RAPID CLICK DETECTION =====
    let clickCount = 0;
    let clickTimer = null;
    
    document.addEventListener('click', function() {
        clickCount++;
        
        if (clickCount > 20) {
            logSecurityEvent('RAPID_CLICK_DETECTED', `${clickCount} clicks`);
            // Zeige Warning
            showSecurityWarning('⚠️ Verdächtige Aktivität erkannt!');
        }
        
        clearTimeout(clickTimer);
        clickTimer = setTimeout(() => {
            clickCount = 0;
        }, 3000);
    });
    
    // ===== 3. COPY PROTECTION =====
    let copyAttempts = 0;
    
    document.addEventListener('copy', function(e) {
        copyAttempts++;
        
        if (copyAttempts > 5) {
            e.preventDefault();
            logSecurityEvent('EXCESSIVE_COPY_ATTEMPTS', copyAttempts);
            showSecurityWarning('⚠️ Zu viele Kopier-Versuche!');
            return false;
        }
        
        // Füge unsichtbaren Copyright-Marker hinzu
        const selection = window.getSelection().toString();
        const copyrightText = `\n\n───────────────────────\nQuelle: https://mcgv.de\n© 2025 Michael Ostermann\nAlle Rechte vorbehalten.\n───────────────────────`;
        
        e.clipboardData.setData('text/plain', selection + copyrightText);
        e.preventDefault();
    });
    
    // ===== 4. DEVTOOLS DETECTION =====
    let devtoolsOpen = false;
    
    function detectDevTools() {
        const threshold = 160;
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        
        if (widthThreshold || heightThreshold) {
            if (!devtoolsOpen) {
                devtoolsOpen = true;
                logSecurityEvent('DEVTOOLS_OPENED');
                console.clear();
                console.log('%c⚠️ SICHERHEITSHINWEIS', 'background: red; color: white; font-size: 20px; padding: 10px; font-weight: bold;');
                console.log('%cDiese Website ist geschützt!', 'font-size: 14px; color: red;');
                console.log('%c© 2025 Michael Ostermann', 'font-size: 12px; color: #1D9A50;');
            }
        } else {
            devtoolsOpen = false;
        }
    }
    
    // DevTools Detection (nur alle 2 Sekunden für Performance)
    setInterval(detectDevTools, 2000);
    
    // ===== 5. CONSOLE HIJACKING =====
    (function() {
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;
        
        console.log = console.warn = console.error = function(...args) {
            // Logge Versuche
            logSecurityEvent('CONSOLE_ACCESS', args.join(' '));
            
            // Zeige nur Warnung
            originalWarn.call(console, '%c⚠️ GESCHÜTZTE WEBSITE', 
                'background: #FF6B00; color: white; font-size: 14px; padding: 10px; font-weight: bold;');
        };
    })();
    
    // ===== 6. ANTI-SCRAPING: FAKE CONTENT =====
    function insertFakeContent() {
        // Füge unsichtbare Honeypot-Links ein
        const honeypots = [
            '/admin/login.php',
            '/wp-admin/',
            '/administrator/',
            '/phpmyadmin/',
            '/.env',
            '/config.php'
        ];
        
        honeypots.forEach(url => {
            const link = document.createElement('a');
            link.href = url;
            link.style.cssText = 'position:absolute;left:-9999px;opacity:0;pointer-events:none;';
            link.textContent = 'Admin';
            document.body.appendChild(link);
        });
        
        // Honeypot-Klick-Tracking
        document.querySelectorAll('a[href*="admin"], a[href*=".env"], a[href*="config"]').forEach(link => {
            link.addEventListener('click', function(e) {
                if (this.style.opacity === '0' || this.style.left === '-9999px') {
                    e.preventDefault();
                    logSecurityEvent('HONEYPOT_TRIGGERED', this.href);
                    blockUser();
                }
            });
        });
    }
    
    // ===== 7. RATE LIMITING (CLIENT-SIDE) =====
    let pageLoadCount = parseInt(sessionStorage.getItem('pageLoadCount') || '0');
    pageLoadCount++;
    sessionStorage.setItem('pageLoadCount', pageLoadCount.toString());
    
    if (pageLoadCount > 50) {
        logSecurityEvent('EXCESSIVE_PAGE_LOADS', pageLoadCount);
        showSecurityWarning('⚠️ Zu viele Anfragen! Bitte warten Sie.');
        
        // 5 Sekunden Verzögerung
        document.body.style.opacity = '0.3';
        document.body.style.pointerEvents = 'none';
        
        setTimeout(() => {
            document.body.style.opacity = '1';
            document.body.style.pointerEvents = 'auto';
            sessionStorage.setItem('pageLoadCount', '0');
        }, 5000);
    }
    
    // ===== 8. RIGHT-CLICK TRACKING =====
    let rightClickCount = 0;
    
    document.addEventListener('contextmenu', function(e) {
        rightClickCount++;
        
        if (rightClickCount > 10) {
            logSecurityEvent('EXCESSIVE_RIGHT_CLICKS', rightClickCount);
            showSecurityWarning('⚠️ Verdächtiges Verhalten erkannt!');
        }
    });
    
    // ===== 9. VIEWPORT MANIPULATION DETECTION =====
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    let resizeCount = 0;
    
    window.addEventListener('resize', function() {
        resizeCount++;
        
        if (resizeCount > 20) {
            logSecurityEvent('EXCESSIVE_RESIZE', resizeCount);
        }
        
        // Reset nach 5 Sekunden
        setTimeout(() => {
            resizeCount = 0;
        }, 5000);
    });
    
    // ===== 10. MOUSE MOVEMENT TRACKING (Bot-Detection) =====
    let mouseMovements = 0;
    let lastMouseTime = Date.now();
    
    document.addEventListener('mousemove', function() {
        mouseMovements++;
        lastMouseTime = Date.now();
    });
    
    // Prüfe nach 30 Sekunden
    setTimeout(() => {
        if (mouseMovements < 5) {
            logSecurityEvent('NO_MOUSE_MOVEMENT', 'Possible bot');
        }
    }, 30000);
    
    // ===== 11. KEYBOARD ACTIVITY TRACKING =====
    let keyPresses = 0;
    
    document.addEventListener('keydown', function(e) {
        keyPresses++;
        
        // Blockiere gefährliche Shortcuts
        if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
            if (e.key === 'I' || e.key === 'J' || e.key === 'C') {
                e.preventDefault();
                logSecurityEvent('DEVTOOLS_SHORTCUT_BLOCKED', e.key);
                return false;
            }
        }
    });
    
    // ===== 12. CANVAS FINGERPRINTING DETECTION =====
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function(...args) {
        logSecurityEvent('CANVAS_FINGERPRINTING_ATTEMPT');
        return originalToDataURL.apply(this, args);
    };
    
    // ===== 13. LOCAL STORAGE MONITORING =====
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
        if (key.includes('bot') || key.includes('scrape') || key.includes('hack')) {
            logSecurityEvent('SUSPICIOUS_STORAGE_ACCESS', key);
        }
        return originalSetItem.apply(this, arguments);
    };
    
    // ===== HELPER: SECURITY WARNING =====
    function showSecurityWarning(message) {
        const warning = document.createElement('div');
        warning.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #FF6B00, #FF1493);
            color: white;
            padding: 15px 30px;
            border-radius: 10px;
            font-weight: 700;
            z-index: 999999;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            animation: slideDown 0.3s ease;
        `;
        warning.textContent = message;
        document.body.appendChild(warning);
        
        setTimeout(() => warning.remove(), 3000);
    }
    
    // ===== HELPER: SECURITY LOG =====
    let logQueue = [];
    let logTimer = null;
    let logRequestInProgress = false;
    
    function logSecurityEvent(event, details = '') {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            event,
            details,
            userAgent: navigator.userAgent,
            ip: 'CLIENT_SIDE',
            url: window.location.href
        };
        
        // Queue für Batch-Processing
        logQueue.push(logEntry);
        
        // Console-Log (für Dev)
        console.warn('🔒 Security Event:', event, details);
        
        // Batch-Logging (alle 5 Sekunden oder max 10 Events)
        if (logQueue.length >= 10 || !logTimer) {
            flushLogQueue();
        } else if (!logTimer) {
            logTimer = setTimeout(flushLogQueue, 5000);
        }
    }
    
    function flushLogQueue() {
        if (logRequestInProgress || logQueue.length === 0) return;
        
        logRequestInProgress = true;
        const eventsToSend = logQueue.splice(0, 10);
        
        // Sende an Server mit Timeout (2 Sekunden max)
        if (typeof fetch !== 'undefined') {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            
            fetch('/security-log.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ events: eventsToSend }),
                signal: controller.signal
            })
            .catch(() => {}) // Silent fail bei Timeout/Fehler
            .finally(() => {
                clearTimeout(timeoutId);
                logRequestInProgress = false;
                
                // Nächsten Batch verarbeiten falls noch Events in Queue
                if (logQueue.length > 0) {
                    setTimeout(flushLogQueue, 1000);
                }
            });
        } else {
            logRequestInProgress = false;
        }
        
        if (logTimer) {
            clearTimeout(logTimer);
            logTimer = null;
        }
    }
    
    // ===== HELPER: BLOCK USER =====
    function blockUser() {
        document.body.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                background: #0B0F16;
                color: #FF3333;
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 2rem;
            ">
                <div>
                    <h1 style="font-size: 4rem; margin-bottom: 1rem;">⛔</h1>
                    <h2 style="font-size: 2rem; margin-bottom: 1rem;">Zugriff blockiert</h2>
                    <p style="font-size: 1.2rem; color: #999;">
                        Verdächtige Aktivität erkannt.<br>
                        Ihr Zugriff wurde aus Sicherheitsgründen blockiert.
                    </p>
                    <p style="margin-top: 2rem; font-size: 0.9rem; color: #666;">
                        Security ID: ${Date.now()}<br>
                        © 2025 MCGV.DE
                    </p>
                </div>
            </div>
        `;
        
        // Blockiere Navigation
        window.onbeforeunload = () => true;
    }
    
    // ===== INITIALIZATION =====
    function init() {
        // Bot-Check
        if (detectBot()) {
            logSecurityEvent('BOT_BLOCKED');
            // Optional: blockUser(); // Aktiviere wenn gewünscht
        }
        
        // Honeypots einfügen
        setTimeout(insertFakeContent, 2000);
        
        // Initial Log
        logSecurityEvent('PAGE_LOADED');
        
        console.log('%c🛡️ SECURITY PROTECTION ACTIVE', 'background: #1D9A50; color: white; font-size: 16px; padding: 10px; font-weight: bold;');
    }
    
    // Start Protection
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();

// ═══════════════════════════════════════════════════════════════
// © 2025 Michael Ostermann - MCGV.DE
// Dieser Code schützt die Website vor Bots, Scraping & Angriffen!
// ═══════════════════════════════════════════════════════════════

