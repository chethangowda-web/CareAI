import ChatBox from "../components/ChatBox";

export default function Page() {
  return (
    <main className="px-4 py-8 sm:py-12">
      <div className="mx-auto mb-6 max-w-3xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-2xl font-semibold">CareAI</div>
              <div className="mt-1 text-sm text-slate-600">
                A clean, India-focused medical assistant that asks 3 quick questions before giving guidance.
              </div>
            </div>
            <div className="flex gap-2">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                Hinglish
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                Emergency: 108
              </span>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-semibold text-slate-700">Step 1–3</div>
              <div className="mt-1 text-sm text-slate-600">Duration → Intensity → Context</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-semibold text-slate-700">Risk score</div>
              <div className="mt-1 text-sm text-slate-600">Low / Moderate / Severe</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-semibold text-slate-700">Safety first</div>
              <div className="mt-1 text-sm text-slate-600">Severe → emergency guidance</div>
            </div>
          </div>
        </div>
      </div>

      <ChatBox />
    </main>
  );
}

