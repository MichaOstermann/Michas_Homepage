# Chatbot Training – mcgv.de Knowledge Base

Willkommen in der Knowledge-Base für den Chatbot von **mcgv.de**. Sie bündelt alle Fakten zu Michael Ostermann und den Bereichen Musik, PowerShell und Gaming.

---

## Über Michael Ostermann

- Beruf: PowerShell-Entwickler, spezialisiert auf IT-Automatisierung
- Hobbys: Elektronische Musikproduktion, Gaming-Streams, kreativer Code
- Philosophie: Alles – Code, Sound oder Gameplay – entsteht im Detail und folgt einem natürlichen Flow
- Kontakt: [support@mcgv.de](mailto:support@mcgv.de) · [Kontaktformular](https://mcgv.de/kontakt.html) (Antwort binnen 24 h)
- Auftritte: GitHub · YouTube · Twitch

---

## Musikbereich

Michael produziert elektronische Musik zu 100 % in Eigenregie und nutzt KI für Vocals, Orchestrierungen und Mastering. Genres: Ballermann/Party, Synthwave, Rock, Ambient.

### Produktionsweise

1. Komposition & Sounddesign in Eigenregie
2. KI-Unterstützung für Vocals und Mastering
3. Finale Mischung & Mastering – alles aus einer Hand

### Ausgewählte Tracks

| Titel                     | Genre  | Beschreibung                                                     | Download |
|--------------------------|--------|------------------------------------------------------------------|----------|
| Life am Strand           | Party  | Mallorca-Hitparaden-Sound über Micha den Barkeeper               | [/assets/media/track1.mp3](https://mcgv.de/assets/media/track1.mp3) |
| 20 Jahre RDMC Oldenburg  | Party  | Jubiläums-Hymne mit Crowd-Chants und Gitarren-Power              | [/assets/media/track2.mp3](https://mcgv.de/assets/media/track2.mp3) |
| Aus dem Schatten         | Rapp   | Dunkler Synthwave-Rapp mit treibendem Beat                       | [/assets/media/track3.mp3](https://mcgv.de/assets/media/track3.mp3) |
| Kein Lied für Helden     | Rock   | Kraftvoller Song mit klarer Message                              | [/assets/media/Kein%20Lied%20f%C3%BCr%20Helden.mp3](https://mcgv.de/assets/media/Kein%20Lied%20f%C3%BCr%20Helden.mp3) |
| Love 2025                | Love   | Emotionaler Electro-Track mit warmen Pads                        | [/Musik/audio/love/Love_2025.mp3](https://mcgv.de/Musik/audio/love/Love_2025.mp3) |

Weitere Infos: [mcgv.de/Musik/index.html](https://mcgv.de/Musik/index.html)

---

## PowerShell-Bereich

Produktionsreife Tools für Systemadministratoren – dokumentiert und getestet.

### Fokusfelder

- Active-Directory-Automatisierung
- Patch- und Compliance-Reports
- Archiv-Analyse

### Verfügbare Scripts & Beispiele

- **MailStore Analyse** (Archiving)  
  Funktion: Analysiert MailStore-Archive inkl. Statistik-Export.  
  Beispiel:
  ```powershell
  Get-ChildItem -Recurse "C:\MailStore" | Sort-Object Length -Descending | Select-Object -First 10
  ```

- **WSUS Scan** (Security)  
  Funktion: Prüft Windows-Server auf fehlende Updates und erzeugt HTML-Reports.  
  Beispiel:
  ```powershell
  Invoke-WebRequest -Uri "http://wsus.local/report" -UseBasicParsing
  ```

- **AD User Creation Tool v4.0** (Active Directory)  
  Funktion: Automatisiert Benutzeranlage, OU-Zuordnung und Lizenzoptionen.  
  Beispiel:
  ```powershell
  New-ADUser -Name "John Doe" -GivenName John -Surname Doe -SamAccountName j.doe
  ```

Downloads: [mcgv.de/PowerShell/](https://mcgv.de/PowerShell/)

---

## Gaming-Bereich

Koop- und Survival-Fokus, dokumentiert mit Builds, Stats und Videos.

| Spiel      | Genre          | Spielstunden | Highlights |
|------------|----------------|--------------|------------|
| Diablo IV  | Action-RPG     | 450+         | 6 Endgame-Builds, Boss-Guides, Season-Setups |
| Enshrouded | Koop-Survival  | 180+         | Base-Building, Tank/Ranger/Magier-Setups    |
| Soulmask   | Tribal Survival| 280+         | 38 Stammesmitglieder, Raid-Strategien       |
| ARK        | Dino-Survival  | 1200+        | 180+ Dinos, 45 Bosse, Breeding-Pläne        |

Details: [mcgv.de/gaming/](https://mcgv.de/gaming/)

---

## Blog & Updates

Aktuelle Artikel: [mcgv.de/blog/index.html](https://mcgv.de/blog/index.html)

- Musik-Sektion neu aufgebaut – Upload-Flow, Cover-Generator, Statistiken & SEO
- Gaming-Sektion massiv erweitert – Vier Game-Hubs mit Builds & Videos
- Alien Bio-Tech Hero-Sektion – Making-of der animierten Startseite

---

## Häufige Fragen

- **Kann ich Songs herunterladen?**  
  Ja, alle Songs bieten MP3- und WAV-Downloads direkt auf den Karten.

- **Wie lösche ich Songs?**  
  Über die passwortgeschützte Verwaltung `manage.php` werden Audio, Cover und JSONs automatisch entfernt.

- **Ist mcgv.de kommerziell?**  
  Nein, die Seite ist privat und nicht kommerziell.

- **Wie erreiche ich Michael?**  
  Über das Kontaktformular oder per Mail an [support@mcgv.de](mailto:support@mcgv.de).

---

_Bleib gespannt – auf mcgv.de kann alles passieren!_

