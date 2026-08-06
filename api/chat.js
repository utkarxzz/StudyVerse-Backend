// api/chat.js
// This runs on Vercel's server — the API key stays here and never
// reaches the browser. Your frontend calls THIS endpoint instead of
// calling Groq directly.

export default async function handler(req, res) {
  // Allow requests from your GitHub Pages site (CORS)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Browsers send a pre-flight OPTIONS request before POST — just say OK
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests are allowed" });
  }

  try {
    const { prompt, systemPrompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing 'prompt' in request body" });
    }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.GROQ_API_KEY, // 🔒 set in Vercel dashboard
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              systemPrompt ||
              "You are ẞîtñøír AI, the study assistant inside StudyVerse. Be clear, structured and student-friendly.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return res.status(groqRes.status).json({ error: "Groq API error", details: errText });
    }

    const data = await groqRes.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
