import { usePlayer } from '../context/PlayerContext.jsx';
import { SERVER_LIST } from '../data/servers.js';
import { SHOWS } from '../data/shows.js';
import { isAtFirstEp, isAtLastEp } from '../lib/episodes.js';
import { pad2 } from '../lib/format.js';
import ShowIcon from '../components/ShowIcon.jsx';

export default function Player() {
  const {
    show, global, currentServer, videoUrl,
    setServer, setAutoplay, gotoNext, gotoPrev,
    markCurrentWatched, continueList, jumpTo
  } = usePlayer();

  const atFirst = isAtFirstEp(show, global.season, global.episode);
  const atLast = isAtLastEp(show, global.season, global.episode);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">Player</h2>
        <p className="mt-1 text-white/60">Now playing: <span className="text-white">{show.name}</span> — S{pad2(global.season)}E{pad2(global.episode)}</p>
      </div>

      {/* Video */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
        <div className="relative" style={{ paddingBottom: '56.25%' }}>
          <iframe
            key={videoUrl}
            src={videoUrl}
            title={`${show.shortName} S${global.season}E${global.episode}`}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span className="font-mono text-white/80">{currentServer.name}</span>
            <span>·</span>
            <span>{show.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={gotoPrev}
              disabled={atFirst}
              className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-white/80 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              ← Prev
            </button>
            <button
              onClick={markCurrentWatched}
              className="rounded-md border border-fuchsia-400/40 bg-fuchsia-500/20 px-3 py-1.5 text-sm text-fuchsia-100 transition hover:bg-fuchsia-500/30"
            >
              ✓ Mark watched
            </button>
            <button
              onClick={gotoNext}
              disabled={atLast}
              className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-white/80 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Server picker */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-3 text-sm font-medium text-white">Embed server</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SERVER_LIST.map(s => (
            <button
              key={s.id}
              onClick={() => setServer(s.id)}
              className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                global.server === s.id
                  ? 'border-fuchsia-400/60 bg-fuchsia-500/20 text-white'
                  : 'border-white/10 bg-white/[0.02] text-white/70 hover:border-white/30'
              }`}
            >
              <div className="font-mono text-xs text-white/40">0{s.id}</div>
              <div className="mt-0.5 font-medium">{s.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* AUTO NEXT toggle */}
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div>
          <div className="text-sm font-medium text-white">Auto Next</div>
          <div className="mt-1 text-xs text-white/50">Listen for &ldquo;ended&rdquo; postMessages from the iframe and auto-advance.</div>
        </div>
        <button
          onClick={() => setAutoplay(!global.autoplay)}
          role="switch"
          aria-checked={global.autoplay}
          className={`relative h-7 w-12 rounded-full transition ${global.autoplay ? 'bg-fuchsia-500' : 'bg-white/15'}`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${global.autoplay ? 'left-6' : 'left-1'}`}
          />
        </button>
      </div>

      {/* Continue watching rail */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-3 text-sm font-medium text-white">Continue watching</div>
        {continueList.length === 0 ? (
          <div className="py-6 text-center text-sm text-white/40">No episodes watched yet. Press &ldquo;Mark watched&rdquo; to start.</div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {continueList.map((entry, i) => {
              const s = SHOWS.find(x => x.id === entry.showId);
              if (!s) return null;
              return (
                <button
                  key={`${entry.showId}-${entry.season}-${entry.episode}-${i}`}
                  onClick={() => jumpTo(entry.showId, entry.season, entry.episode)}
                  className="group flex w-32 shrink-0 flex-col gap-2 rounded-lg border border-white/10 bg-white/[0.02] p-2 text-left transition hover:border-fuchsia-400/40"
                >
                  <ShowIcon show={s} size={28} />
                  <div className="min-w-0">
                    <div className="truncate text-xs font-medium text-white">{s.shortName}</div>
                    <div className="text-[11px] text-white/50">S{pad2(entry.season)}E{pad2(entry.episode)}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
