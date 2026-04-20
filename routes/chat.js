const express = require("express");
const { triage } = require("../utils/triage");
const { groqChatCompletion } = require("../utils/groq");

const router = express.Router();

const SYSTEM_PROMPT = `You are CareAI, a medical assistant for India.

Follow strict diagnostic flow:
- Ask 1 question at a time
- Complete 3 questions before diagnosis

Always classify:
Low / Moderate / Severe

If severe → stop and suggest emergency (108)

Use simple English or Hinglish.
Suggest only basic safe medicines (OTC) and home care when appropriate.
Avoid dangerous advice. If unsure, advise doctor visit.

Always add: "I am an AI assistant, not a doctor."

IMPORTANT OUTPUT FORMAT:
Return ONLY a strict JSON object with exactly these keys:
{
  "reply": string,
  "severity": "Low" | "Moderate" | "Severe",
  "riskScore": number,
  "nextStep": "question" | "diagnosis" | "emergency"
}
No markdown, no extra text.`;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function computeRiskScore(severity, hintScore) {
  if (severity === "Severe") return clamp(hintScore ?? 90, 80, 100);
  if (severity === "Moderate") return clamp(hintScore ?? 65, 50, 80);
  return clamp(hintScore ?? 35, 20, 50);
}

function makeQuestionForState(state, contextSummary) {
  if (state === 0) return "Kab se ho raha hai? (Duration: since when / how long?)";
  if (state === 1) return "Pain/issue ki intensity kitni hai 1-10? (Intensity 1-10)";
  return `Context thoda batao: location, triggers (khana/empty stomach), fever/vomiting/diarrhea? ${contextSummary ? `(${contextSummary})` : ""}`.trim();
}

function safeJsonParse(str) {
  try {
    let s = String(str || "").trim();
    // Strip common markdown fences like ```json ... ``` or ``` ... ```
    s = s.replace(/^```[a-zA-Z]*\s*/i, "").replace(/```$/i, "").trim();
    // If the model still wrapped output or added text, extract the first JSON object.
    const first = s.indexOf("{");
    const last = s.lastIndexOf("}");
    if (first !== -1 && last !== -1 && last > first) {
      s = s.slice(first, last + 1);
    }
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function ensureResponseShape(obj) {
  const fallback = {
    reply: "Sorry, I couldn’t understand that. Please describe your symptoms again. I am an AI assistant, not a doctor.",
    severity: "Low",
    riskScore: 30,
    nextStep: "question"
  };

  if (!obj || typeof obj !== "object") return fallback;
  const reply = typeof obj.reply === "string" ? obj.reply : fallback.reply;
  const severityRaw = typeof obj.severity === "string" ? obj.severity : "";
  const severityNorm =
    severityRaw.toLowerCase() === "low"
      ? "Low"
      : severityRaw.toLowerCase() === "moderate"
        ? "Moderate"
        : severityRaw.toLowerCase() === "severe"
          ? "Severe"
          : obj.severity;
  const severity = ["Low", "Moderate", "Severe"].includes(severityNorm) ? severityNorm : fallback.severity;
  const nextStep = ["question", "diagnosis", "emergency"].includes(obj.nextStep) ? obj.nextStep : fallback.nextStep;
  const riskScore = Number.isFinite(Number(obj.riskScore))
    ? computeRiskScore(severity, Number(obj.riskScore))
    : computeRiskScore(severity);

  return { reply, severity, riskScore, nextStep };
}

router.post("/", async (req, res) => {
  const { message, sessionId } = req.body || {};
  if (!message || typeof message !== "string") {
    return res.status(400).json({
      reply: "Please send a valid message. I am an AI assistant, not a doctor.",
      severity: "Low",
      riskScore: 20,
      nextStep: "question"
    });
  }

  // 1) TRIAGE pre-check (NO AI call)
  const triaged = triage(message);
  if (triaged) {
    const sb = req.app.locals.supabase;
    if (sb) {
      sb.from("chat_logs")
        .insert({
          session_id: sessionId || null,
          role: "assistant",
          message: triaged.reply,
          severity: triaged.severity,
          risk_score: triaged.riskScore,
          next_step: triaged.nextStep
        })
        .catch(() => {});
    }
    return res.json(triaged);
  }

  // 2) In-memory session state machine
  const store = req.app.locals.sessionStore;
  const sid = String(sessionId || "").trim() || null;
  if (!sid || !store[sid]) {
    // Create session on first message if missing
    // NOTE: sessionId is generated on frontend; we also accept missing and create a temp one.
  }
  const sessionKey = sid || req.app.locals.createEphemeralSessionId();
  if (!store[sessionKey]) {
    store[sessionKey] = {
      diagnostic_state: 0,
      answers: {},
      history: []
    };
  }
  const session = store[sessionKey];

  // Keep history short
  session.history.push({ role: "user", content: message });
  session.history = session.history.slice(-16);
  const sb = req.app.locals.supabase;
  if (sb) {
    sb.from("chat_logs")
      .insert({
        session_id: sessionKey,
        role: "user",
        message
      })
      .catch(() => {});
  }

  // Deterministic 3-question logic, fast and reliable
  if (session.diagnostic_state <= 2) {
    if (session.diagnostic_state === 0) session.answers.symptoms = message;
    if (session.diagnostic_state === 1) session.answers.duration = message;
    if (session.diagnostic_state === 2) session.answers.intensity = message;

    const q = makeQuestionForState(session.diagnostic_state, session.answers.symptoms);
    session.diagnostic_state += 1;

    const out = ensureResponseShape({
      reply: q + '  (I am an AI assistant, not a doctor.)',
      severity: "Low",
      riskScore: 30,
      nextStep: "question"
    });
    session.history.push({ role: "assistant", content: out.reply });
    if (sb) {
      sb.from("chat_logs")
        .insert({
          session_id: sessionKey,
          role: "assistant",
          message: out.reply,
          severity: out.severity,
          risk_score: out.riskScore,
          next_step: out.nextStep
        })
        .catch(() => {});
    }
    return res.json({ ...out, sessionId: sessionKey });
  }

  // After 3 questions completed (state 3): call Groq for diagnosis JSON
  const apiKey = process.env.GROQ_API_KEY;

  const userSummary = `Symptoms: ${session.answers.symptoms || "N/A"}
Duration: ${session.answers.duration || "N/A"}
Intensity: ${session.answers.intensity || "N/A"}
Context: ${message}`;

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userSummary }
  ];

  try {
    const raw = await groqChatCompletion({ apiKey, messages });
    const parsed = safeJsonParse(raw);
    const normalized = ensureResponseShape(parsed);

    // Enforce risk ranges by severity
    normalized.riskScore = computeRiskScore(normalized.severity, normalized.riskScore);

    // If severe, force emergency nextStep
    if (normalized.severity === "Severe") {
      normalized.nextStep = "emergency";
    } else {
      // After 3 questions, we must move to diagnosis
      normalized.nextStep = "diagnosis";
    }

    // Always ensure disclaimer exists in reply
    if (!normalized.reply.toLowerCase().includes("i am an ai assistant, not a doctor")) {
      normalized.reply = `${normalized.reply}\n\nI am an AI assistant, not a doctor.`;
    }

    session.history.push({ role: "assistant", content: normalized.reply });
    if (sb) {
      sb.from("chat_logs")
        .insert({
          session_id: sessionKey,
          role: "assistant",
          message: normalized.reply,
          severity: normalized.severity,
          risk_score: normalized.riskScore,
          next_step: normalized.nextStep
        })
        .catch(() => {});
    }
    // Reset for a fresh flow on next user symptom set
    session.diagnostic_state = 0;
    session.answers = {};

    return res.json({ ...normalized, sessionId: sessionKey });
  } catch (e) {
    const out = ensureResponseShape({
      reply: `AI service error: ${e.message}. Please try again. I am an AI assistant, not a doctor.`,
      severity: "Low",
      riskScore: 25,
      nextStep: "question"
    });
    session.history.push({ role: "assistant", content: out.reply });
    return res.status(500).json({ ...out, sessionId: sessionKey });
  }
});

module.exports = router;

