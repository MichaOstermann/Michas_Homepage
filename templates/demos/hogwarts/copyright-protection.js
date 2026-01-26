// Copyright Protection System
// © 2025 Michael Ostermann - Hogwarts School Template
// Diese Datei darf NICHT entfernt werden!

(function() {
    'use strict';
    
    const COPYRIGHT = {
        owner: 'Michael Ostermann',
        year: '2025',
        template: 'Hogwarts School Template',
        website: 'https://mcgv.de',
        warning: 'ACHTUNG: Copyright-Hinweise dürfen nicht entfernt werden!'
    };
    
    // ===== 1. CONSOLE WARNING =====
    function showConsoleWarning() {
        const style1 = 'background: #D3A625; color: white; font-size: 20px; font-weight: bold; padding: 10px 20px;';
        const style2 = 'background: #FF4444; color: white; font-size: 14px; padding: 10px; font-weight: bold;';
        const style3 = 'font-size: 12px; color: #D3A625;';
        
        console.clear();
        console.log('%c🪄 HOGWARTS SCHOOL TEMPLATE', style1);
        console.log('%c⚠️ COPYRIGHT WARNUNG ⚠️', style2);
        console.log(`%c© ${COPYRIGHT.year} ${COPYRIGHT.owner}`, style3);
        console.log(`%cWebsite: ${COPYRIGHT.website}`, style3);
        console.log(`%c\n${COPYRIGHT.warning}\n`, 'color: red; font-size: 14px; font-weight: bold;');
        console.log('%cDas Entfernen von Copyright-Hinweisen ist illegal!', 'color: red;');
    }
    
    // ===== 2. FIXED COPYRIGHT BADGE =====
    function createCopyrightBadge() {
        // Prüfe ob Badge schon existiert
        if (document.getElementById('copyright-protection-badge')) return;
        
        const badge = document.createElement('div');
        badge.id = 'copyright-protection-badge';
        badge.innerHTML = `© ${COPYRIGHT.year} ${COPYRIGHT.owner}`;
        badge.style.cssText = `
            position: fixed !important;
            bottom: 10px !important;
            left: 10px !important;
            background: rgba(211, 166, 37, 0.9) !important;
            color: white !important;
            padding: 8px 15px !important;
            border-radius: 20px !important;
            font-size: 12px !important;
            font-weight: 700 !important;
            z-index: 999999 !important;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5) !important;
            pointer-events: none !important;
            user-select: none !important;
            -webkit-user-select: none !important;
            opacity: 0.7 !important;
        `;
        
        // Schütze Badge vor Entfernung
        Object.defineProperty(badge, 'remove', {
            value: function() {
                console.error('❌ Copyright-Schutz kann nicht entfernt werden!');
                return false;
            },
            writable: false,
            configurable: false
        });
        
        document.body.appendChild(badge);
        
        // Re-create Badge wenn entfernt
        const observer = new MutationObserver((mutations) => {
            if (!document.getElementById('copyright-protection-badge')) {
                console.warn('⚠️ Copyright-Badge wurde entfernt - wird wiederhergestellt!');
                createCopyrightBadge();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // ===== 3. HIDDEN COPYRIGHT MARKERS =====
    function createHiddenMarkers() {
        // Meta-Tags
        const meta1 = document.createElement('meta');
        meta1.name = 'template-author';
        meta1.content = COPYRIGHT.owner;
        document.head.appendChild(meta1);
        
        const meta2 = document.createElement('meta');
        meta2.name = 'template-copyright';
        meta2.content = `© ${COPYRIGHT.year} ${COPYRIGHT.owner} - ${COPYRIGHT.template}`;
        document.head.appendChild(meta2);
        
        const meta3 = document.createElement('meta');
        meta3.name = 'template-source';
        meta3.content = COPYRIGHT.website;
        document.head.appendChild(meta3);
        
        // Versteckte HTML-Kommentare
        const comment1 = document.createComment(`
            ═══════════════════════════════════════════════════════════
            HOGWARTS SCHOOL TEMPLATE
            © ${COPYRIGHT.year} ${COPYRIGHT.owner}
            Website: ${COPYRIGHT.website}
            
            WARNUNG: Das Entfernen dieser Copyright-Hinweise ist illegal
            und verstößt gegen das Urheberrecht!
            ═══════════════════════════════════════════════════════════
        `);
        document.body.insertBefore(comment1, document.body.firstChild);
    }
    
    // ===== 4. WATERMARK OVERLAY =====
    function createWatermark() {
        const watermark = document.createElement('div');
        watermark.id = 'copyright-watermark';
        watermark.innerHTML = `© ${COPYRIGHT.year} ${COPYRIGHT.owner}`.repeat(20);
        watermark.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            pointer-events: none !important;
            z-index: 999998 !important;
            opacity: 0.015 !important;
            font-size: 24px !important;
            font-weight: 700 !important;
            color: white !important;
            transform: rotate(-45deg) !important;
            display: flex !important;
            flex-wrap: wrap !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 50px !important;
            user-select: none !important;
            -webkit-user-select: none !important;
        `;
        
        document.body.appendChild(watermark);
    }
    
    // ===== 5. FOOTER COPYRIGHT PROTECTION =====
    function protectFooterCopyright() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                // Prüfe ob Footer-Copyright verändert wurde
                const footer = document.querySelector('.footer');
                if (footer) {
                    const text = footer.textContent;
                    if (!text.includes(COPYRIGHT.owner)) {
                        console.error('⚠️ WARNUNG: Footer-Copyright wurde manipuliert!');
                        // Stelle Original wieder her
                        const p = footer.querySelector('p');
                        if (p && p.classList.contains('footer-copyright')) {
                            p.innerHTML = `(C) ${COPYRIGHT.year} by ${COPYRIGHT.owner}`;
                        }
                    }
                }
            });
        });
        
        // Beobachte Footer-Änderungen
        const footer = document.querySelector('.footer');
        if (footer) {
            observer.observe(footer, {
                childList: true,
                subtree: true,
                characterData: true
            });
        }
    }
    
    // ===== 6. RIGHT-CLICK WARNING =====
    document.addEventListener('contextmenu', function(e) {
        if (e.ctrlKey) {
            console.log('%c⚠️ COPYRIGHT HINWEIS', 'background: #D3A625; color: white; font-size: 14px; padding: 5px 10px;');
            console.log(`Template by: ${COPYRIGHT.owner}`);
            console.log(`Website: ${COPYRIGHT.website}`);
        }
    });
    
    // ===== 7. SOURCE CODE MARKER =====
    function addSourceMarkers() {
        // Füge versteckte Copyright-Marker in Styles ein
        const style = document.createElement('style');
        style.textContent = `
            /* 
             * Template: ${COPYRIGHT.template}
             * © ${COPYRIGHT.year} ${COPYRIGHT.owner}
             * Website: ${COPYRIGHT.website}
             * WARNUNG: Copyright-Hinweise dürfen nicht entfernt werden!
             */
            
            /* Copyright Protection - DO NOT REMOVE */
            body::after {
                content: '© ${COPYRIGHT.year} ${COPYRIGHT.owner}';
                position: fixed;
                bottom: 0;
                left: 0;
                font-size: 0;
                opacity: 0;
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }
    
    // ===== 8. PERIODIC CHECK =====
    function startPeriodicCheck() {
        setInterval(() => {
            // Prüfe ob Copyright-Badge existiert
            if (!document.getElementById('copyright-protection-badge')) {
                console.warn('🔄 Copyright-Badge wird wiederhergestellt...');
                createCopyrightBadge();
            }
            
            // Prüfe Footer
            const footer = document.querySelector('.footer p');
            if (footer && footer.classList.contains('footer-copyright') && !footer.textContent.includes(COPYRIGHT.owner)) {
                footer.innerHTML = `(C) ${COPYRIGHT.year} by ${COPYRIGHT.owner}`;
            }
        }, 5000); // Alle 5 Sekunden prüfen
    }
    
    // ===== INITIALIZATION =====
    function init() {
        // Warte bis DOM geladen ist
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }
        
        showConsoleWarning();
        createCopyrightBadge();
        createHiddenMarkers();
        createWatermark();
        protectFooterCopyright();
        addSourceMarkers();
        startPeriodicCheck();
        
        console.log('%c✅ Copyright-Schutz aktiviert', 'color: #D3A625; font-weight: bold;');
    }
    
    // Start Protection
    init();
    
    // Zeige Warning bei Page Visibility Change
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            showConsoleWarning();
        }
    });
    
})();

// Final Warning
console.log('%c⚠️ DIESES TEMPLATE IST URHEBERRECHTLICH GESCHÜTZT! ⚠️', 'background: red; color: white; font-size: 16px; padding: 10px; font-weight: bold;');
console.log('%c© 2025 Michael Ostermann', 'font-size: 14px; color: #D3A625; font-weight: bold;');

