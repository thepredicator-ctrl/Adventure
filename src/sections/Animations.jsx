import { ANIMATIONS } from "../data/animations.js";

export default function Animations() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold tracking-tight">Animations</h2>
      <p className="max-w-2xl text-white/70">
        Hover each card to preview an easing curve. The LineSidebar itself uses exponential smoothing rather than a CSS
        easing — but the visual language is the same: motion that feels physical, not synthetic.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ANIMATIONS.map(a => (
          <div key={a.name} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-medium text-white">{a.name}</span>
              <code className="rounded bg-black/40 px-2 py-0.5 text-xs text-white/50">{a.easing}</code>
            </div>
            <div className="h-12 overflow-hidden rounded-lg bg-black/30">
              <div
                className="h-full w-12 bg-gradient-to-r from-fuchsia-400 to-indigo-400"
                style={{ animation: `slidepreview 1.8s ${a.easing} infinite` }}
              />
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes slidepreview { 0%{transform:translateX(0)} 50%{transform:translateX(calc(100% - 3rem))} 100%{transform:translateX(0)} }`}</style>
    </div>
  );
}
