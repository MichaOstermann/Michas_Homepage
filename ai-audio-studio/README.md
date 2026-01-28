# 🎵 AI Audio Studio - Lokaler Test

## 🚀 Quick Start (3 Schritte)

### 1. Dependencies installieren
```powershell
cd "D:\Michas Homepage\ai-audio-studio"
npm install
```

### 2. Environment Variables konfigurieren
```powershell
# .env Datei erstellen (kopiere .env.example)
copy .env.example .env

# Dann .env bearbeiten und echte API Keys eintragen:
# OPENAI_API_KEY=sk-...
# ELEVENLABS_API_KEY=...
```

### 3. Test Server starten
```powershell
npm test
```

**Server läuft jetzt auf: http://localhost:3000**

## 🌐 Frontend öffnen

1. Live Server in VS Code starten (Port 5500)
2. Browser öffnen: http://127.0.0.1:5500/ai-audio-studio/

## ✅ Jetzt ECHT testen (kein Demo-Modus mehr!)

### Was funktioniert:
- ✅ **Echte API Calls** - keine Mock-Daten mehr
- ✅ **Klare Error-Messages** - siehst genau was schief läuft
- ✅ **Auth System** - Register/Login testen
- ✅ **Lyrics Generation** - mit echtem OpenAI
- ✅ **Übersetzungen** - DE ↔ EN
- ✅ **Edit Mode** - Lyrics bearbeiten
- ✅ **Copy/Download** - funktioniert

### Test-Ablauf:

#### 1. Lyrics Generator testen
```
1. http://127.0.0.1:5500/ai-audio-studio/lyrics-generator/
2. Sprache wählen (DE/EN)
3. Genre wählen (z.B. Trap)
4. Mood wählen (z.B. Dark)
5. Optional: Thema eingeben
6. "Lyrics Generieren" klicken
7. Warte auf ECHTE API Response (oder ERROR!)
```

#### 2. Edit Mode testen
```
1. Nach erfolgreicher Generierung
2. "Bearbeiten" Button klicken
3. Text ändern
4. "Änderungen speichern" klicken
```

#### 3. Translation testen
```
1. "Übersetzen" Button klicken
2. Wartet auf ECHTE API Response
3. Zeigt übersetzten Text ODER Error
```

#### 4. Actions testen
```
- "Kopieren" → kopiert in Zwischenablage
- "Download" → lädt .txt Datei herunter
- "Im Studio verwenden" → speichert in localStorage
```

## 🐛 Fehlersuche

### API Connection Failed?
```javascript
// Browser Console (F12) öffnen
// Network Tab → /api/generate prüfen

// Mögliche Fehler:
× CORS Error → Test Server läuft nicht
× 500 Error → API Key fehlt (.env)
× 401 Error → Login erforderlich
× Timeout → Netzwerk Problem
```

### API Key Fehler?
```
⚠️ OPENAI_API_KEY nicht konfiguriert!
→ .env Datei erstellen mit echtem Key
```

### Test Server läuft nicht?
```powershell
# Prüfen ob Port 3000 frei ist
netstat -ano | findstr :3000

# Prozess killen falls nötig
taskkill /PID <PID> /F

# Neu starten
npm test
```

## 📊 API Endpoints Testing

### Health Check
```powershell
curl http://localhost:3000/api/health
```

### Register
```powershell
curl -X POST http://localhost:3000/api/register `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"test123"}'
```

### Login
```powershell
curl -X POST http://localhost:3000/api/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"test123"}'
```

### Generate Lyrics
```powershell
curl -X POST http://localhost:3000/api/generate `
  -H "Content-Type: application/json" `
  -d '{"model":"gpt-4o","prompt":"Write a trap song","maxTokens":2000}'
```

## 🎯 Was wurde geändert?

### Vorher (Demo-Modus):
```javascript
// Zeigt immer Mock-Daten wenn API fehlschlägt
if (!response.ok) {
  data = { text: generateMockLyrics(...) };
}
```

### Jetzt (Echter Test):
```javascript
// Zeigt ECHTE Fehler
if (!response.ok) {
  throw new Error(`API Error: ${response.status}`);
}
// User sieht: "× API Error: 500 Internal Server Error"
```

## 🔥 Benefits

1. **Echte Fehler finden** - keine versteckten Probleme mehr
2. **API Testing** - siehst genau was schief läuft
3. **Production-Ready** - Code ist bereit für Live-Deploy
4. **Debug-Friendly** - alle Errors in Console + UI

## 📝 Nächste Schritte

1. ✅ Lokalen Test Server starten
2. ✅ Alle Features durchklicken
3. ⏳ Bugs dokumentieren
4. ⏳ Fixes implementieren
5. ⏳ Production Deploy

---

**Status**: Ready for REAL testing! 🚀🔥

Keine Simulationen mehr - jetzt geht's los!
