// ═════════════════════════════════════════════════════════════
// HOGWARTS SCHOOL - DEMO PROTECTION
// © 2025 Michael Ostermann
// DEMO-SCHUTZ: Kein Kopieren, kein Rechtsklick, keine DevTools
// Aktiv bis zur offiziellen Freigabe!
// ═════════════════════════════════════════════════════════════

(function() {
    'use strict';
    
    // ===== 1. RECHTSKLICK-SPERRE =====
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showProtectionWarning('⚠️ Rechtsklick ist in der Demo-Version deaktiviert!');
        return false;
    });
    
    // ===== 2. TEXT-SELEKTION DEAKTIVIEREN =====
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    // ===== 3. KOPIEREN BLOCKIEREN =====
    document.addEventListener('copy', function(e) {
        e.preventDefault();
        showProtectionWarning('⚠️ Kopieren ist in der Demo-Version nicht möglich!');
        return false;
    });
    
    document.addEventListener('cut', function(e) {
        e.preventDefault();
        showProtectionWarning('⚠️ Ausschneiden ist in der Demo-Version nicht möglich!');
        return false;
    });
    
    // ===== 4. TASTENKOMBINATIONEN BLOCKIEREN =====
    document.addEventListener('keydown', function(e) {
        // Strg+C, Strg+X, Strg+A, Strg+U, Strg+S
        if (e.ctrlKey || e.metaKey) {
            if (
                e.key === 'c' || e.key === 'C' ||  // Kopieren
                e.key === 'x' || e.key === 'X' ||  // Ausschneiden
                e.key === 'a' || e.key === 'A' ||  // Alles markieren
                e.key === 'u' || e.key === 'U' ||  // Seitenquelltext
                e.key === 's' || e.key === 'S' ||  // Speichern
                e.key === 'p' || e.key === 'P'     // Drucken
            ) {
                e.preventDefault();
                showProtectionWarning('⚠️ Diese Funktion ist in der Demo-Version gesperrt!');
                return false;
            }
        }
        
        // F12 (DevTools)
        if (e.key === 'F12') {
            e.preventDefault();
            showProtectionWarning('⚠️ DevTools sind in der Demo-Version deaktiviert!');
            return false;
        }
        
        // Strg+Shift+I / Strg+Shift+J / Strg+Shift+C (DevTools)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (
            e.key === 'I' || e.key === 'i' ||
            e.key === 'J' || e.key === 'j' ||
            e.key === 'C' || e.key === 'c'
        )) {
            e.preventDefault();
            showProtectionWarning('⚠️ DevTools sind in der Demo-Version deaktiviert!');
            return false;
        }
    });
    
    // ===== 5. DRAG & DROP BLOCKIEREN =====
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    // ===== 6. CSS USER-SELECT SETZEN =====
    const style = document.createElement('style');
    style.textContent = `
        * {
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
            -webkit-touch-callout: none !important;
        }
        
        /* Nur Eingabefelder erlauben */
        input, textarea {
            -webkit-user-select: text !important;
            -moz-user-select: text !important;
            -ms-user-select: text !important;
            user-select: text !important;
        }
        
        /* Demo-Wasserzeichen */
        body::before {
            content: 'DEMO VERSION';
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            font-weight: 900;
            color: rgba(255, 255, 255, 0.03);
            pointer-events: none;
            z-index: 999997;
            letter-spacing: 20px;
        }
    `;
    document.head.appendChild(style);
    
    // ===== 7. DEVTOOLS-DETEKTION =====
    let devtoolsOpen = false;
    const devtoolsCheck = setInterval(() => {
        const threshold = 160;
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        
        if (widthThreshold || heightThreshold) {
            if (!devtoolsOpen) {
                devtoolsOpen = true;
                showProtectionWarning('⚠️ WARNUNG: DevTools erkannt! Bitte schließen!');
                console.clear();
            }
        } else {
            devtoolsOpen = false;
        }
    }, 1000);
    
    // ===== 8. CONSOLE HIJACKING =====
    (function() {
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;
        
        console.log = console.warn = console.error = function() {
            // Nur Warnung zeigen
            originalWarn.call(console, '%c⚠️ DEMO VERSION - CODE-ZUGRIFF EINGESCHRÄNKT', 
                'background: #FF6B00; color: white; font-size: 14px; padding: 10px; font-weight: bold;');
        };
    })();
    
    // ===== 9. WARNUNG ANZEIGEN =====
    function showProtectionWarning(message) {
        // Entferne alte Warnung
        const oldWarning = document.getElementById('demo-protection-warning');
        if (oldWarning) oldWarning.remove();
        
        const warning = document.createElement('div');
        warning.id = 'demo-protection-warning';
        warning.innerHTML = message;
        warning.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #FF6B00 0%, #FF1493 100%);
            color: white;
            padding: 15px 30px;
            border-radius: 10px;
            font-weight: 700;
            font-size: 14px;
            z-index: 999999;
            box-shadow: 0 10px 40px rgba(255, 107, 0, 0.5);
            animation: slideDown 0.3s ease-out, fadeOut 0.3s ease-in 2.7s;
            pointer-events: none;
        `;
        
        document.body.appendChild(warning);
        
        setTimeout(() => {
            warning.remove();
        }, 3000);
    }
    
    // ===== 10. DEMO-HINWEIS =====
    function createDemoNotice() {
        const notice = document.createElement('div');
        notice.id = 'demo-notice';
        notice.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 16px; font-weight: 700; margin-bottom: 5px;">🔒 DEMO VERSION</div>
                <div style="font-size: 12px; opacity: 0.8;">Rechtsklick & Kopieren deaktiviert bis zur Freigabe</div>
            </div>
        `;
        notice.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(255, 107, 0, 0.95);
            backdrop-filter: blur(10px);
            color: white;
            padding: 12px 20px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 12px;
            z-index: 999998;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
            border: 2px solid rgba(255, 255, 255, 0.2);
        `;
        
        document.body.appendChild(notice);
    }
    
    // ===== 11. SOURCE CODE SCHUTZ =====
    Object.defineProperty(document, 'body', {
        get: function() {
            return document.getElementsByTagName('body')[0];
        },
        set: function() {
            console.warn('⚠️ Body-Manipulation ist in der Demo-Version nicht erlaubt!');
        }
    });
    
    // ===== 12. ANIMATIONS =====
    const animStyle = document.createElement('style');
    animStyle.textContent = `
        @keyframes slideDown {
            from {
                transform: translateX(-50%) translateY(-100px);
                opacity: 0;
            }
            to {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
        }
        
        @keyframes fadeOut {
            from {
                opacity: 1;
            }
            to {
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(animStyle);
    
    // ===== INITIALISIERUNG =====
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }
        
        createDemoNotice();
        
        console.clear();
        console.log('%c🔒 DEMO VERSION', 'background: #FF6B00; color: white; font-size: 20px; padding: 10px; font-weight: bold;');
        console.log('%c⚠️ Diese Demo-Version ist geschützt!', 'font-size: 14px; color: #FF6B00; font-weight: bold;');
        console.log('%cRechtsklick, Kopieren und Code-Zugriff sind deaktiviert.', 'font-size: 12px; color: #666;');
        console.log('%c© 2025 Michael Ostermann', 'font-size: 12px; color: #1D9A50; font-weight: bold;');
    }
    
    init();
    
    // ===== 13. PERIODISCHE SCHUTZ-PRÜFUNG =====
    setInterval(() => {
        // Prüfe ob Demo-Notice noch da ist
        if (!document.getElementById('demo-notice')) {
            createDemoNotice();
        }
        
        // Prüfe ob User-Select entfernt wurde
        const bodyStyle = window.getComputedStyle(document.body);
        if (bodyStyle.userSelect !== 'none') {
            console.warn('⚠️ Schutz-Manipulation erkannt! Wird wiederhergestellt...');
            document.head.appendChild(style.cloneNode(true));
        }
    }, 3000);
    
})();

// ═════════════════════════════════════════════════════════════
// HINWEIS: Dieser Schutz wird bei offizieller Freigabe entfernt!
// Kontakt: https://mcgv.de
// ═════════════════════════════════════════════════════════════

console.log('%c⚠️ DEMO-SCHUTZ AKTIV', 'background: red; color: white; font-size: 16px; padding: 10px; font-weight: bold;');

