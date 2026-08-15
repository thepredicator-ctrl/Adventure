const USE_CASES = [
  { t: "Design system docs", d: "Long lists of sections, fast scanning, low visual noise." },
  { t: "Portfolio",          d: "Quiet navigation that still feels alive." },
  { t: "SaaS settings",      d: "Many tabs, dense content, no tab-bar crowding." },
  { t: "Narrative scroll",   d: "Pair with scroll-snap for chaptered reading." },
  { t: "Dashboards",         d: "Sidebar that doesn't compete with the data." },
  { t: "Marketing sites",    d: "Anchored section navigation with personality." }
];

export default function Showcase() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold tracking-tight">Showcase</h2>
      <p className="max-w-2xl text-white/70">
        A few places where a proximity-aware sidebar earns its keep.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {USE_CASES.map(s => (
          <div key={s.t} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="font-medium text-white">{s.t}</div>
            <div className="mt-1 text-sm text-white/60">{s.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
