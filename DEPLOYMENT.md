# 1:1 Upload Deployment

Ziel: Alles einfach hochladen – ohne extra Server‑Setup.

## Schritte
- Passwort vorbereiten: Lege im Projekt‑Root eine Datei `smtp-pass.txt` an. Inhalt: Nur das SMTP‑Passwort (eine Zeile, keine Leerzeichen). Dieser Datei wird nicht committet und ist nur für den Server.
- Alles hochladen: Den gesamten Ordner 1:1 auf den Webspace (Domain‑Root), inklusive Unterordnern `assets/`, `templates/`, `blog/`, `Musik/`, etc.
- Fertig: Keine ENV‑Variablen, kein Composer, keine DB.

## Was passiert serverseitig
- SMTP: `mail-config.php` liest automatisch in dieser Reihenfolge:
  1) `SMTP_PASSWORD` (ENV)
  2) `smtp-pass.enc` (falls mit ENV‑Key/IV vorhanden)
  3) `smtp-pass.txt` (einfachste Variante)
- Fallback: Falls SMTP scheitert, wird `mail()` genutzt. Logs werden im Webroot als `contact-log.txt`, `newsletter-subscribers.log`, `template-requests.log` geschrieben.
- Ratings: `template-ratings.json` liegt bereits im Root und wird für Bewertungen genutzt.

## Nach dem Upload testen
- Kontakt: POST an `/contact-simple.php` über das Formular.
- Newsletter: POST an `/newsletter-subscribe.php` über das Formular.
- Templates: Öffne `/templates/` → Karte anklicken → „Download anfragen“. Server schreibt Logs und sendet E‑Mail.

## Anforderungen (typisch bei Shared Hosting schon gegeben)
- PHP 7.4 oder 8.x
- Ausgehende Verbindung zu `smtps.udag.de:465` (SSL) erlaubt
- Schreibrechte im Webroot für Log‑ und Ratings‑Dateien

## Troubleshooting kurz
- Keine Admin‑Mail? Prüfe `smtp-pass.txt` Inhalt/Datei, Logs (`*-log.txt`). Bei Bedarf Port auf 587/TLS in `mail-config.php` umstellen.
- Stale JS/CSS? Hart aktualisieren (Ctrl+F5) oder Cache‑Buster Query anhängen.