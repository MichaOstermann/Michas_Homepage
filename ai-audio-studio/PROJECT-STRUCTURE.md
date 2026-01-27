# 🎵 AI Audio Studio - Projektstruktur

**Professionelle Modulare Architektur**

## 📂 Ordnerstruktur

```
ai-audio-studio/
│
├── index.html              # Hub Landing Page (Eingangsbereich)
├── styles.css              # Hub Styles
├── script.js               # Hub Script
│
├── lyrics-generator/       # 📝 Songtext Generator (Modul 1)
│   ├── index.html
│   ├── styles.css
│   └── script.js
│
├── song-creator/           # 🎵 Song Erstellen (Modul 2)
│   ├── index.html
│   ├── styles.css
│   └── script.js
│
├── video-creator/          # 🎬 Video Erstellen (Modul 3) - Coming Soon
│   └── README.md
│
└── _backups/               # Alte Versionen (nicht in Produktion)
```

## 🎯 Module

### Hub (Eingangsbereich)
- **Funktion:** Landing Page mit 3 visuellen Bereichen
- **Features:** Hero Section, Card Grid, Workflow Steps, Auth System
- **Links:** 
  - Lyrics Generator → `lyrics-generator/`
  - Song Creator → `song-creator/`
  - Video Creator → Coming Soon

### 📝 Lyrics Generator
- **Pfad:** `/ai-audio-studio/lyrics-generator/`
- **Funktion:** Premium AI Songtext-Generierung
- **Features:**
  - 8 Genres, 6 Stimmungen
  - Premium Prompt Engineering (Show-Don't-Tell, Slant Rhymes, Anti-Klischee)
  - Struktur-Templates, Reimschema-Kontrolle
  - Artist Style Referenz
  - Export: Kopieren, Download, "Im Studio verwenden"
- **API:** `/api/generate` (GPT-4o)
- **Workflow:** Lyrics generieren → localStorage → Song Creator

### 🎵 Song Creator
- **Pfad:** `/ai-audio-studio/song-creator/`
- **Funktion:** Complete Song Production mit Vocals
- **Features:**
  - Genre & BPM Kontrolle
  - Atmosphere & Vocal Style
  - Lyrics Input (manuell oder aus Generator)
  - Professional Mastering (-14 LUFS)
  - Audio Download & History
- **API:** `/api/generate-music` (ElevenLabs Music)
- **Workflow:** Lyrics einfügen → Song generieren → Download

### 🎬 Video Creator (Coming Soon)
- **Pfad:** `/ai-audio-studio/video-creator/`
- **Funktion:** Audio-to-Video Generation
- **Geplante Features:**
  - Beat-Synchronized Visuals
  - Album Cover Integration
  - Style Prompts
- **API:** ByteDance Seedance 1.5 Pro ($0.052/sec)

## 🔧 Workflow Integration

```
1. Lyrics Generator
   ↓ (localStorage: pendingLyrics)
2. Song Creator
   ↓ (Audio File + Album Cover)
3. Video Creator (Future)
   ↓
4. Final Music Video
```

## ✅ Vorteile dieser Struktur

1. **Modular:** Jedes Modul ist isoliert entwickelbar
2. **Skalierbar:** Neue Module einfach hinzufügen
3. **Wartbar:** Keine Code-Überschneidungen
4. **Performance:** Kein Laden ungenutzter Ressourcen
5. **Professionell:** Klare Trennung von Verantwortlichkeiten

## 🚀 Development Workflow

- **Einzeln abarbeiten:** Jedes Modul kann isoliert getestet werden
- **Keine Überladung:** Nur aktive Dateien im jeweiligen Bereich
- **Clean Code:** Jede Datei hat einen klaren Zweck

---

**Status:** ✅ Hub + Lyrics Generator + Song Creator fertig | 🚧 Video Creator in Planung
