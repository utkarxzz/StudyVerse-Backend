/* ================================================================
   PASTE THIS INTO YOUR index.html (StudyVerse repo)
   Replace the existing CONFIG block + callGroqAI() function with this.
   ================================================================ */

// 1) DELETE these two lines from your current code:
//    const GROQ_API_KEY = "gsk_...";
//    const MODEL = "llama-3.1-8b-instant";

// 2) ADD this instead — point to YOUR deployed Vercel URL:
const BACKEND_URL = "https://studyverse-backend.vercel.app/api/chat"; // 👈 change to your real Vercel URL
const AI_ENABLED = true; // backend handles the key now, so this can just stay true

// 3) REPLACE your existing callGroqAI() function with this:
async function callGroqAI(prompt, systemPrompt) {
  const res = await fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, systemPrompt }),
  });
  if (!res.ok) throw new Error("AI_REQUEST_FAILED");
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "";
  return cleanAIHtml(raw);
}

// cleanAIHtml() stays exactly the same as before — no change needed there.
