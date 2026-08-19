import { useState, useEffect, useRef, useCallback } from 'react';
import { SHOWS } from '../data/shows.js';
import { SERVERS, SERVER_LIST } from '../data/servers.js';
import { totalEpisodes, displaySeasonNumber } from '../lib/episodes.js';
import {
  getOfflineMeta, setOfflineMeta,
  openCache, getCachedCount, clearAllOfflineData,
  supportsFileAccess, saveDirHandle, getDirHandle, writeEpisodeFile,
  makeLauncherHTML, fetchEpisode
} from '../lib/offline.js';
import ShowIcon from './ShowIcon.jsx';

const CONCURRENCY = 3;
const SPEED_WINDOW_MS = 4000;

/* ------------------------------------------------------------------ */
/*  Formatting helpers                                                 */
/* ------------------------------------------------------------------ */

function fmtBytes(b) {
  if (b >= 1_073_741_824) return `${(b / 1_073_741_824).toFixed(2)} GB`;
  if (b >= 1_048_576) return `${(b / 1_048_576).toFixed(1)} MB`;
  if (b >= 1_024) return `${(b / 1_024).toFixed(1)} KB`;
  return `${b} B`;
}

function fmtSpeed(bps) {
  if (bps >= 125_000_000) return `${(bps / 125_000_000).toFixed(2)} Gbps`;
  if (bps >= 1_000_000) return `${(bps / 1_000_000).toFixed(1)} Mbps`;
  if (bps >= 1_000) return `${(bps / 1_000).toFixed(0)} Kbps`;
  return `${bps.toFixed(0)} B/s`;
}

function fmtEta(sec) {
  if (!isFinite(sec) || sec <= 0) return '--';
  if (sec < 60) return `${Math.ceil(sec)}s`;
  const m = Math.floor(sec / 60), s = Math.ceil(sec % 60);
  if (m < 60) return `${m}m ${s}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

/* ------------------------------------------------------------------ */
/*  Build episode queue                                                */
/* ------------------------------------------------------------------ */

function buildQueue(shows, server) {
  const q = [];
  for (const show of shows) {
    for (let si = 0; si < show.seasons.length; si++) {
      const ds = displaySeasonNumber(show, si + 1);
      for (let e = 1; e <= show.seasons[si]; e++) {
        q.push({
          showId: show.id,
          showName: show.shortName,
          season: ds,
          episode: e,
          url: server.build(show.id, ds, e)
        });
      }
    }
  }
  return q;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function OfflineDownloadScreen({ onComplete }) {
  // Phases: checking → found | prompt | picking | downloading | done
  const [phase, setPhase] = useState('checking');

  // Existing offline data (revisit)
  const [existingMeta, setExistingMeta] = useState(null);
  const [existingCount, setExistingCount] = useState(0);
  const [deleting, setDeleting] = useState(false);

  // Selection
  const [selected, setSelected] = useState(() => {
    const m = {};
    for (const s of SHOWS) m[s.id] = false;
    return m;
  });
  const [serverId, setServerId] = useState(1);

  // Download progress
  const [overallPct, setOverallPct] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [eta, setEta] = useState(0);
  const [doneBytes, setDoneBytes] = useState(0);
  const [doneEps, setDoneEps] = useState(0);
  const [failEps, setFailEps] = useState(0);
  const [totalEps, setTotalEps] = useState(0);
  const [currentLabels, setCurrentLabels] = useState([]);
  const [showStats, setShowStats] = useState({});
  const [writeStatus, setWriteStatus] = useState(''); // '' | 'writing' | 'cached'
  const [hiding, setHiding] = useState(false);

  const abortRef = useRef(false);
  const speedLogRef = useRef([]);

  // Derived
  const selectedShows = SHOWS.filter(s => selected[s.id]);
  const totalSelectedEps = selectedShows.reduce((s, sh) => s + totalEpisodes(sh), 0);
  const server = SERVERS[serverId] ?? SERVERS[1];

  // ---- Check for existing offline data on mount ----
  useEffect(() => {
    (async () => {
      const meta = getOfflineMeta();
      if (meta && meta.shows && meta.shows.length > 0) {
        const count = await getCachedCount();
        if (count > 0) {
          setExistingMeta(meta);
          setExistingCount(count);
          setPhase('found');
          return;
        }
      }
      setPhase('prompt');
    })();
  }, []);

  // ---- Speed from rolling window ----
  const calcSpeed = useCallback(() => {
    const now = performance.now();
    speedLogRef.current = speedLogRef.current.filter(e => now - e.time < SPEED_WINDOW_MS);
    const log = speedLogRef.current;
    if (log.length < 2) return 0;
    const bytes = log.reduce((s, e) => s + e.bytes, 0);
    const sec = (log[log.length - 1].time - log[0].time) / 1000;
    return sec > 0 ? bytes / sec : 0;
  }, []);

  // ---- Toggle helpers ----
  const toggleShow = useCallback((id) => {
    setSelected(p => ({ ...p, [id]: !p[id] }));
  }, []);

  const toggleAll = useCallback(() => {
    const allOn = selectedShows.length === SHOWS.length;
    const n = {};
    for (const s of SHOWS) n[s.id] = !allOn;
    setSelected(n);
  }, [selectedShows.length]);

  // ---- Delete offline data ----
  const handleDelete = useCallback(async () => {
    setDeleting(true);
    await clearAllOfflineData();
    setExistingMeta(null);
    setExistingCount(0);
    setDeleting(false);
    setPhase('prompt');
  }, []);

  // ---- Pre-select previously downloaded shows ----
  const handleRedownload = useCallback(() => {
    if (existingMeta?.shows) {
      const n = {};
      for (const s of SHOWS) n[s.id] = existingMeta.shows.includes(s.id);
      setSelected(n);
      if (existingMeta.serverId) setServerId(existingMeta.serverId);
    }
    setPhase('prompt');
  }, [existingMeta]);

  // ---- Start download ----
  const startDownload = useCallback(async () => {
    if (selectedShows.length === 0) return;

    const queue = buildQueue(selectedShows, server);
    if (queue.length === 0) return;

    // 1. Ask user to pick a folder (File System Access API)
    let dirHandle = null;
    if (supportsFileAccess) {
      try {
        setPhase('picking');
        dirHandle = await window.showDirectoryPicker({
          mode: 'readwrite',
          startIn: 'documents',
          id: 'adventure-offline'
        });
        await saveDirHandle(dirHandle);
      } catch (err) {
        // User cancelled the picker — fall back to cache-only
        if (err.name === 'AbortError') {
          dirHandle = null;
        } else {
          dirHandle = null;
        }
      }
    }

    // If user cancelled at picker, go back to prompt
    if (phase === 'picking' && dirHandle === null && supportsFileAccess) {
      // Check if it was an abort (user cancel) vs. unsupported
      setPhase('prompt');
      return;
    }

    setPhase('downloading');
    setOverallPct(0);
    setSpeed(0);
    setEta(0);
    setDoneBytes(0);
    setDoneEps(0);
    setFailEps(0);
    setTotalEps(queue.length);
    setCurrentLabels([]);
    setWriteStatus(dirHandle ? 'writing' : 'cached');
    abortRef.current = false;
    speedLogRef.current = [];

    const stats = {};
    for (const show of selectedShows) {
      stats[show.id] = { done: 0, fail: 0, total: totalEpisodes(show) };
    }
    setShowStats(stats);

    // Open Cache API
    const cache = await openCache();

    // ---- Concurrency pool ----
    let idx = 0;
    let totalBytes = 0;
    let totalDone = 0;
    let totalFail = 0;
    const activeLabels = new Map();

    const updateLabels = () => setCurrentLabels(Array.from(activeLabels.values()));

    const bumpShow = (item, ok) => {
      setShowStats(prev => {
        const s = prev[item.showId];
        if (!s) return prev;
        return { ...prev, [item.showId]: { ...s, [ok ? 'done' : 'fail']: s[ok ? 'done' : 'fail'] + 1 } };
      });
    };

    const worker = async () => {
      while (!abortRef.current) {
        const i = idx++;
        if (i >= queue.length) return;

        const item = queue[i];
        const label = `${item.showName} S${String(item.season).padStart(2, '0')}E${String(item.episode).padStart(2, '0')}`;
        const key = `${item.showId}-${item.season}-${item.episode}`;
        activeLabels.set(key, label);
        updateLabels();

        try {
          const { response, readable, bytes, html } = await fetchEpisode(item.url);

          if (abortRef.current) return;

          // Cache in Cache API
          if (cache) {
            try { await cache.put(item.url, response.clone()); } catch { /* opaque may not cache */ }
          }

          // Write to user's folder
          if (dirHandle && readable && html) {
            try {
              await writeEpisodeFile(dirHandle, item.showName, item.season, item.episode, html);
            } catch {
              // Permission denied or disk full — non-fatal
            }
          } else if (dirHandle && !readable) {
            // CORS blocked — write a launcher HTML instead
            try {
              const launcher = makeLauncherHTML(item.showName, item.season, item.episode, item.url);
              await writeEpisodeFile(dirHandle, item.showName, item.season, item.episode, launcher);
            } catch { /* non-fatal */ }
          }

          totalBytes += bytes;
          totalDone++;
          speedLogRef.current.push({ time: performance.now(), bytes });
          bumpShow(item, true);
        } catch (err) {
          if (abortRef.current) return;
          totalFail++;
          bumpShow(item, false);
        }

        activeLabels.delete(key);
        updateLabels();

        // Update UI state
        const completed = totalDone + totalFail;
        const pct = (completed / queue.length) * 100;
        const spd = calcSpeed();
        const remaining = queue.length - completed;
        const avgB = totalDone > 0 ? totalBytes / totalDone : 180_000;
        const etaSec = spd > 0 ? (remaining * avgB) / spd : 0;

        setOverallPct(pct);
        setSpeed(spd);
        setEta(etaSec);
        setDoneBytes(totalBytes);
        setDoneEps(totalDone);
        setFailEps(totalFail);
      }
    };

    const workers = [];
    for (let w = 0; w < CONCURRENCY; w++) workers.push(worker());
    await Promise.all(workers);

    if (!abortRef.current) {
      // Save metadata for revisit detection
      setOfflineMeta({
        shows: selectedShows.map(s => s.id),
        serverId,
        totalEps: queue.length,
        doneEps: totalDone,
        failEps: totalFail,
        bytes: totalBytes,
        timestamp: Date.now(),
        savedToFolder: !!dirHandle
      });
      setPhase('done');
      setSpeed(0);
      setEta(0);
      setCurrentLabels([]);
    }
  }, [selectedShows, server, calcSpeed, phase]);

  // ---- Cancel ----
  const cancelDownload = useCallback(() => {
    abortRef.current = true;
    setPhase('prompt');
    setSpeed(0);
    setCurrentLabels([]);
  }, []);

  // ---- Finish / Skip ----
  const finish = useCallback(() => {
    abortRef.current = true;
    if (hiding) return;
    setHiding(true);
    setTimeout(() => onComplete?.(), 500);
  }, [hiding, onComplete]);

  useEffect(() => () => { abortRef.current = true; }, []);

  // ---- Render ----
  if (hiding) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-500 opacity-0">
        <div className="text-white/50 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center bg-black overflow-y-auto">
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-48"
        style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.03) 0%, transparent 100%)' }}
      />

      <div className="relative z-10 w-full max-w-2xl px-6 py-10 flex flex-col gap-6">
        {/* ===== CHECKING ===== */}
        {phase === 'checking' && (
          <div className="flex items-center justify-center py-20">
            <div className="h-2 w-2 rounded-full bg-white/40 animate-pulse" />
          </div>
        )}

        {/* ===== FOUND: existing offline data ===== */}
        {phase === 'found' && existingMeta && (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-white">Offline Data Found</h1>
              <p className="mt-2 text-sm text-white/50">
                Previously downloaded data is still cached and ready to use.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="grid grid-cols-2 gap-4">
                <Stat label="Episodes cached" value={existingCount} />
                <Stat label="Shows" value={existingMeta.shows?.length ?? 0} />
                <Stat label="Data size" value={fmtBytes(existingMeta.bytes ?? 0)} />
                <Stat
                  label="Saved"
                  value={existingMeta.savedToFolder ? 'Device folder' : 'Browser cache'}
                />
                <Stat label="Server" value={SERVERS[existingMeta.serverId]?.name ?? '--'} />
                <Stat
                  label="Last download"
                  value={existingMeta.timestamp
                    ? new Date(existingMeta.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : '--'}
                />
              </div>
              {existingMeta.failEps > 0 && (
                <div className="mt-3 text-xs text-yellow-300/60 font-mono">
                  {existingMeta.failEps} episode{existingMeta.failEps !== 1 ? 's' : ''} failed last time — consider re-downloading.
                </div>
              )}
            </div>

            {/* Show list that was downloaded */}
            <div className="flex flex-col gap-1.5">
              {(existingMeta.shows ?? []).map(id => {
                const show = SHOWS.find(s => s.id === id);
                if (!show) return null;
                return (
                  <div key={id} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-2">
                    <svg className="h-4 w-4 text-white/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <ShowIcon show={show} size={20} />
                    <span className="text-xs text-white/60 truncate flex-1">{show.shortName}</span>
                    <span className="font-mono text-[10px] text-white/30">{totalEpisodes(show)} eps</span>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={finish}
                className="rounded-xl border border-white/20 bg-white text-black px-5 py-3 text-sm font-semibold transition hover:bg-white/90"
              >
                Continue to App
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleRedownload}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/60 transition hover:border-white/25 hover:text-white"
                >
                  Re-download
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-xl border border-red-400/20 bg-red-400/[0.04] px-4 py-2.5 text-sm text-red-300/70 transition hover:border-red-400/40 hover:text-red-300 disabled:opacity-40"
                >
                  {deleting ? 'Deleting...' : 'Delete Offline Data'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ===== PICKING DIRECTORY ===== */}
        {phase === 'picking' && (
          <div className="flex flex-col items-center gap-4 py-16">
            <div className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            <div className="text-sm text-white/60">Choose a folder to save episodes...</div>
            <button
              onClick={() => { abortRef.current = true; setPhase('prompt'); }}
              className="text-xs text-white/30 transition hover:text-white/60"
            >
              Cancel
            </button>
          </div>
        )}

        {/* ===== PROMPT: show selection ===== */}
        {phase === 'prompt' && (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-white">Download for Offline Mode</h1>
              <p className="mt-2 text-sm text-white/50">
                {supportsFileAccess
                  ? 'Select shows to download. Files will be saved to a folder on your device and cached in your browser.'
                  : 'Select shows to download. Episodes will be cached in your browser for offline access.'}
              </p>
            </div>

            {/* Server picker */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-2 text-xs font-medium text-white/60 uppercase tracking-wider">Embed Server</div>
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
                {SERVER_LIST.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setServerId(s.id)}
                    className={`rounded-lg border px-2 py-1.5 text-center text-xs transition ${
                      serverId === s.id
                        ? 'border-white/50 bg-white/15 text-white'
                        : 'border-white/[0.06] bg-white/[0.02] text-white/50 hover:border-white/20'
                    }`}
                  >
                    <div className="font-mono text-[10px] text-white/30">0{s.id}</div>
                    <div className="mt-0.5 font-medium leading-tight">{s.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Select all / deselect all */}
            <div className="flex items-center justify-between">
              <button onClick={toggleAll} className="text-xs font-medium text-white/60 transition hover:text-white">
                {selectedShows.length === SHOWS.length ? 'Deselect all' : `Select all (${SHOWS.length})`}
              </button>
              <div className="font-mono text-xs text-white/30">
                {selectedShows.length}/{SHOWS.length} shows · {totalSelectedEps} episodes
              </div>
            </div>

            {/* Show list */}
            <div className="flex flex-col gap-2">
              {SHOWS.map(show => {
                const eps = totalEpisodes(show);
                const on = selected[show.id];
                return (
                  <label
                    key={show.id}
                    className={`group flex items-center gap-4 rounded-xl border px-4 py-3 cursor-pointer transition-all duration-200 ${
                      on ? 'border-white/25 bg-white/[0.06]' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/10'
                    }`}
                  >
                    <div className="relative flex items-center justify-center">
                      <input type="checkbox" checked={on} onChange={() => toggleShow(show.id)} className="peer sr-only" />
                      <div className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all duration-150 ${
                        on ? 'border-white/60 bg-white/20' : 'border-white/15 bg-white/[0.04] group-hover:border-white/30'
                      }`}>
                        {on && (
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <ShowIcon show={show} size={32} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white/90 truncate">{show.name}</div>
                      <div className="mt-0.5 text-xs text-white/40">
                        {show.seasons.length} season{show.seasons.length !== 1 ? 's' : ''} · {eps} episodes
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-xs ${on ? 'text-white/60' : 'text-white/25'}`}>{eps} ep{eps !== 1 ? 's' : ''}</div>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={startDownload}
                disabled={selectedShows.length === 0}
                className="flex-1 rounded-xl border border-white/20 bg-white text-black px-5 py-3 text-sm font-semibold transition-all hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
              >
                Download {totalSelectedEps > 0 ? `(${totalSelectedEps} episodes)` : ''}
              </button>
              <button
                onClick={finish}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white/60 transition hover:border-white/25 hover:text-white"
              >
                Skip
              </button>
            </div>
          </>
        )}

        {/* ===== DOWNLOADING ===== */}
        {phase === 'downloading' && (
          <div className="flex flex-col gap-5">
            {/* Overall progress */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-medium text-white/70 uppercase tracking-wider">Overall Progress</div>
                <div className="font-mono text-xs text-white/50">{doneEps + failEps} / {totalEps} episodes</div>
              </div>
              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-300 ease-out"
                  style={{
                    width: `${Math.min(overallPct, 100).toFixed(1)}%`,
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.35), rgba(255,255,255,0.9))',
                    boxShadow: '0 0 14px rgba(255,255,255,0.12)'
                  }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex h-2 w-2">
                      <div className="absolute inset-0 rounded-full bg-white/60 animate-ping" />
                      <div className="relative rounded-full h-2 w-2 bg-white/80" />
                    </div>
                    <span className="font-mono text-xs text-white/60">{speed > 0 ? fmtSpeed(speed) : '--'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="h-3 w-3 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    <span className="font-mono text-xs text-white/40">{fmtBytes(doneBytes)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="h-3 w-3 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-mono text-xs text-white/40">{fmtEta(eta)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {writeStatus === 'writing' && (
                    <span className="text-[10px] text-white/30 font-mono">SAVING TO FOLDER</span>
                  )}
                  {writeStatus === 'cached' && (
                    <span className="text-[10px] text-white/30 font-mono">CACHING</span>
                  )}
                  <span className="font-mono text-xs text-white/50">{overallPct.toFixed(1)}%</span>
                </div>
              </div>

              {currentLabels.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/[0.06]">
                  <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Downloading</div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {currentLabels.map(l => (
                      <span key={l} className="font-mono text-[11px] text-white/50">{l}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Per-show progress */}
            <div className="flex flex-col gap-2">
              {selectedShows.map(show => {
                const st = showStats[show.id] || { done: 0, fail: 0, total: totalEpisodes(show) };
                const pct = st.total > 0 ? ((st.done + st.fail) / st.total) * 100 : 0;
                const isDone = st.done === st.total;
                const isActive = !isDone && st.done + st.fail > 0;
                return (
                  <div
                    key={show.id}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 transition-all duration-300 ${
                      isActive ? 'border-white/20 bg-white/[0.05]' : isDone ? 'border-white/[0.08] bg-white/[0.02]' : 'border-white/[0.04] bg-transparent'
                    }`}
                  >
                    <ShowIcon show={show} size={24} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-medium truncate ${st.done === 0 && st.fail === 0 ? 'text-white/25' : 'text-white/70'}`}>
                          {show.shortName}
                        </span>
                        <span className="font-mono text-[10px] text-white/30 ml-2">
                          {isDone ? `${st.done}/${st.total}` : st.done + st.fail === 0 ? `${st.total} eps` : `${st.done}/${st.total}`}
                          {st.fail > 0 && <span className="text-red-400/60 ml-1">({st.fail} fail)</span>}
                        </span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full transition-[width] duration-200 ease-out"
                          style={{
                            width: `${pct.toFixed(1)}%`,
                            background: isDone ? 'rgba(255,255,255,0.3)' : isActive ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.15)'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelDownload}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white/50 transition hover:border-red-400/30 hover:text-red-300/80"
              >
                Cancel
              </button>
              <button
                onClick={finish}
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white/50 transition hover:border-white/20 hover:text-white/80"
              >
                Continue in background
              </button>
            </div>
          </div>
        )}

        {/* ===== DONE ===== */}
        {phase === 'done' && (
          <>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              <div className="text-lg font-semibold text-white">{fmtBytes(doneBytes)} Downloaded</div>
              <div className="mt-1 text-sm text-white/50">
                {doneEps} episode{doneEps !== 1 ? 's' : ''} from {server.name}
                {writeStatus === 'writing' && ' · saved to device folder'}
                {failEps > 0 && <span className="text-red-300/60"> · {failEps} failed</span>}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              {selectedShows.map(show => {
                const st = showStats[show.id] || { done: 0, fail: 0 };
                return (
                  <div key={show.id} className={`flex items-center gap-3 rounded-lg border px-4 py-2 ${
                    st.fail > 0 ? 'border-red-400/10 bg-red-400/[0.03]' : 'border-white/[0.06] bg-white/[0.02]'
                  }`}>
                    <svg className={`h-4 w-4 shrink-0 ${st.fail > 0 ? 'text-yellow-400/50' : 'text-white/50'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      {st.fail > 0
                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        : <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />}
                    </svg>
                    <ShowIcon show={show} size={20} />
                    <span className="text-xs text-white/60 truncate flex-1">{show.shortName}</span>
                    <span className="font-mono text-[10px] text-white/30">
                      {st.done}/{totalEpisodes(show)}
                      {st.fail > 0 && <span className="text-red-300/50 ml-1">{st.fail} fail</span>}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={finish}
              className="rounded-xl border border-white/20 bg-white text-black px-5 py-3 text-sm font-semibold transition hover:bg-white/90"
            >
              Start Watching
            </button>
          </>
        )}

        <div className="pt-4 text-center font-mono text-[10px] text-white/20">
          adventure · offline mode
        </div>
      </div>
    </div>
  );
}

/* ---- Tiny stat display component ---- */
function Stat({ label, value }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-white/30">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-white/80">{value}</div>
    </div>
  );
}
