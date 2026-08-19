// ------------------------------------------------------------------
//  Offline data management — Cache API + File System Access API + meta
// ------------------------------------------------------------------

const OFFLINE_META_KEY = 'adventure:offline';
export const CACHE_NAME = 'adventure-offline';
const DB_NAME = 'adventure-offline-fs';
const DB_VERSION = 1;
const DIR_STORE = 'handles';

// ---- localStorage metadata ----

export function getOfflineMeta() {
  try {
    const raw = localStorage.getItem(OFFLINE_META_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setOfflineMeta(meta) {
  try { localStorage.setItem(OFFLINE_META_KEY, JSON.stringify(meta)); } catch {}
}

export function clearOfflineMeta() {
  try { localStorage.removeItem(OFFLINE_META_KEY); } catch {}
}

// ---- Cache API ----

export async function openCache() {
  try { return await caches.open(CACHE_NAME); } catch { return null; }
}

export async function getCachedCount() {
  const cache = await openCache();
  if (!cache) return 0;
  try {
    const keys = await cache.keys();
    return keys.length;
  } catch { return 0; }
}

export async function clearOfflineCache() {
  try { await caches.delete(CACHE_NAME); } catch {}
}

// ---- Full clear ----

export async function clearAllOfflineData() {
  await clearOfflineCache();
  clearOfflineMeta();
  await removeDirHandle();
}

// ---- File System Access API ----

export const supportsFileAccess =
  typeof window !== 'undefined' && 'showDirectoryPicker' in window;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DIR_STORE)) {
        db.createObjectStore(DIR_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Persist a FileSystemDirectoryHandle in IndexedDB. */
export async function saveDirHandle(handle) {
  try {
    const db = await openDB();
    const tx = db.transaction(DIR_STORE, 'readwrite');
    tx.objectStore(DIR_STORE).put(handle, 'offlineDir');
    await new Promise((res, rej) => {
      tx.oncomplete = res;
      tx.onerror = () => rej(tx.error);
    });
  } catch { /* storage may be unavailable */ }
}

/** Retrieve a previously saved FileSystemDirectoryHandle. */
export async function getDirHandle() {
  try {
    const db = await openDB();
    const tx = db.transaction(DIR_STORE, 'readonly');
    const req = tx.objectStore(DIR_STORE).get('offlineDir');
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch { return null; }
}

/** Remove persisted directory handle. */
export async function removeDirHandle() {
  try {
    const db = await openDB();
    const tx = db.transaction(DIR_STORE, 'readwrite');
    tx.objectStore(DIR_STORE).delete('offlineDir');
    await new Promise((res) => { tx.oncomplete = res; tx.onerror = res; });
  } catch {}
}

/**
 * Write an episode file into the user-chosen folder.
 * Structure:  <dir>/<ShowName>/Season XX/Episode XX.html
 */
export async function writeEpisodeFile(dirHandle, showName, season, episode, content) {
  const safe = showName.replace(/[/\\?%*:|"<>]/g, '-');
  const showDir = await dirHandle.getDirectoryHandle(safe, { create: true });
  const sLabel = `Season ${String(season).padStart(2, '0')}`;
  const seasonDir = await showDir.getDirectoryHandle(sLabel, { create: true });
  const eLabel = `Episode ${String(episode).padStart(2, '0')}.html`;
  const fh = await seasonDir.getFileHandle(eLabel, { create: true });
  const w = await fh.createWritable();
  await w.write(content);
  await w.close();
}

/**
 * Build a self-contained HTML launcher page for an episode.
 * Used when the embed server blocks CORS (opaque response)
 * — the file still opens locally and loads the stream via iframe.
 */
export function makeLauncherHTML(showName, season, episode, url) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${showName} S${String(season).padStart(2, '0')}E${String(episode).padStart(2, '0')}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#000;overflow:hidden}
iframe{width:100vw;height:100vh;border:none}
</style>
</head>
<body>
<iframe src="${url}" allowfullscreen allow="autoplay;encrypted-media;picture-in-picture"></iframe>
</body>
</html>`;
}

/**
 * Fetch a single episode — tries CORS first for readable content,
 * falls back to no-cors (gets cached but body is opaque).
 * Returns { response, readable, bytes }.
 */
export async function fetchEpisode(url) {
  // Attempt 1: CORS — we can read the body and write real files
  try {
    const resp = await fetch(url, {
      mode: 'cors',
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000)
    });
    if (resp.ok || resp.status === 0) {
      // status 0 = opaque (shouldn't happen in cors mode, but just in case)
      if (resp.status === 0) throw new Error('opaque');
      const text = await resp.text();
      const bytes = new TextEncoder().encode(text).byteLength;
      return { response: resp, readable: true, bytes, html: text };
    }
  } catch { /* CORS blocked — fall through */ }

  // Attempt 2: no-cors — real network request, opaque response, can be cached
  try {
    const resp = await fetch(url, {
      mode: 'no-cors',
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000)
    });
    // Measure bytes via Performance API
    let bytes = 0;
    try {
      const entries = performance.getEntriesByName(url, 'resource');
      if (entries.length > 0) {
        const e = entries[entries.length - 1];
        bytes = e.transferSize || e.encodedBodySize || 0;
      }
    } catch {}
    return { response: resp, readable: false, bytes: bytes || 180_000, html: null };
  } catch (err) {
    throw err;
  }
}
