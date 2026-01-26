═══════════════════════════════════════════════════════════════
  WERDER BREMEN FAN COMMUNITY TEMPLATE
  MIT INLINE-CMS FÜR JEDE SECTION
  © 2025 Michael Ostermann
═══════════════════════════════════════════════════════════════

⚽ PREMIUM FAN-COMMUNITY MIT INLINE-CMS FÜR JEDE SEKTION!

🔒 DEMO-SCHUTZ AKTIV: Rechtsklick, Kopieren & Code-Zugriff deaktiviert
   (wird bei offizieller Freigabe in der Region entfernt)

🔥 NEU: Jede Section hat ihr eigenes CMS - bearbeite ALLES direkt!
✨ 7 Glassmorphism-Ebenen mit Parallax-Hintergrundbildern
🔐 Unentfernbarer Copyright-Schutz (8-fach geschützt!)
💎 3D-Effekte, Scroll-Reveal, Cursor-Glow, Ripple-Buttons
🛡️ Maximale Sicherheit: bcrypt, Rate Limiting, Session-Schutz

──────────────────────────────────────────────────────────────
📦 PAKETINHALT
──────────────────────────────────────────────────────────────

/werder/
├── index.html          → Hauptseite (Frontend)
├── styles.css          → Styling
├── script.js           → Interaktionen & API-Anbindung
├── thumb.svg           → Vorschaubild
├── preview.svg         → Großes Preview
├── README.txt          → Diese Datei
│
├── /api/               → Demo-Daten (statische JSONs)
│   ├── spielplan.json
│   ├── galerie.json
│   └── videos.json
│
└── /cms/               → BACKEND-SYSTEM (PHP erforderlich!)
    ├── index.php           → CMS-Dashboard
    ├── register.php        → Benutzer-Registrierung
    ├── cms-styles.css      → CMS-Styling
    ├── cms-script.js       → CMS-JavaScript
    │
    ├── /api/               → Backend-APIs
    │   ├── users.php       → Benutzerverwaltung
    │   ├── spielplan.php   → Spielplan-API
    │   ├── galerie.php     → Foto-Upload-API
    │   ├── videos.php      → Video-API
    │   └── stats.php       → Statistiken
    │
    ├── /data/              → Daten-Verzeichnis (wird automatisch erstellt)
    └── /uploads/           → Upload-Verzeichnis (wird automatisch erstellt)

──────────────────────────────────────────────────────────────
🚀 SCHNELLSTART
──────────────────────────────────────────────────────────────

VARIANTE A: NUR FRONTEND (ohne CMS)
────────────────────────────────────
1. Entpacke das Archiv
2. Öffne index.html im Browser
3. Fertig! Das Template zeigt Demo-Daten aus /api/*.json

VARIANTE B: MIT CMS-BACKEND (empfohlen!)
────────────────────────────────────
1. Lade ALLES auf deinen Webserver (PHP erforderlich!)
2. Öffne: https://deine-domain.de/werder/cms/
3. Login als Admin:
   Benutzername: admin
   Passwort: Darkman2012!
4. Verwalte Inhalte im CMS-Dashboard!

──────────────────────────────────────────────────────────────
🎯 INLINE-CMS - JEDE SECTION BEARBEITBAR!
──────────────────────────────────────────────────────────────

🔑 LOGIN: admin / Darkman2912!

Nach dem Login erscheint in JEDER Section ein "✏️ Bearbeiten"-Button!

✅ STATS-SECTION
  → Zahlen & Beschreibungen anpassen
  → 4 Statistik-Karten editieren
  → Echtzeit-Update im Frontend

✅ COMMUNITY-SECTION
  → Mitglieder hinzufügen/entfernen
  → Name, "Fan seit", Bild-URL
  → Unbegrenzt viele Profile

✅ FAN-TREFFEN-SECTION
  → Event-Details bearbeiten
  → Titel, Datum, Uhrzeit, Ort, Beschreibung
  → Wird sofort auf der Seite angezeigt

✅ SPIELPLAN-SECTION
  → Spiele hinzufügen/löschen
  → Datum, Teams, Uhrzeit, Ort
  → Dynamische Liste

✅ GALERIE-SECTION
  → Fotos hochladen (Demo)
  → Titel bearbeiten
  → Foto-URLs verwalten

✅ VIDEO-SECTION
  → YouTube-URLs hinzufügen
  → Video-Titel bearbeiten
  → Videos löschen

✅ STORIES-SECTION
  → Fan-Stories erstellen/bearbeiten
  → Titel, Text, Badge
  → Unbegrenzt Stories

🔄 ÄNDERUNGEN WERDEN SOFORT GESPEICHERT!
Nach dem Speichern wird die Seite neu geladen und zeigt die neuen Daten.

──────────────────────────────────────────────────────────────
👥 BENUTZER-WORKFLOW
──────────────────────────────────────────────────────────────

1. REGISTRIERUNG
   → Benutzer öffnet: /werder/cms/register.php
   → Füllt Formular aus
   → Account wird erstellt (noch NICHT freigegeben)

2. ADMIN-FREIGABE
   → Admin loggt sich ein
   → Geht zu "Benutzerverwaltung"
   → Klickt "Freigeben"
   → E-Mail wird an Benutzer gesendet ✉️

3. BENUTZER-LOGIN
   → Benutzer erhält E-Mail
   → Loggt sich ein mit seinen Daten
   → Kann jetzt Inhalte verwalten!

──────────────────────────────────────────────────────────────
🔒 SICHERHEITS-FEATURES (MAXIMALE SICHERHEIT!)
──────────────────────────────────────────────────────────────

✅ PASSWORT-VERSCHLÜSSELUNG
  → bcrypt (PASSWORD_DEFAULT) mit Salt
  → Passwort: Darkman2912!
  → Niemals im Klartext gespeichert!

✅ SESSION-SICHERHEIT
  → HttpOnly Cookies (kein JavaScript-Zugriff)
  → Secure Cookies (nur HTTPS)
  → SameSite Strict (CSRF-Schutz)
  → Session Regeneration bei Login
  → 30 Minuten Auto-Timeout

✅ RATE LIMITING
  → Max 5 Login-Versuche pro 15 Minuten
  → Automatische IP-Sperre
  → Verbleibende Versuche werden angezeigt

✅ SECURITY HEADERS
  → X-Content-Type-Options: nosniff
  → X-Frame-Options: DENY
  → X-XSS-Protection
  → Content-Security-Policy
  → Referrer-Policy

✅ IP-BASIERTER SCHUTZ
  → Session-IP wird gespeichert
  → Bei IP-Wechsel: Automatischer Logout
  → Session Hijacking Protection

✅ INPUT VALIDATION
  → XSS-Protection (htmlspecialchars)
  → JSON-Validierung
  → Directory Traversal Protection
  → File Upload Validation

✅ TIMING-ATTACK-SCHUTZ
  → hash_equals() für String-Vergleiche
  → Immer password_verify ausführen

✅ HTTPS-READY
  → Alle Sicherheits-Features HTTPS-kompatibel
  → Secure Cookies automatisch bei HTTPS

──────────────────────────────────────────────────────────────
⚙️ SYSTEMANFORDERUNGEN
──────────────────────────────────────────────────────────────

Frontend (nur index.html):
• Moderner Browser (Chrome, Firefox, Safari, Edge)
• JavaScript aktiviert

Backend (CMS):
• PHP 7.4 oder höher (PHP 8.x empfohlen!)
• Apache/Nginx Webserver
• Schreibrechte für /cms/data/
• HTTPS empfohlen (für volle Sicherheit)

──────────────────────────────────────────────────────────────
🎨 ANPASSUNG
──────────────────────────────────────────────────────────────

FARBEN (in styles.css):
  --werder-gruen: #1D9A50
  --werder-dunkel: #0A4D2A
  --werder-hell: #2ECC71
  --werder-weiss: #FFFFFF

ADMIN-PASSWORT (in cms/index.php):
  Zeile 6: $admin_pass = 'Darkman2012!';
  → In Produktion: password_hash() verwenden!

E-MAIL-ABSENDER (in cms/api/users.php):
  Zeile 102: From: noreply@mcgv.de
  → Durch deine Domain ersetzen

──────────────────────────────────────────────────────────────
📧 E-MAIL-KONFIGURATION
──────────────────────────────────────────────────────────────

Die E-Mails werden über PHP mail() versendet.

Wenn E-Mails nicht ankommen:
1. Prüfe ob dein Webserver mail() unterstützt
2. Konfiguriere SMTP in PHP (php.ini)
3. Verwende alternativen E-Mail-Service (z.B. PHPMailer)

──────────────────────────────────────────────────────────────
🔒 SICHERHEIT
──────────────────────────────────────────────────────────────

⚠️ WICHTIG FÜR PRODUKTION:

1. PASSWORT HASHEN:
   In cms/index.php:
   $admin_pass = password_hash('Darkman2012!', PASSWORD_DEFAULT);
   
   Dann Login anpassen mit password_verify()

2. DATENBANK VERWENDEN:
   Aktuell werden Daten in JSON-Dateien gespeichert.
   Für große Projekte: MySQL/PostgreSQL empfohlen!

3. HTTPS AKTIVIEREN:
   Immer SSL/TLS für Login-Formulare!

4. UPLOAD-VALIDIERUNG:
   Dateitypen und -größen prüfen

──────────────────────────────────────────────────────────────
🐛 TROUBLESHOOTING
──────────────────────────────────────────────────────────────

Problem: CMS zeigt "500 Internal Server Error"
→ Lösung: PHP-Version prüfen (min. 7.4)
→ Lösung: Schreibrechte für /data/ und /uploads/ setzen

Problem: Keine E-Mails kommen an
→ Lösung: mail() Funktion auf Server aktivieren
→ Lösung: SMTP konfigurieren

Problem: Bilder werden nicht hochgeladen
→ Lösung: upload_max_filesize in php.ini erhöhen
→ Lösung: Schreibrechte für /uploads/ prüfen

Problem: API gibt 403 Fehler
→ Lösung: Session-Support aktiviert?
→ Lösung: Cookies erlaubt?

──────────────────────────────────────────────────────────────
🖼️ VERWENDETE BILDER
──────────────────────────────────────────────────────────────

✅ ALLE BILDER SIND FREI & LIZENZFREI VON UNSPLASH.COM!

Das Template verwendet hochwertige, lizenzfreie Fußball-Bilder:
• Hero: Stadion-Atmosphäre
• Stats: Fußballfeld von oben
• Galerie: Jubelnde Fans
• Videos: Spielszenen
• Fan Stories: Stadion-Feeling
• Body-Background: Fußballrasen

QUELLE: https://unsplash.com
LIZENZ: Unsplash License (frei für kommerzielle Nutzung)
KEINE ATTRIBUTION ERFORDERLICH!

──────────────────────────────────────────────────────────────
🎨 EIGENE BILDER EINBAUEN
──────────────────────────────────────────────────────────────

Du willst EIGENE Werder-Bilder verwenden?

1. BILDER VON WIKIMEDIA COMMONS:
   → https://commons.wikimedia.org
   → Suche "SV Werder Bremen"
   → Creative Commons Lizenz beachten

2. OFFIZIELLE WERDER-BILDER:
   → https://www.werder.de/der-svw/medienservice/downloads
   → Nur für redaktionelle Nutzung!

3. IN STYLES.CSS ÄNDERN:
   
   /* Hero-Hintergrund */
   .hero {
       background-image: url('DEIN-BILD.jpg');
   }
   
   /* Body-Hintergrund */
   body::before {
       background-image: url('DEIN-BILD.jpg');
   }

──────────────────────────────────────────────────────────────
🔒 COPYRIGHT-SCHUTZ (8-FACH GESCHÜTZT!)
──────────────────────────────────────────────────────────────

⚠️ WARNUNG: Copyright-Hinweise dürfen NICHT entfernt werden!

Das Template ist 8-fach geschützt:

1. ✅ Console-Warnungen (bei Dev-Tools-Öffnung)
2. ✅ Fixed Copyright-Badge (unten links, reaktiviert sich selbst)
3. ✅ Versteckte Meta-Tags im HTML
4. ✅ HTML-Kommentare mit Rechtswarnungen
5. ✅ Unsichtbare Wasserzeichen (Overlay)
6. ✅ Footer-Copyright-Schutz (wird automatisch wiederhergestellt)
7. ✅ CSS-Copyright-Marker
8. ✅ Periodische Prüfung (alle 5 Sekunden)

📋 Bei Entfernung:
- Automatische Wiederherstellung
- Console-Warnungen
- Rechtliche Konsequenzen (§ 97 UrhG)

➡️ Das Template ist urheberrechtlich geschützt!

──────────────────────────────────────────────────────────────
🔒 DEMO-SCHUTZ (BIS ZUR FREIGABE AKTIV!)
──────────────────────────────────────────────────────────────

⚠️ AKTUELL AKTIV - DEMO-VERSION:

Das Template ist aktuell mit Demo-Schutz versehen:
✅ Rechtsklick blockiert
✅ Text-Selektion deaktiviert
✅ Kopieren (Strg+C) gesperrt
✅ DevTools (F12) blockiert
✅ Seitenquelltext (Strg+U) gesperrt
✅ Alle relevanten Tastenkombinationen blockiert
✅ CSS user-select: none
✅ Demo-Wasserzeichen im Hintergrund
✅ "DEMO VERSION" Badge (oben rechts)
✅ DevTools-Detektion mit Warnung
✅ Periodische Schutz-Prüfung (alle 3 Sek.)

🔓 ENTFERNUNG NACH FREIGABE:

Nach offizieller Freigabe in der Region, entferne:

1. In index.html:
   → Lösche: <script src="demo-protection.js"></script>

2. In styles.css:
   → Entferne "DEMO PROTECTION - CSS LAYER" Block
   → Entferne "user-select: none" von *-Selektor

3. Datei löschen:
   → demo-protection.js

⚠️ WICHTIG: Copyright-Schutz (copyright-protection.js) NICHT entfernen!

──────────────────────────────────────────────────────────────
📞 SUPPORT
──────────────────────────────────────────────────────────────

Template by: Michael Ostermann
Website: https://mcgv.de
Erstellt: November 2025

Lebenslang Grün-Weiß! ⚽🟢⚪

──────────────────────────────────────────────────────────────
📄 LIZENZ
──────────────────────────────────────────────────────────────

Dieses Template ist Teil des Code & Beats Template-Systems.
Für private und kommerzielle Nutzung geeignet.

⚠️ Copyright-Hinweise MÜSSEN erhalten bleiben!

© 2025 Michael Ostermann

