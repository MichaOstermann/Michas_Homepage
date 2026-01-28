# 🧪 AI Audio Studio - Test Setup

## ✅ Was wurde geändert:

### 1. **Demo-Modus entfernt**
- ❌ Keine Mock-Lyrics mehr
- ✅ Echte API-Calls mit echten Fehlermeldungen
- ✅ Klare Error-Messages wenn API nicht funktioniert

### 2. **Echter Test-Modus**
```javascript
// VORHER (Demo-Modus):
if (useDemoMode || !response || !response.ok) {
  // Zeige Mock-Lyrics
  data = { text: generateMockLyrics(...) };
}

// JETZT (Echter Test):
const response = await fetch('/api/generate', { ... });

if (!response.ok) {
  throw new Error(`API Error: ${response.status}`);
}
```

## 🚀 Lokale Test-Optionen:

### Option 1: Mit lokalem Backend (Empfohlen)
```powershell
# 1. Backend starten (Node.js Server)
cd api
node server.js

# 2. Frontend öffnen
# http://127.0.0.1:5500/ai-audio-studio/lyrics-generator/
```

### Option 2: Mit Mock-API-Server
```javascript
// api/mock-server.js erstellen
const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/generate', (req, res) => {
  res.json({
    text: `[INTRO]\nTest Lyrics\n[VERSE 1]\n...`
  });
});

app.listen(3000);
```

### Option 3: Mit Browser Extension (Local Override)
1. DevTools öffnen (F12)
2. Sources → Overrides
3. `/api/generate` Response überschreiben

## 📋 Test-Checklist:

### Lyrics Generator Tests:
- [ ] **API Connection**
  - API erreichbar?
  - Fehler klar angezeigt?
  
- [ ] **Lyrics Generation**
  - Language Selection (DE/EN)
  - Genre Selection
  - Mood Selection
  - Theme Input
  - Generate Button funktioniert?
  
- [ ] **Edit Mode**
  - Edit Button aktiviert Textarea
  - Änderungen speichern
  - Cancel funktioniert
  
- [ ] **Translation**
  - DE → EN
  - EN → DE
  - API Error klar angezeigt
  
- [ ] **Actions**
  - Copy to Clipboard
  - Download als .txt
  - "Im Studio verwenden" (localStorage)

### Song Creator Tests:
- [ ] Genre & Atmosphere Selection
- [ ] BPM Slider
- [ ] Lyrics Import (von Lyrics Generator)
- [ ] Generate funktioniert?
- [ ] Audio Player funktioniert?

### Error Testing:
- [ ] API offline → Klare Fehlermeldung
- [ ] API 401 → "Nicht authorisiert"
- [ ] API 500 → "Server Error"
- [ ] Netzwerk Timeout → "Verbindungsfehler"

## 🔧 API Endpoints die getestet werden:

### `/api/generate` (POST)
```json
Request:
{
  "model": "gpt-4o",
  "prompt": "...",
  "maxTokens": 2000
}

Response Success:
{
  "text": "[INTRO]\n..."
}

Response Error:
{
  "error": "Fehler-Beschreibung"
}
```

### `/api/login` (POST)
```json
Request:
{
  "email": "test@example.com",
  "password": "password123"
}

Response:
{
  "token": "jwt-token",
  "user": { "email": "...", "isAdmin": false }
}
```

## 🐛 Bekannte Issues zum Testen:

1. **CORS Errors**
   - Lokaler Server muss CORS Headers setzen
   
2. **Auth Token Handling**
   - Token wird in localStorage gespeichert
   - Beim nächsten Besuch automatisch verwendet
   
3. **File Downloads**
   - Browser blockt evtl. Downloads
   - User muss Downloads erlauben

## 💡 Tipps zum Fehler finden:

### Browser Console öffnen (F12)
```javascript
// Alle Errors werden geloggt:
console.error('Lyrics generation error:', err);

// Network Tab prüfen:
// - Welche Requests werden gemacht?
// - Was ist die Response?
// - Welcher Status Code?
```

### Notification System
Alle User-Feedback läuft über Notifications:
- ✅ `'success'` - Grün
- ❌ `'error'` - Rot  
- ℹ️ `'info'` - Blau

## 🎯 Nächste Schritte:

1. ✅ Demo-Modus entfernt
2. ⏳ Backend API Setup
3. ⏳ Test alle Features
4. ⏳ Bugs fixen
5. ⏳ Production Deploy

---
**Status**: Ready for real testing! 🚀
