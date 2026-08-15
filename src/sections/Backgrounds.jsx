import Topography from "../components/Topography.jsx";

const PRESETS = [
  { name: "Amaranth Drift",  low: "#1e0a3c", mid: "#7c3aed", high: "#f0abfc" },
  { name: "Aurora",          low: "#0c2d4a", mid: "#22d3ee", high: "#a5f3fc" },
  { name: "Ember",           low: "#2a0a0a", mid: "#f97316", high: "#fed7aa" },
  { name: "Forest",          low: "#0a2a1a", mid: "#10b981", high: "#a7f3d0" }
];

export default function Backgrounds() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold tracking-tight">Backgrounds</h2>
      <p className="max-w-2xl text-white/70">
        The Topography component renders a fragment-shader line field via <code className="rounded bg-black/40 px-1.5 py-0.5 text-fuchsia-200">ogl</code>.
        Below are four preset palettes. The full-screen version is currently rendered behind this whole page.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PRESETS.map(p => (
          <div key={p.name} className="overflow-hidden rounded-xl border border-white/10">
            <div className="h-40">
              <Topography
                lowColor={p.low}
                midColor={p.mid}
                highColor={p.high}
                speed={0.3}
                bands={2.4}
                thickness={0.012}
                glow={0.6}
                colorMode="elevation"
                contrast={2.6}
                brightness={0.9}
                opacity={1}
                mouseInteraction={false}
              />
            </div>
            <div className="border-t border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white">{p.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
