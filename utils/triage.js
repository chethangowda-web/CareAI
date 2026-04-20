const EMERGENCY_KEYWORDS = [
  "chest pain",
  "breathing problem",
  "unconscious",
  "bleeding"
];

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function triage(message) {
  const m = normalize(message);
  const hit = EMERGENCY_KEYWORDS.find((k) => m.includes(k));
  if (!hit) return null;

  return {
    reply: "🚨 Call 108 immediately",
    severity: "Severe",
    riskScore: 95,
    nextStep: "emergency"
  };
}

module.exports = { triage, EMERGENCY_KEYWORDS };

