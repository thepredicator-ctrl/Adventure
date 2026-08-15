import { COMPONENT_LIST } from "../data/components.js";

export default function Components() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold tracking-tight">Components</h2>
      <p className="max-w-2xl text-white/70">
        A small kit of building blocks that pair nicely with the LineSidebar. None of these are required — they&apos;re
        here to show the sidebar in context of a typical app shell.
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {COMPONENT_LIST.map((c, i) => (
          <div
            key={c.name}
            className="group rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-fuchsia-400/40 hover:bg-white/[0.05]"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500/30 to-indigo-500/30 text-fuchsia-200">
              {String(i + 1).padStart(2, "0")}
            </div>
            <div className="font-medium text-white">{c.name}</div>
            <div className="text-sm text-white/50">{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
