function formatTime(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function MessageBubble({ role, text, ts }) {
  const isUser = role === "user";
  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-soft",
          isUser
            ? "bg-slate-900 text-white rounded-br-sm"
            : "bg-emerald-100 text-emerald-950 rounded-bl-sm border border-emerald-200"
        ].join(" ")}
      >
        <div className="whitespace-pre-wrap">{text}</div>
        <div className={`mt-2 text-[11px] ${isUser ? "text-white/70" : "text-emerald-900/70"}`}>
          {formatTime(ts)}
        </div>
      </div>
    </div>
  );
}

