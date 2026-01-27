// Vercel Serverless Function – sichere API-Anbindung
// API-Key wird aus Umgebungsvariable gelesen (.env)
import OpenAI from "openai";

export default async function handler(req, res) {
  // CORS-Header für lokale Entwicklung
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Nur POST erlaubt" });
  }
  
  const { provider, systemPrompt } = req.body || {};
  
  if (!provider || !systemPrompt) {
    return res.status(400).json({ error: "Provider und systemPrompt sind erforderlich" });
  }
  let result = "";
  try {
    if (provider === "openai") {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "OpenAI API-Key nicht konfiguriert. Bitte .env-Datei prüfen." });
      }
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Bitte generiere den Songtext." }
        ],
        max_tokens: 900,
        temperature: 0.92
      });
      result = completion.choices?.[0]?.message?.content || "Keine Lyrics generiert.";
    } else {
      return res.status(400).json({ error: "Ungültiger Provider - nur 'openai' wird unterstützt" });
    }
    res.status(200).json({ lyrics: result });
  } catch (err) {
    console.error('Backend-Fehler:', err);
    res.status(500).json({ error: err.message || "Serverfehler bei der Lyrics-Generierung" });
  }
}
