import { CHANGELOG } from "../data/changelog.js";
import { formatDate } from "../lib/format.js";

export default function Changelog() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold tracking-tight">Changelog</h2>
      <ol className="space-y-6 border-l border-white/10 pl-5">
        {CHANGELOG.map(c => (
          <li key={c.version} className="relative">
            <span className="absolute -left-[26px] top-1.5 h-2 w-2 rounded-full bg-fuchsia-400" />
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-white">{c.version}</span>
              <span className="text-xs text-white/40">{formatDate(c.date)}</span>
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/70">
              {c.changes.map((ch, i) => (
                <li key={i}>{ch}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
