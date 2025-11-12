import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ path: "./.env" });
const app = express();

app.use(cors());
app.use(express.json());

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error('ERROR: API_KEY не задан. Добавь его в .env');
  process.exit(1);
}

app.post('/askAI', async (req, res) => {
  const { questions } = req.body;
  const answers = [];

  for (const q of questions) {
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: q }] }] })
        }
      );

const rawText = await r.text().catch(() => '');
let data;
try {
  data = rawText ? JSON.parse(rawText) : {};
} catch (e) {
  data = {};
}

console.warn('Google raw (preview):', rawText.slice(0, 2048));

function findFirstString(obj) {
  if (!obj) return null;
  if (typeof obj === 'string') {
    const s = obj.trim();
    if (s.length > 0) return s;
    return null;
  }
  if (Array.isArray(obj)) {
    for (const it of obj) {
      const found = findFirstString(it);
      if (found) return found;
    }
    return null;
  }
  if (typeof obj === 'object') {
    const tryKeys = ['text', 'content', 'message', 'output', 'candidates', 'candidatesText', 'response', 'outputText'];
    for (const k of tryKeys) {
      if (obj[k]) {
        const found = findFirstString(obj[k]);
        if (found) return found;
      }
    }
    for (const k of Object.keys(obj)) {
      const found = findFirstString(obj[k]);
      if (found) return found;
    }
  }
  return null;
}

let extracted =
  data?.candidates?.[0]?.content?.parts?.[0]?.text ||
  data?.candidates?.[0]?.text ||
  data?.output?.[0]?.content?.text ||
  data?.message?.content?.parts?.[0]?.text ||
  null;

if (!extracted) {
  extracted = findFirstString(data);
}

const aiText = extracted ? String(extracted).trim() : '';

if (!aiText) {
  console.warn('No extracted text for prompt. Sending rawPreview back to client for debugging.');
}

answers.push({
  question: q,
  aiAnswer: aiText,
  rawPreview: rawText ? rawText.slice(0, 1000) : null
});

    } catch (err) {
      answers.push({ question: q, aiAnswer: 'Помилка AI: ' + err.message });
    }
  }

  res.json(answers);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
