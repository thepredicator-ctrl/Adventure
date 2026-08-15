import { usePlayer } from '../context/PlayerContext.jsx';
import { pad2 } from '../lib/format.js';
import { epKey } from '../lib/episodes.js';

export default function Episodes() {
  const { show, global, watchedMap, setSeason, setEpisode } = usePlayer();
  const watched = watchedMap[show.id] ?? [];
  const seasonEps = show.seasons[global.season - 1];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">Episodes</h2>
        <p className="mt-1 text-white/60">{show.name} — {show.seasons.length} seasons</p>
      </div>

      {/* Season tabs */}
      <div className="flex flex-wrap gap-2">
        {show.seasons.map((_, i) => (
          <button
            key={i}
            onClick={() => setSeason(i + 1)}
            className={`rounded-md border px-3 py-1.5 text-sm font-mono transition ${
              global.season === i + 1
                ? 'border-fuchsia-400/60 bg-fuchsia-500/20 text-white'
                : 'border-white/10 bg-white/[0.02] text-white/70 hover:border-white/30'
            }`}
          >
            S{pad2(i + 1)}
          </button>
        ))}
      </div>

      {/* Episode grid */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-medium text-white">Season {global.season}</div>
          <div className="text-xs text-white/40">{seasonEps} episodes</div>
        </div>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
          {Array.from({ length: seasonEps }, (_, i) => {
            const ep = i + 1;
            const key = epKey(global.season, ep);
            const isActive = ep === global.episode;
            const isWatched = watched.includes(key);
            return (
              <button
                key={ep}
                onClick={() => setEpisode(ep)}
                className={`relative aspect-square rounded-lg border text-sm font-mono transition ${
                  isActive
                    ? 'border-fuchsia-400/60 bg-fuchsia-500/20 text-white'
                    : isWatched
                    ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200 hover:border-emerald-400/60'
                    : 'border-white/10 bg-white/[0.02] text-white/70 hover:border-white/30'
                }`}
                title={`S${pad2(global.season)}E${pad2(ep)}`}
              >
                {pad2(ep)}
                {isWatched && (
                  <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
