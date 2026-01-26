(function () {
  var STORAGE_KEY = 'cb_cookie_consent';
  var CONSENT_VALUES = { accepted: 'accepted', declined: 'declined' };
  function hasConsent() {
    try {
      return !!localStorage.getItem(STORAGE_KEY);
    } catch (_) {
      return document.cookie.indexOf(STORAGE_KEY + '=') !== -1;
    }
  }
  function setConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (_) {
      var d = new Date();
      d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000);
      document.cookie = STORAGE_KEY + '=' + value + '; expires=' + d.toUTCString() + '; path=/; SameSite=Lax';
    }
  }
  function injectStyles() {
    var css = '\
.cb-cookie-banner{position:fixed;left:0;right:0;bottom:0;z-index:9999;background:rgba(11,15,22,0.98);color:#E5E7EB;border-top:1px solid rgba(6,255,240,0.25);box-shadow:0 -6px 30px rgba(0,0,0,0.35);}\
.cb-cookie-inner{max-width:1100px;margin:0 auto;padding:1rem;display:flex;gap:1rem;align-items:center;justify-content:space-between;flex-wrap:wrap}\
.cb-cookie-text{flex:1 1 600px;font-size:.95rem;line-height:1.5}\
.cb-cookie-actions{display:flex;gap:.5rem}\
.cb-btn{appearance:none;border:none;cursor:pointer;border-radius:8px;padding:.65rem 1rem;font-weight:800}\
.cb-btn-accept{background:linear-gradient(135deg,#06FFF0,#8B5CF6);color:#0B0F16}\
.cb-btn-decline{background:transparent;color:#E5E7EB;border:1px solid rgba(255,255,255,0.25)}\
@media (max-width:640px){.cb-cookie-inner{padding:1rem}.cb-cookie-actions{width:100%;justify-content:flex-end}}';
    var el = document.createElement('style');
    el.type = 'text/css';
    el.appendChild(document.createTextNode(css));
    document.head.appendChild(el);
  }
  function buildBanner() {
    var banner = document.createElement('div');
    banner.className = 'cb-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    var inner = document.createElement('div');
    inner.className = 'cb-cookie-inner';
    var text = document.createElement('div');
    text.className = 'cb-cookie-text';
    text.innerHTML =
      'Wir verwenden nur technisch notwendige Cookies für Funktionalität (z. B. Formular‑Schutz). ' +
      'Weitere Daten werden nicht erhoben. Details: <a href="/datenschutz.html" style="color:#06FFF0">Datenschutz</a> · ' +
      '<a href="/impressum.html" style="color:#06FFF0">Impressum</a>';
    var actions = document.createElement('div');
    actions.className = 'cb-cookie-actions';
    var accept = document.createElement('button');
    accept.className = 'cb-btn cb-btn-accept';
    accept.type = 'button';
    accept.textContent = 'Akzeptieren';
    var decline = document.createElement('button');
    decline.className = 'cb-btn cb-btn-decline';
    decline.type = 'button';
    decline.textContent = 'Ablehnen';
    accept.addEventListener('click', function () {
      setConsent(CONSENT_VALUES.accepted);
      banner.remove();
    });
    decline.addEventListener('click', function () {
      setConsent(CONSENT_VALUES.declined);
      banner.remove();
    });
    actions.appendChild(decline);
    actions.appendChild(accept);
    inner.appendChild(text);
    inner.appendChild(actions);
    banner.appendChild(inner);
    document.body.appendChild(banner);
  }
  function init() {
    if (hasConsent()) return;
    injectStyles();
    buildBanner();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();



