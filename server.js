import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";

dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(cors());

// ✅ Generate script using OpenAI
app.post("/api/generate-script", async (req, res) => {
  try {
    const { topic } = req.body;
    const prompt = `Write a short video script about: ${topic}`;
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }]
      },
      { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
    );
    res.json({ script: response.data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Search stock videos from Pexels
app.post("/api/search-media", async (req, res) => {
  try {
    const { query } = req.body;
    const response = await axios.get("https://api.pexels.com/videos/search", {
      headers: { Authorization: process.env.PEXELS_API_KEY },
      params: { query, per_page: 3 }
    });
    res.json({ results: response.data.videos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Generate voiceover with ElevenLabs
app.post("/api/generate-tts", async (req, res) => {
  try {
    const { text } = req.body;
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
      { text, model_id: "eleven_monolingual_v1" },
      {
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY
        },
        responseType: "arraybuffer"
      }
    );
    res.json({ audio: Buffer.from(response.data).toString("base64") });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Build storyboard (basic split by sentences)
app.post("/api/storyboard", (req, res) => {
  const { script } = req.body;
  const scenes = script.split(".").map((s, i) => ({
    id: i + 1,
    text: s.trim(),
    duration: 5
  }));
  res.json({ scenes });
});

app.listen(3000, () => console.log("🚀 Server running on port 3000"));
