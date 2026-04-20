export default function EmergencyAlert() {
  return (
    <div className="w-full rounded-2xl border border-red-200 bg-red-50 p-4 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white">
          !
        </div>
        <div className="flex-1">
          <div className="text-base font-semibold text-red-900">This is serious. Call 108 immediately.</div>
          <div className="mt-1 text-sm text-red-800">
            If symptoms worsen or you feel unsafe, seek emergency care now.
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href="tel:108"
              className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 active:bg-red-800"
            >
              Call 108
            </a>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 active:bg-red-100"
              onClick={() => alert("Doctor booking coming soon (dummy).")}
            >
              Book Doctor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

