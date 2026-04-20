"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import EmergencyAlert from "./EmergencyAlert";
import { sendChat } from "../lib/api";

function badge(severity) {
  if (severity === "Severe") return { label: "🔴 Severe", cls: "bg-red-100 text-red-800 border-red-200" };
  if (severity === "Moderate") return { label: "🟡 Moderate", cls: "bg-amber-100 text-amber-900 border-amber-200" };
  return { label: "🟢 Low", cls: "bg-emerald-100 text-emerald-900 border-emerald-200" };
}

const STARTER_PROMPTS = [
  "I have stomach pain",
  "I have fever since 2 days",
  "My throat hurts and I am coughing",
  "I have headache and weakness"
];

function getOrCreateSessionId() {
  if (typeof window === "undefined") return null;
  const key = "careai_session_id";
  let v = window.localStorage.getItem(key);
  if (!v) {
    v = `web_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
    window.localStorage.setItem(key, v);
  }
  return v;
}

export default function ChatBox() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! Describe your symptoms. (I am an AI assistant, not a doctor.)", ts: Date.now() }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ severity: "Low", riskScore: 30, nextStep: "question" });

  const scrollRef = useRef(null);
  const sessionId = useMemo(() => getOrCreateSessionId(), []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, loading]);

  function addMessage(msg) {
    setMessages((m) => [...m, { ...msg, ts: msg.ts ?? Date.now() }]);
  }

  function clearChat() {
    setMeta({ severity: "Low", riskScore: 30, nextStep: "question" });
    setMessages([{ role: "assistant", text: "New chat started. What symptoms are you having?", ts: Date.now() }]);
  }

  async function onSend(e) {
    e?.preventDefault?.();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    addMessage({ role: "user", text });
    setLoading(true);

    try {
      const data = await sendChat({ message: text, sessionId });
      setMeta({ severity: data.severity, riskScore: data.riskScore, nextStep: data.nextStep });
      addMessage({ role: "assistant", text: data.reply });
    } catch (err) {
      addMessage({ role: "assistant", text: `Sorry, something went wrong: ${err.message}` });
    } finally {
      setLoading(false);
    }
  }

  const b = badge(meta.severity);
  const showEmergency = meta.severity === "Severe";
  const empty = messages.length <= 1;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="rounded-3xl border border-slate-200 bg-white shadow-soft overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white font-bold ring-1 ring-white/25">
              C
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="text-lg font-semibold leading-tight">CareAI</div>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[11px] ring-1 ring-white/25">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-200" />
                  Online
                </span>
              </div>
              <div className="text-xs text-white/80">India-focused medical guidance • Hinglish supported</div>
            </div>
            <button
              type="button"
              onClick={clearChat}
              className="rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold ring-1 ring-white/25 hover:bg-white/20 active:bg-white/25"
            >
              New chat
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white p-4">
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${b.cls}`}>
            {b.label}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            Risk score: {meta.riskScore}
          </span>
          <span className="ml-auto text-xs text-slate-500 hidden sm:inline">
            Emergency keywords: chest pain • breathing problem • unconscious • bleeding
          </span>
        </div>

        <div className="p-4">
          {showEmergency ? (
            <div className="mb-4">
              <EmergencyAlert />
            </div>
          ) : null}

          <div className="h-[55vh] min-h-[360px] overflow-y-auto rounded-2xl bg-slate-50 p-3 sm:p-4">
            <div className="flex flex-col gap-3">
              {empty ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-soft">
                  <div className="font-semibold">Try a quick starter</div>
                  <div className="mt-1 text-xs text-slate-500">
                    CareAI will ask 3 short questions and then give a safe next step.
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {STARTER_PROMPTS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setInput(p)}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 active:bg-slate-200"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              {messages.map((m, idx) => (
                <MessageBubble key={idx} role={m.role} text={m.text} ts={m.ts} />
              ))}
              {loading ? (
                <div className="flex w-full justify-start">
                  <div className="rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-soft">
                    CareAI is typing…
                  </div>
                </div>
              ) : null}
              <div ref={scrollRef} />
            </div>
          </div>

          <form onSubmit={onSend} className="mt-4 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Type like: "I have stomach pain"'
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60"
            >
              Send
            </button>
          </form>

          <div className="mt-3 text-xs text-slate-500">
            Disclaimer: This tool provides general guidance only. If symptoms are severe, call 108 or visit a doctor.
          </div>
        </div>
      </div>
    </div>
  );
}

