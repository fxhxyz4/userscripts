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
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: q }] }] })
        }
      );

      const data = await r.json();
      
      answers.push({
        question: q,
        aiAnswer: data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      });
    } catch (err) {
      answers.push({ question: q, aiAnswer: 'Помилка AI: ' + err.message });
    }
  }

  res.json(answers);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
