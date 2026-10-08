const params = new URLSearchParams(location.search);
const $ = (id) => document.getElementById(id);
const bar = $("loading-bar");
const status = $("loading-status");

globalThis.osuShowFatal = (text) => {
  $("loading").classList.add("hide");
  $("crash-text").textContent = text;
  $("crash").hidden = false;
};
$("crash-reload").onclick = () => location.reload();
$("crash-copy").onclick = async ({ target }) => {
  target.disabled = true;
  try {
    await navigator.clipboard.writeText($("crash-text").textContent);
    target.textContent = "Copied!";
  } catch {
    target.textContent = "Copy failed";
  }
  setTimeout(() => {
    target.textContent = "Copy log";
    target.disabled = false;
  }, 1500);
};

// --- reset-all-data (loading-screen button) --------------------------------
// First click arms, second click confirms. The click only clears caches and
// the service worker, then reloads with a flag; the actual IndexedDB wipe
// happens at the top of the fresh boot, before anything reopens a
// connection (deleteDatabase blocks while connections are open).
const idbDelete = async (name) => {
  for (let i = 0; i < 6; i++) {
    // A connection left by the dying page (e.g. the unload flush) blocks the
    // delete: wait it out and retry instead of silently keeping the data.
    const gone = await new Promise((resolve) => {
      const rq = indexedDB.deleteDatabase(name);
      rq.onsuccess = () => resolve(true);
      rq.onerror = () => resolve(false);
      rq.onblocked = () => setTimeout(() => resolve(false), 600);
    });
    if (gone) return true;
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
};
if (sessionStorage.getItem("osu-reset")) {
  sessionStorage.removeItem("osu-reset");
  try {
    await idbDelete("osu-fs");
    await idbDelete("osu-library");
    for (const k of await caches.keys()) await caches.delete(k);
    for (const r of await navigator.serviceWorker?.getRegistrations() ?? []) await r.unregister();
    console.info("[osu!] reset complete: game files, library and settings wiped");
  } catch (e) {
    console.warn("[osu!] reset failed", e);
  }
}
const resetBtn = $("loading-reset");
let resetArmed = false;
resetBtn.onclick = async () => {
  if (!resetArmed) {
    resetArmed = true;
    resetBtn.classList.add("armed");
    resetBtn.textContent = "click again to confirm — wipes EVERYTHING";
    return;
  }
  resetBtn.disabled = true;
  resetBtn.textContent = "clearing…";
  try {
    sessionStorage.setItem("osu-reset", "1");
    for (const k of await caches.keys()) await caches.delete(k);
    for (const r of await navigator.serviceWorker?.getRegistrations() ?? []) await r.unregister();
  } catch (e) {
    console.warn("[osu!] reset cleanup failed", e);
  }
  location.reload();
};

// --- crash watchdog ---------------------------------------------------------
// A fatal runtime abort (GC suspend deadlock etc.) leaves the page frozen with
// no way out. The game drives frames through requestAnimationFrame, so if
// frames stop while the tab is visible, the runtime is wedged: explain and
// auto-reload — the flusher has already saved everything, so a reload is safe.
// Add ?nowatchdog to disable.
let lastFrameAt = 0;
let framesSeen = 0;
let watchdogArmed = false;
{
  const rawRaf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) =>
    rawRaf((t) => {
      framesSeen++;
      lastFrameAt = performance.now();
      if (framesSeen === 30) watchdogArmed = true; // render loop is alive
      return cb(t);
    });
}
setInterval(() => {
  if (params.has("nowatchdog") || !watchdogArmed) return;
  if (document.visibilityState !== "visible") return;
  if (lastFrameAt && performance.now() - lastFrameAt > 8000) {
    watchdogArmed = false;
    osuShowFatal(
      "osu! stopped responding — the game runtime hit a fatal internal error.\n\n" +
        "Your library, skins and settings are already saved. Reloading in a moment…",
    );
    setTimeout(() => location.reload(), 2500);
  }
}, 1000);

async function ensureServiceWorker() {
  const sw = navigator.serviceWorker;
  if (!sw) return;
  if (sw.controller) {
    sessionStorage.removeItem("osu-sw-reload");
  } else {
    await sw.register("sw.js");
    await sw.ready;
    if (!sessionStorage.getItem("osu-sw-reload")) {
      sessionStorage.setItem("osu-sw-reload", "1");
      location.reload();
      await new Promise(() => {});
    }
  }
  // When an updated worker takes over mid-session (after a deploy), reload
  // exactly once so the game boots under the new worker from the start —
  // otherwise its first big-file fetches race the old worker and fail SRI.
  let swapped = sessionStorage.getItem("osu-sw-reload") === "1";
  sw.addEventListener("controllerchange", () => {
    if (sw.controller && !swapped) {
      swapped = true;
      sessionStorage.setItem("osu-sw-reload", "1");
      location.reload();
    }
  });
  if (sw.controller) sessionStorage.removeItem("osu-sw-reload");
}
try {
  await ensureServiceWorker();
} catch (e) {
  console.warn("service worker unavailable", e);
}
if (!crossOriginIsolated) {
  osuShowFatal(
    "This browser didn't allow the page to be cross-origin isolated, which osu! needs for multithreading.\n\nIf you're hosting this yourself, serve it over https (or localhost) and either keep sw.js next to index.html, or send these headers:\n\n  Cross-Origin-Opener-Policy: same-origin\n  Cross-Origin-Embedder-Policy: require-corp",
  );
  throw new Error("not cross-origin isolated");
}

globalThis.osuOffscreenCanvas = $("osu-canvas").transferControlToOffscreen();
globalThis.osuGetOrigin = () => location.origin;

const fileInput = $("file-input");
fileInput.onchange = () => {
  if (globalThis.osuImportFiles && fileInput.files.length) globalThis.osuImportFiles([...fileInput.files]);
  fileInput.value = "";
};
navigator.storage?.persist?.().catch(() => {});

// ---------------------------------------------------------------------------
// Persistent import library (IndexedDB "osu-library", store "packs").
// The game keeps its beatmap/skin catalog in an in-memory database (no
// client.realm ever exists on disk and the default map is re-imported on
// every boot), so imports would vanish on reload. We keep the raw
// .osz/.osk packs and re-feed them to the game after every boot instead.
// Console helpers: osuLibraryList(), osuLibraryForget(name).
// ---------------------------------------------------------------------------
function libDb() {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open("osu-library", 1);
    open.onupgradeneeded = () => {
      if (!open.result.objectStoreNames.contains("packs"))
        open.result.createObjectStore("packs", { keyPath: "key" });
    };
    open.onsuccess = () => resolve(open.result);
    open.onerror = () => reject(open.error);
  });
}
const libTx = (store, mode, run) =>
  libDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(store, mode);
        const out = run(tx.objectStore(store));
        tx.oncomplete = () => {
          try {
            resolve(out instanceof IDBRequest ? out.result : out);
          } catch {
            resolve(undefined);
          }
        };
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      }),
  );
const libIsPack = (f) => /\.(osz|osk|olz)$/i.test(f?.name ?? "");

async function libSavePack(file) {
  if (!libIsPack(file) || file.size > 256 * 1024 * 1024) return;
  try {
    const data = new Uint8Array(await file.arrayBuffer());
    await libTx("packs", "readwrite", (s) =>
      s.put({ key: file.name + "#" + file.size, name: file.name, size: file.size, type: file.type, added: Date.now(), data }),
    );
    console.info("[osu!] saved " + file.name + " (" + (file.size / 1048576).toFixed(1) + " MB) to the persistent library");
  } catch (e) {
    console.warn("[osu!] could not save " + file.name + " to the persistent library", e);
  }
}
globalThis.osuLibraryList = () =>
  libTx("packs", "readonly", (s) => s.getAll()).then((all) =>
    all.map((p) => ({ name: p.name, size: p.size, added: new Date(p.added).toISOString() })),
  );
globalThis.osuLibraryForget = (name) =>
  libTx("packs", "readwrite", (s) => s.getAllKeys()).then((keys) =>
    libTx("packs", "readwrite", (s) => {
      for (const k of keys) if (String(k).startsWith(name + "#")) s.delete(k);
    }),
  );

// The runtime assigns osuImportFiles during boot; capture it once available,
// then replace it with a wrapper so every page-driven import (picker + our
// drag-drop) also lands in the persistent library.
let __rawImportFiles = null;
let libraryRestoreStarted = false;
async function restoreLibrary() {
  if (libraryRestoreStarted || params.has("nolibrary")) return;
  libraryRestoreStarted = true;
  try {
    const packs = await libTx("packs", "readonly", (s) => s.getAll());
    if (!packs.length) return;
    const files = packs.map((p) => new File([p.data], p.name, { type: p.type || "application/octet-stream" }));
    console.info("[osu!] restoring " + packs.length + " saved beatmap pack(s) from the persistent library");
    __rawImportFiles(files);
  } catch (e) {
    console.warn("[osu!] library restore failed", e);
  }
}
const libraryWatch = setInterval(() => {
  if (typeof globalThis.osuImportFiles !== "function") return;
  clearInterval(libraryWatch);
  __rawImportFiles = globalThis.osuImportFiles;
  globalThis.osuImportFiles = (files) => {
    for (const f of files) libSavePack(f);
    return __rawImportFiles(files);
  };
  if ($("loading").classList.contains("hide")) restoreLibrary();
  else
    new MutationObserver((_, obs) => {
      if ($("loading").classList.contains("hide")) {
        obs.disconnect();
        setTimeout(restoreLibrary, 3000); // let the menu settle first
      }
    }).observe($("loading"), { attributes: true, attributeFilter: ["class"] });
}, 400);

// Drag-drop import (the #drop overlay + body.osu-dragging styles exist but
// no JS implemented them). Capture phase so we win over any in-game handler.
addEventListener("dragenter", (e) => {
  e.preventDefault();
  document.body.classList.add("osu-dragging");
});
addEventListener("dragover", (e) => e.preventDefault());
addEventListener("dragleave", (e) => {
  if (!e.relatedTarget) document.body.classList.remove("osu-dragging");
});
addEventListener(
  "drop",
  (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.body.classList.remove("osu-dragging");
    const files = [...(e.dataTransfer?.files ?? [])];
    if (files.length) globalThis.osuImportFiles?.(files);
  },
  true,
);

// ---------------------------------------------------------------------------
// Persistent file system (IndexedDB, database "osu-fs", version 2).
//   meta store:  { path, size, mtime, chunks }   one record per file
//   chunk store: { path: "<file>:<index>", data: Uint8Array }
// Files up to CHUNK_SPLIT bytes are stored as one chunk "<file>:0"; larger
// files are stored as fixed-size CHUNK_SIZE chunks. Everything is read back
// by key or cursor, never as one giant blob, so a multi-GB beatmap library
// never has to fit in memory at once. Flush is incremental (mtime + size
// diff) and drains queue buffer aside so the queue stays bounded.
// ---------------------------------------------------------------------------
const CHUNK_SPLIT = 4 * 1024 * 1024;
const CHUNK_SIZE = 3 * 1024 * 1024;
const MAX_TX_BYTES = 8 * 1024 * 1024; // per-transaction write budget
const HUGE_FILE_DEFER = 96 * 1024 * 1024;

let dbPromise = null;
function fsDb() {
  return (dbPromise ??= new Promise((resolve, reject) => {
    const open = indexedDB.open("osu-fs", 2);
    open.onupgradeneeded = () => {
      const db = open.result;
      if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta", { keyPath: "path" });
      if (!db.objectStoreNames.contains("chunks")) db.createObjectStore("chunks", { keyPath: "path" });
      if (db.objectStoreNames.contains("files")) db.deleteObjectStore("files");
    };
    open.onsuccess = () => resolve(open.result);
    open.onerror = () => reject(open.error);
  }));
}

async function withStores(mode, names, fn) {
  const db = await fsDb();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(names, mode);
    const out = fn(tx);
    tx.oncomplete = () => resolve(out);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

const req = (r) =>
  new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });

// The DB handle is shared for the page's lifetime — caller functions must
// not close it (closing an in-use connection aborts sibling transactions
// with InvalidStateError).

const txDone = (tx) =>
  new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });

const fsSkip = (p) =>
  p === "/tmp" ||
  p.startsWith("/tmp/") ||
  p === "/dev" ||
  p.startsWith("/dev/") ||
  p === "/proc" ||
  p.startsWith("/proc/") ||
  // online.db is a server-provided cache (89 MB) the game re-downloads from
  // ppy.sh on every boot; persisting it only burns quota and fails with
  // QuotaExceededError once the beatmap library grows.
  p.endsWith("/online.db");

const chunkKey = (path, index) => path + ":" + index;
const splitChunkKey = (key) => {
  const at = key.lastIndexOf(":");
  return [key.slice(0, at), Number(key.slice(at + 1))];
};

// --- one shared metadata snapshot per page load -----------------------------
let versionsReady = null; // the RESOLVED snapshot object (not a promise)
let versionsPromise = null;
function loadVersions() {
  if (versionsReady) return versionsReady;
  if (!versionsPromise) {
    versionsPromise = (async () => {
      const db = await fsDb();
      const tx = db.transaction(["meta", "chunks"], "readonly");
      const metas = await req(tx.objectStore("meta").getAll());
      const keys = await new Promise((resolve) => {
        const out = [];
        const cursor = tx.objectStore("chunks").openKeyCursor();
        cursor.onsuccess = () => {
          const it = cursor.result;
          if (it) {
            out.push(String(it.primaryKey));
            it.continue();
          } else resolve(out);
        };
        cursor.onerror = () => resolve(out);
      });
      await txDone(tx);
      const chunkIndex = new Map();
      for (const key of keys) {
        const [path, index] = splitChunkKey(key);
        let entry = chunkIndex.get(path);
        if (!entry) chunkIndex.set(path, (entry = { present: new Set(), maxKnown: -1 }));
        entry.present.add(index);
        if (index > entry.maxKnown) entry.maxKnown = index;
      }
      return { metas, chunkIndex };
    })();
    versionsPromise.catch(() => {
      versionsPromise = null;
    });
  }
  return versionsPromise.then((snap) => {
    versionsReady = snap;
    return snap;
  });
}

// Drop stale chunk rows when a file shrinks, disappears, or changes storage
// layout. Mutates the in-memory chunkIndex to stay in sync; a truly aborted
// transaction self-heals on the next reload because the snapshot is rebuilt.
function cleanupChunks(chunks, path, chunkIndex, keepTotal) {
  const entry = chunkIndex.get(path);
  if (!entry) return;
  for (const index of entry.present) if (index >= keepTotal) chunks.delete(chunkKey(path, index));
  entry.present = new Set([...entry.present].filter((i) => i < keepTotal));
  if (keepTotal > 0) entry.maxKnown = Math.max(entry.maxKnown, keepTotal - 1);
}

async function restoreAll() {
  const fs = globalThis.__osuFs;
  if (!fs) return;
  const { metas, chunkIndex } = await loadVersions();
  let restored = 0;
  const db = await fsDb();
  {
    for (const m of metas) {
      const total = m.chunks ?? 1;
      const entry = chunkIndex.get(m.path);
      const complete =
        entry &&
        entry.present.size === total &&
        (total === 1 ? entry.present.has(0) : [...entry.present].every((i) => i >= 0 && i < total));
      if (!complete) {
        console.warn("osu! data incomplete for " + m.path + ", skipping its restore");
        continue;
      }
      try {
        fs.mkdirTree(m.path.slice(0, m.path.lastIndexOf("/")));
        // Single-pass reassembly: each file is one concat of its chunks (plus
        // one zero-chunk write for single-chunk files) instead of O(n²)
        // append-onto-a-growing-buffer copies — this was the multi-hundred-ms
        // hitch per large file during boot on low-end devices.
        let acc = null;
        for (let i = 0; i < total; i++) {
          const rec = await new Promise((resolve, reject) => {
            const tx = db.transaction("chunks", "readonly");
            const out = req(tx.objectStore("chunks").get(chunkKey(m.path, i)));
            txDone(tx).then(() => resolve(out), reject);
          });
          const data = rec?.data ?? new Uint8Array(0);
          if (acc === null) acc = data;
          else {
            const merged = new Uint8Array(acc.length + data.length);
            merged.set(acc, 0);
            merged.set(data, acc.length);
            acc = merged;
          }
        }
        fs.writeFile(m.path, acc ?? new Uint8Array(0));
        restored++;
      } catch (e) {
        console.warn("osu! data restore failed for", m.path, e);
      }
    }
  }
  console.info("[osu!] restored " + restored + "/" + metas.length + " files from IndexedDB");
}

// --- flushing (immediate-ish, but always chunked) ---------------------------
let flushing = false;
let flushQueued = false;
function scheduleFlush() {
  // A pending reset is about to wipe this database — don't resurrect data
  // with an unload flush racing the delete.
  if (sessionStorage.getItem("osu-reset")) return;
  if (flushing) {
    flushQueued = true;
    return;
  }
  flushing = true;
  globalThis
    .osuFsFlush()
    .catch((e) => console.warn("osu! data flush failed", e))
    .finally(() => {
      flushing = false;
      if (flushQueued) {
        flushQueued = false;
        scheduleFlush();
      }
    });
}
// The runtime never flushes again after the boot-time call: settings,
// keybinds, skin choices — anything the game saves mid-session — stayed in
// the in-memory VFS and died on reload. Flush on a light cadence, and
// immediately when the tab is hidden or closed (pagehide/beforeunload).
// The flush is incremental (mtime/size diff), so idle rounds read nothing.
setInterval(() => {
  if (document.visibilityState === "visible") scheduleFlush();
}, 20000);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") scheduleFlush();
});
addEventListener("pagehide", scheduleFlush);
addEventListener("beforeunload", scheduleFlush);

// Keep both the per-flush diff map and the page-cached snapshot in sync —
// otherwise every flush re-writes everything against a stale snapshot.
const markSaved = (r, total) => {
  const list = versionsReady?.metas;
  if (list) {
    const ex = list.find((m) => m.path === r.path);
    if (ex) {
      ex.size = r.size;
      ex.mtime = r.mtime;
      ex.chunks = total;
      if ("rev" in ex) delete ex.rev;
    } else list.push({ path: r.path, size: r.size, mtime: r.mtime, chunks: total });
  }
};
const markDeleted = (p) => {
  const list = versionsReady?.metas;
  if (list) {
    const i = list.findIndex((m) => m.path === p);
    if (i >= 0) list.splice(i, 1);
  }
};

let hugeWarnedAt = 0;
// Files that failed to save with QuotaExceededError pause retries for a while —
// re-attempting an 89 MB write every flush cycle both fails again and freezes
// the game for hundreds of ms each time.
const quotaSkip = new Map(); // path -> ms timestamp
let quotaWarnedAt = 0;
globalThis.osuFsFlush = async () => {
  const fs = globalThis.__osuFs;
  if (!fs) return;
  const { metas, chunkIndex } = await loadVersions();
  const prev = new Map(metas.map((m) => [m.path, m]));
  let records = [];
  const deletes = [];
  const seen = new Set();
  let bytesQueued = 0;
  let deferred = 0;
  let writes = 0;

  // Writes commit in small transactions (≤MAX_TX_BYTES each, one file per
  // transaction when a single file exceeds the budget) with event-loop gaps
  // between, so a first-run save burst or a beatmap import can never pin the
  // main thread for hundreds of milliseconds at a time.
  const gap = () => new Promise((r) => setTimeout(r, 0));
  const drain = async () => {
    for (;;) {
      if (!records.length && !deletes.length) return;
      const batch = [];
      let bytes = 0;
      while (records.length && bytes < MAX_TX_BYTES) {
        const r = records.shift();
        batch.push(r);
        bytes += r.size ?? 0;
      }
      bytesQueued = 0;
      const multiIdx = batch.findIndex((r) => (r.size ?? 0) > CHUNK_SPLIT);
      if (multiIdx >= 0) {
        // One oversized file: give it its own transaction.
        const r = batch.splice(multiIdx, 1)[0];
        records.unshift(...batch);
        try {
          await gap();
          const data = new Uint8Array(fs.readFile(r.path));
          const total = Math.ceil(data.length / CHUNK_SIZE);
          const db = await fsDb();
          const tx = db.transaction(["meta", "chunks"], "readwrite");
          const chunks = tx.objectStore("chunks");
          cleanupChunks(chunks, r.path, chunkIndex, total);
          for (let i = 0; i < total; i++)
            chunks.put({ path: chunkKey(r.path, i), data: data.subarray(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE) });
          tx.objectStore("meta").put({ path: r.path, size: r.size, mtime: r.mtime, chunks: total });
          await txDone(tx);
          writes++;
          prev.set(r.path, { path: r.path, size: r.size, mtime: r.mtime, chunks: total });
          markSaved(r, total);
        } catch (e) {
          if (e?.name === "QuotaExceededError") quotaSkip.set(r.path, Date.now() + 5 * 60 * 1000);
          console.warn("osu! data flush failed for", r.path, e);
        }
        await gap();
        continue;
      }
      try {
        // Reads happen outside the transaction: IndexedDB transactions
        // auto-commit the moment the event loop turns with no pending
        // requests, so nothing may yield between opening one and its last
        // put. Yields between reads are also what lets the runtime pump
        // GC safepoints and service blocking interop from other threads
        // (see the walk() note) without ever tearing a transaction.
        const datas = [];
        for (const r of batch) {
          let data;
          try {
            if (datas.length) await gap();
            data = new Uint8Array(fs.readFile(r.path));
          } catch (e) {
            console.warn("osu! data flush failed for", r.path, e);
            continue;
          }
          datas.push([r, data]);
        }
        const db = await fsDb();
        const tx = db.transaction(["meta", "chunks"], "readwrite");
        const meta = tx.objectStore("meta");
        const chunks = tx.objectStore("chunks");
        for (const path of deletes.splice(0)) {
          meta.delete(path);
          cleanupChunks(chunks, path, chunkIndex, 0);
        }
        for (const [r, data] of datas) {
          cleanupChunks(chunks, r.path, chunkIndex, 1);
          chunks.put({ path: chunkKey(r.path, 0), data });
          meta.put({ path: r.path, size: r.size, mtime: r.mtime, chunks: 1 });
        }
        await txDone(tx);
        writes += datas.length;
        for (const [r] of datas) {
          prev.set(r.path, { path: r.path, size: r.size, mtime: r.mtime, chunks: 1 });
          markSaved(r, 1);
        }
      } catch (e) {
        if (e?.name === "QuotaExceededError") {
          // One oversized file aborts the whole transaction; cool every file in
          // the batch down instead of re-attempting (and stuttering) each cycle.
          const until = Date.now() + 5 * 60 * 1000;
          for (const r of batch) quotaSkip.set(r.path, until);
          if (Date.now() - quotaWarnedAt > 60000) {
            quotaWarnedAt = Date.now();
            console.warn("[osu!] storage quota full — pausing saves of " + batch.length + " file(s) for 5 minutes");
          }
        } else console.warn("osu! data flush failed", e);
      }
      if (records.length || deletes.length) await gap();
    }
  };

  const walk = async (p, depth) => {
    let names;
    try {
      names = fs.readdir(p);
    } catch {
      return;
    }
    // Every fs.* call here is synchronous emscripten interop on the UI
    // thread; back-to-back calls pin the thread where the runtime cannot
    // service GC suspension or blocking interop from other threads (jsww
    // proxies its calls to us), which has deadlocked the GC mid-game.
    // Yield to the event loop regularly so managed code keeps pumping.
    let scanned = 0;
    for (const name of names) {
      if (name === "." || name === "..") continue;
      const full = (p === "/" ? "" : p) + "/" + name;
      if (fsSkip(full)) continue;
      let st;
      try {
        st = fs.stat(full);
      } catch {
        continue;
      }
      if (fs.isDir(st.mode)) {
        seen.add(full);
        if (depth < 14) await walk(full, depth + 1);
        continue;
      }
      if (!fs.isFile(st.mode)) continue;
      if (++scanned % 32 === 0) await gap();
      seen.add(full);
      if ((quotaSkip.get(full) ?? 0) > Date.now()) continue;
      const mtime = st.mtime?.getTime() ?? 0;
      const old = prev.get(full);
      if (old && old.mtime === mtime && old.size === st.size) continue;
      if (st.size > HUGE_FILE_DEFER) {
        deferred++;
        if (Date.now() - hugeWarnedAt > 60000) {
          hugeWarnedAt = Date.now();
          console.info(
            "[osu!] deferring save of " + (st.size / 1048576).toFixed(0) + " MB file(s); they flush after the game idle",
          );
        }
        continue;
      }
      records.push({ path: full, size: st.size, mtime });
      bytesQueued += st.size;
      if (bytesQueued > 24 * 1024 * 1024) await drain();
    }
  };

  try {
    await walk("/", 0);
    for (const p of prev.keys()) if (!seen.has(p)) deletes.push(p);
    await drain();
    for (const p of deletes) {
      prev.delete(p);
      markDeleted(p);
    }
    if (deferred) {
      // Retry deferred files directly so they eventually land once space or
      // an idle moment allows; each pass keeps memory bounded per file.
      for (const p of prev.keys()) {
        let st;
        try {
          st = fs.stat(p);
        } catch {
          continue;
        }
        if (st.size <= HUGE_FILE_DEFER) continue;
        await drain();
        records = [{ path: p, size: st.size, mtime: st.mtime?.getTime() ?? 0 }];
        try {
          const saved = records;
          records = [];
          await gap();
          const data = new Uint8Array(fs.readFile(p));
          const total = Math.ceil(data.length / CHUNK_SIZE);
          const db = await fsDb();
          const tx = db.transaction(["meta", "chunks"], "readwrite");
          cleanupChunks(tx.objectStore("chunks"), p, chunkIndex, total);
          for (let i = 0; i < total; i++)
            tx
              .objectStore("chunks")
              .put({ path: chunkKey(p, i), data: data.subarray(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE) });
          tx.objectStore("meta").put({ path: p, size: st.size, mtime: saved[0].mtime, chunks: total });
          await txDone(tx);
          prev.set(p, { path: p, size: st.size, mtime: saved[0].mtime, chunks: total });
          markSaved(saved[0], total);
          console.info("[osu!] flushed large file " + p + " (" + (st.size / 1048576).toFixed(0) + " MB)");
        } catch (e) {
          if (e?.name === "QuotaExceededError")
            console.warn("[osu!] storage quota full, skipping save of " + p + " for now");
          else console.warn("osu! data flush failed for", p, e);
        }
      }
    }
  } catch (e) {
    console.warn("osu! data flush failed", e);
  }
  if (writes||deferred) console.info("[osu!] flush done: wrote " + writes + ", deferred " + deferred);
};

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
try {
  const { dotnet } = await import("./_framework/dotnet.js");
  await import("./meta.js");
  const osuLowRam = globalThis.osuLowRam;
  const osuVeryLowRam = globalThis.osuVeryLowRam;
  const osuPerfRam = globalThis.osuPerfRam;
  const osuMemProfile = globalThis.osuMemProfile;
  const osuDeviceMemory = globalThis.osuDeviceMemory;
  if (osuLowRam === undefined) osuShowFatal("meta.js failed to initialize");

  // Render scale: user override wins, else pick a value the browser canvas
  // scaling handles robustly. Fractional device pixel ratios (1.25, 1.5) are
  // unreliable in this runtime, so clamp those to 1.
  const forcedDpr = params.get("dpr");
  if (forcedDpr) globalThis.__osuDpr = forcedDpr;
  else {
    const dsf = window.devicePixelRatio;
    const awkward = dsf !== 1 && dsf !== 2;
    if (osuVeryLowRam) globalThis.__osuDpr = "0.75";
    else if (osuPerfRam || osuLowRam || awkward) globalThis.__osuDpr = "1";
  }
  console.info(
    "[osu!] memory profile: " + osuMemProfile + " (deviceMemory " + osuDeviceMemory + ", dpr " + (globalThis.__osuDpr ?? "auto") + ")",
  );

  status.textContent = "checking game files…";
  const checked = new Set();
  const reassembling = new Map();
  const fmt = (bytes) => (bytes / 1048576).toFixed(1) + " MB";
  let lastProgressUi = 0;
  let dl = null; // latest { received, total } byte progress from the worker
  const showProgress = () => {
    const now = Date.now();
    if (now - lastProgressUi < 200) return;
    lastProgressUi = now;
    // Byte totals from the worker are the most honest readout while the
    // ~370 MB first-run download streams: the runtime's own progress callback
    // is silent while the big split files reassemble, and part counts alone
    // look frozen for minutes on a slow link.
    if (dl && dl.total > 0 && dl.received < dl.total) {
      const pct = Math.min(100, (dl.received / dl.total) * 100);
      bar.style.width = (33 + pct * 0.33).toFixed(1) + "%";
      status.textContent =
        "downloading game files · " + fmt(dl.received) + " / " + fmt(dl.total) + " · " + pct.toFixed(0) + "%";
      return;
    }
    if (reassembling.size) {
      // split 2-part files reassemble in MB chunks; show the part being fetched
      let line = "unwrapping game files";
      for (const [file, part] of reassembling)
        line = file + " · part " + part + " of 2";
      status.textContent = line;
      return;
    }
    bar.style.width = (33 + Math.min(33, (checked.size / 260) * 33)) + "%";
    status.textContent = "checking game files · " + checked.size + " / 260";
  };
  // SW client.postMessage events fire on the ServiceWorkerContainer, not on
  // window — a window listener silently never sees them.
  navigator.serviceWorker.addEventListener("message", (e) => {
    const d = e.data;
    if (!d) return;
    if (d.type === "osu-fw-dl") {
      dl = d;
      if (params.has("bootlog")) console.info("[bootlog] worker dl", fmt(d.received), "/", fmt(d.total));
      showProgress();
      return;
    }
    if (!d.file) return;
    if (d.type === "osu-fw-progress") {
      checked.add(d.file);
      showProgress();
    } else if (d.type === "osu-fw-reassemble") {
      reassembling.set(d.file, d.idx);
      if (d.idx >= d.total) reassembling.delete(d.file);
      showProgress();
    }
  });

  const runtime = await dotnet
    .withModuleConfig({
      onDownloadResourceProgress: (done, total) => {
        if (params.has("bootlog")) console.info("[bootlog] resource progress", done, total);
        // The runtime reports either bytes or item counts depending on phase;
        // below 1 MB totals the MB display is useless ("0 MB / 0 MB"), so
        // show raw counts instead. Bytes use one decimal to always tick.
        if (!total || done > total) {
          status.textContent = "downloading game files…";
          return;
        }
        const pct = Math.min(100, (done / total) * 100);
        bar.style.width = (33 + pct * 0.33).toFixed(1) + "%";
        status.textContent =
          total >= 1048576
            ? "downloading game files · " + fmt(done) + " / " + fmt(total) + " · " + pct.toFixed(0) + "%"
            : "downloading game files · " + done + " / " + total;
      },
    })
    .withConfig({
      // Thread pool sized per memory profile: on 4 GB devices only the min
      // 4 .NET threads run and a single pthread stays warm — fewer spawned
      // threads means less total memory, less GC pressure and fewer mid-game
      // pthread spawns (each one hitches the main thread briefly). The perf
      // profile keeps 6 spares hot so mid-game spawns are rare: on a capable
      // machine that trades memory for steady frame pacing.
      pthreadPoolInitialSize: osuPerfRam ? 12 : osuLowRam ? 8 : 10,
      pthreadPoolUnusedSize: osuPerfRam ? 6 : osuLowRam ? 2 : 4,
      maxParallelDownloads: osuLowRam ? 6 : 16,
      // NOTE: deliberately NOT setting jsThreadBlockingMode to
      // "DangerousAllowBlockingWait" — it lets the runtime hard-block the
      // browser's main thread, which prevents GC thread suspension and
      // crashes the game ("WAITING for N threads, got M suspended" →
      // mono-threads assertion → SynchronizationLockException). The default
      // JS-simulated waits cost a little latency but keep the GC alive.
      // Low-RAM devices also skip the jiterpreter entirely: it is the
      // single largest native-memory consumer on WASM and we can afford
      // neither its cache nor its warm-up spikes. The perf profile the
      // opposite trade — jiterpreter ON for faster interpreted code (this
      // build runs assemblies in interpreter mode, so it directly raises
      // sustained FPS on dense maps).
      runtimeOptions: osuLowRam
        ? ["--jiterpreter-traces-enabled=0"]
        : osuPerfRam && osuDeviceMemory >= 8
          ? []
          : ["--no-jiterpreter-traces-enabled"],
    })
    .withEnvironmentVariable(
      "MONO_GC_PARAMS",
      osuVeryLowRam ? "nursery-size=16m" : osuLowRam ? "nursery-size=32m" : "nursery-size=64m",
    )
    // NOTE: deliberately no MONO_SLEEP_ABORT_LIMIT override — the 60s setting
    // let threads stay un-suspendable in native blocking for a minute before a
    // force-abort, which orphaned monitors and crashed the game with
    // SynchronizationLockException storms (TimerQueueTimer.Dispose etc.).
    .withEnvironmentVariable(
      "DOTNET_ThreadPool_ForceMinWorkerThreads",
      osuLowRam ? "4" : osuPerfRam ? "12" : "8",
    )
    .withApplicationArguments(...(params.has("debug") ? ["--debug"] : []))
    .create();

  bar.style.width = "66%";
  status.textContent = "restoring your data…";
  // On low-RAM devices let the runtime allocate its heap first: a 100 MB+
  // restore burst racing mono's setup is the main boot OOM risk, and the
  // individual files stay small because the flusher caps them at 96 MB.
  const restore = restoreAll().catch((e) => console.warn("osu! data restore failed", e));
  const armOverlay = () => {
    const hide = () => $("loading").classList.add("hide");
    setTimeout(hide, 60000);
    new MutationObserver((_, obs) => {
      if ($("osu-canvas").style.cursor === "none") {
        obs.disconnect();
        setTimeout(hide, 500);
      }
    }).observe($("osu-canvas"), { attributes: true, attributeFilter: ["style"] });
    addEventListener("pointerdown", hide, { once: true });
    addEventListener("keydown", hide, { once: true });
  };
  armOverlay();
  if (osuLowRam) {
    status.textContent = "starting osu!…";
    await runtime.runMain();
    bar.style.width = "90%";
    status.textContent = "restoring your data…";
    await restore;
    scheduleFlush();
  } else {
    await restore;
    scheduleFlush();
    status.textContent = "starting osu!…";
    bar.style.width = "90%";
    await runtime.runMain();
  }
} catch (e) {
  console.error(e);
  osuShowFatal("osu! failed to start.\n\n" + (e?.stack ?? e));
}
