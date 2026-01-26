// ⚠️ PROTECTED CODE - FAMILY TEMPLATE
// © 2025 CodeBeats - All Rights Reserved
// Unified Demo Protection – © 2025 CodeBeats
(function(){
  'use strict';
  try {
    var allowedHost = /(mcgv|codebeats|localhost|127\.0\.0\.1)/i;
    var hostOk = allowedHost.test(location.hostname || '');
    var ref = document.referrer || '';
    var refOk = allowedHost.test(ref);

    function injectNoIndex(){
      var m = document.querySelector('meta[name="robots"]');
      if (!m) {
        m = document.createElement('meta');
        m.name = 'robots';
        m.content = 'noindex, nofollow, noimageindex, noarchive';
        document.head && document.head.appendChild(m);
      } else if (!/noimageindex|noarchive/.test(m.content)) {
        m.content = 'noindex, nofollow, noimageindex, noarchive';
      }
    }

    function hardenUI(){
      document.addEventListener('contextmenu', function(e){ e.preventDefault(); }, {capture:true});
      document.addEventListener('dragstart', function(e){ e.preventDefault(); }, {capture:true});
      document.addEventListener('keydown', function(e){
        var k = e.key.toLowerCase();
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['i','j','c'].includes(k)) || (e.ctrlKey && ['s','u','p'].includes(k))) {
          e.preventDefault(); e.stopPropagation(); return false;
        }
      }, true);
    }

    function showOverlay(){
      var overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.inset = '0';
      overlay.style.zIndex = '999999';
      overlay.style.background = 'rgba(0,0,0,0.94)';
      overlay.style.backdropFilter = 'blur(4px)';
      overlay.style.color = '#aef';
      overlay.style.display = 'flex';
      overlay.style.flexDirection = 'column';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.textAlign = 'center';
      overlay.style.padding = '24px';
      overlay.innerHTML = '<h2 style="margin:0 0 12px; font: 700 22px/1.2 system-ui,Segoe UI">Geschützte Demo</h2>'+
        '<p style="max-width:720px; font: 400 14px/1.6 system-ui,Segoe UI; color:#def">Diese Template‑Demo ist nur als Vorschau auf mcgv/CodeBeats gedacht und darf nicht direkt von extern verlinkt, kopiert oder archiviert werden.</p>'+
        '<div style="margin-top:18px; display:flex; gap:10px; justify-content:center">'+
        '<a href="/templates/" style="background:#09f;color:#001;padding:10px 14px;border-radius:8px;text-decoration:none;font:600 14px system-ui">Zur Templates‑Übersicht</a>'+
        '</div>';
      document.body.appendChild(overlay);
    }

    document.addEventListener('DOMContentLoaded', function(){
      injectNoIndex();
      hardenUI();
      if (!hostOk && !refOk) showOverlay();
    });
  } catch(err) {
    try { console.warn('[protect] error', err); } catch(_){}
  }
})();