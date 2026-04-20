const fetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));

async function groqChatCompletion({ apiKey, messages, model = "llama-3.3-70b-versatile", temperature = 0.2 }) {
  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY");
  }
  if (String(apiKey).startsWith("xai-")) {
    throw new Error("Your GROQ_API_KEY looks like an xAI key (xai-...). Please paste a real Groq key (usually starts with gsk_...).");
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || `Groq API error (${res.status})`;
    throw new Error(msg);
  }

  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty Groq response");
  return content;
}

module.exports = { groqChatCompletion };

