// Vercel Serverless Function – sichere API-Anbindung
// API-Key wird aus Umgebungsvariable gelesen (.env)
import { OpenAI } from "openai";
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Nur POST erlaubt" });
  }
  const { provider, systemPrompt } = req.body;
  let result = "";
  try {
    if (provider === "openai") {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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
    } else if (provider === "anthropic") {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey
        },
        body: JSON.stringify({
          model: "claude-3.5-sonnet-20240606",
          max_tokens: 900,
          temperature: 0.92,
          messages: [
            { role: "user", content: systemPrompt }
          ]
        })
      });
      if (!response.ok) throw new Error("Fehler bei der KI-Antwort (Anthropic)");
      const data = await response.json();
      result = data.content?.[0]?.text || "Keine Lyrics generiert.";
    } else {
      return res.status(400).json({ error: "Ungültiger Provider" });
    }
    res.status(200).json({ lyrics: result });
  } catch (err) {
    res.status(500).json({ error: err.message || "Serverfehler" });
  }
}
