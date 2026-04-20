export async function sendChat({ message, sessionId }) {
  // Single-link setup: Next.js rewrites /api/* to backend (see next.config.js)
  const res = await fetch(`/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, sessionId })
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.reply || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

