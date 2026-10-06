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
  if (globalThis.osuImportFiles && fileInput.files.length) osuImportFiles([...fileInput.files]);
  fileInput.value = "";
};
navigator.storage?.persist?.().catch(() => {});

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
        for (let i = 0; i < total; i++) {
        const rec = await new Promise((resolve, reject) => {
            const tx = db.transaction("chunks", "readonly");
            const out = req(tx.objectStore("chunks").get(chunkKey(m.path, i)));
            txDone(tx).then(() => resolve(out), reject);
          });
          const data = rec?.data ?? new Uint8Array(0);
          if (i === 0) fs.writeFile(m.path, data);
          else if (fs.appendFile) fs.appendFile(m.path, data);
          else {
            const cur = fs.readFile(m.path);
            const merged = new Uint8Array(cur.length + data.length);
            merged.set(cur, 0);
            merged.set(data, cur.length);
            fs.writeFile(m.path, merged);
          }
        }
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
          console.warn("osu! data flush failed for", r.path, e);
        }
        await gap();
        continue;
      }
      try {
        const db = await fsDb();
        const tx = db.transaction(["meta", "chunks"], "readwrite");
        const meta = tx.objectStore("meta");
        const chunks = tx.objectStore("chunks");
        for (const path of deletes.splice(0)) {
          meta.delete(path);
          cleanupChunks(chunks, path, chunkIndex, 0);
        }
        for (const r of batch) {
          let data;
          try {
            data = new Uint8Array(fs.readFile(r.path));
          } catch (e) {
            console.warn("osu! data flush failed for", r.path, e);
            continue;
          }
          cleanupChunks(chunks, r.path, chunkIndex, 1);
          chunks.put({ path: chunkKey(r.path, 0), data });
          meta.put({ path: r.path, size: r.size, mtime: r.mtime, chunks: 1 });
        }
        await txDone(tx);
        writes += batch.length;
        for (const r of batch) {
          prev.set(r.path, { path: r.path, size: r.size, mtime: r.mtime, chunks: 1 });
          markSaved(r, 1);
        }
      } catch (e) {
        console.warn("osu! data flush failed", e);
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
      seen.add(full);
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
          const db = await fsDb();
          const tx = db.transaction(["meta", "chunks"], "readwrite");
          const data = new Uint8Array(fs.readFile(p));
          const total = Math.ceil(data.length / CHUNK_SIZE);
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
    else if (osuLowRam || awkward) globalThis.__osuDpr = "1";
  }
  console.info(
    "[osu!] memory profile: " + osuMemProfile + " (deviceMemory " + osuDeviceMemory + ", dpr " + (globalThis.__osuDpr ?? "auto") + ")",
  );

  status.textContent = "checking game files…";
  const checked = new Set();
  const reassembling = new Map();
  let lastProgressUi = 0;
  const showProgress = () => {
    const now = Date.now();
    if (now - lastProgressUi < 200) return;
    lastProgressUi = now;
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
  addEventListener("message", (e) => {
    const d = e.data;
    if (!d || !d.file) return;
    if (d.type === "osu-fw-progress") {
      checked.add(d.file);
      showProgress();
    } else if (d.type === "osu-fw-reassemble") {
      reassembling.set(d.file, d.idx);
      if (d.idx >= d.total) reassembling.delete(d.file);
      showProgress();
    }
  });

  const fmt = (bytes) => (bytes / 1048576).toFixed(0) + " MB";
  const runtime = await dotnet
    .withModuleConfig({
      onDownloadResourceProgress: (done, total) => {
        if (!total) {
          status.textContent = "downloading game files…";
          return;
        }
        const pct = Math.min(100, (done / total) * 100);
        bar.style.width = (33 + pct * 0.33).toFixed(1) + "%";
        status.textContent =
          "downloading game files · " + fmt(done) + " / " + fmt(total) + " · " + pct.toFixed(0) + "%";
      },
    })
    .withConfig({
      pthreadPoolInitialSize: 10,
      pthreadPoolUnusedSize: 2,
      maxParallelDownloads: osuLowRam ? 8 : 16,
      jsThreadBlockingMode: "DangerousAllowBlockingWait",
      runtimeOptions: ["--no-jiterpreter-traces-enabled"],
    })
    .withEnvironmentVariable("MONO_SLEEP_ABORT_LIMIT", "60000")
    .withEnvironmentVariable(
      "MONO_GC_PARAMS",
      osuVeryLowRam ? "nursery-size=16m" : osuLowRam ? "nursery-size=32m" : "nursery-size=64m",
    )
    .withEnvironmentVariable("DOTNET_ThreadPool_ForceMinWorkerThreads", "8")
    .withApplicationArguments(...(params.has("debug") ? ["--debug"] : []))
    .create();

  bar.style.width = "66%";
  status.textContent = "restoring your data…";
  await restoreAll().catch((e) => console.warn("osu! data restore failed", e));
  status.textContent = "starting osu!…";
  bar.style.width = "90%";
  $("loading").classList.add("starting");
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

  const quickFlush = () => globalThis.osuFsFlush().catch((e) => console.warn("osu! data flush failed", e));
  setInterval(scheduleFlush, 20000);
  addEventListener("pagehide", quickFlush);
  addEventListener("beforeunload", quickFlush);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) quickFlush();
  });

  await runtime.runMain();
  scheduleFlush();
} catch (e) {
  console.error(e);
  osuShowFatal("osu! failed to start.\n\n" + (e?.stack ?? e));
}
