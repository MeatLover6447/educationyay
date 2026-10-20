/*
 * AIR-Runtime / ruffle-loader.js
 * -------------------------------
 * Creates the Ruffle player and loads a SWF into it.
 *
 * The engine is a patched build of Ruffle (https://ruffle.rs) vendored in
 * vendor/ruffle/ - see AIR-Runtime/README.md and ruffle-patches/ for what was
 * changed and how to rebuild it. Stock Ruffle cannot run this game: it runs out
 * of WebAssembly memory while loading, and its AIR file classes are empty stubs.
 *
 * Also tracks download progress of every .swf Ruffle fetches (the hub movie and
 * the three chapter files it loads itself), so the page can show a progress bar.
 */

(function () {
  const RUFFLE_SOURCE = "AIR-Runtime/vendor/ruffle/ruffle.js";
  const GAME_FILES_DIR = "Game Files/";

  // Ruffle can't see installed fonts on the web; these metric-compatible open
  // fonts (SIL OFL, see fonts/) stand in for Flash's generic _sans/_serif.
  const FONT_DIR = new URL("AIR-Runtime/fonts/", document.baseURI).href;
  const FONT_SOURCES = [
    "LiberationSans-Regular.ttf",
    "LiberationSans-Bold.ttf",
    "LiberationSerif-Regular.ttf",
    "LiberationSerif-Bold.ttf",
  ].map((f) => FONT_DIR + f);

  window.AIRRuntime = window.AIRRuntime || {};

  // ---- download progress ---------------------------------------------------
  // Ruffle's WebAssembly fetches through window.fetch, looked up at call time,
  // so wrapping it here sees every SWF request - including the chapter files
  // the game loads with its own Loader objects.
  const downloads = new Map(); // url -> { loaded, total, done }
  let progressListener = null;

  function reportProgress() {
    if (!progressListener) return;
    let loaded = 0, total = 0, active = 0;
    downloads.forEach((d) => {
      loaded += d.loaded;
      total += d.total || d.loaded;
      if (!d.done) active++;
    });
    progressListener({ loaded, total, active, files: downloads.size });
  }

  const realFetch = window.fetch.bind(window);

  // ---- split .swf files ---------------------------------------------------
  // GitHub rejects files over 100 MB, so Game Files/*.swf are committed as
  // swf_parts/<name>.NN chunks listed in swf_parts/manifest.json (build them
  // into real files locally with Game Files/rebuild.bat). Where the whole .swf
  // isn't served - a fresh clone, GitHub Pages - the chunks are fetched in
  // order and joined back together here as the game asks for the file, the
  // same way ddlcplus reassembles game.zip.000...005.
  let manifestPromise = null;
  function swfManifest() {
    if (!manifestPromise) {
      manifestPromise = realFetch(GAME_FILES_DIR + "swf_parts/manifest.json", { cache: "no-cache" })
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null);
    }
    return manifestPromise;
  }

  function swfNameFrom(url) {
    try {
      return decodeURIComponent(new URL(url, document.baseURI).pathname.split("/").pop() || "");
    } catch (e) {
      return decodeURIComponent((url.split("/").pop() || "").split("?")[0]);
    }
  }

  /**
   * Serves url from swf_parts/ chunks when the whole file isn't on the server.
   * @returns {Promise<Response|null>} a 200 Response with the joined bytes, or
   *   null when this url has no parts (the caller keeps the original response).
   */
  async function joinFromParts(url) {
    let manifest = null;
    try { manifest = await swfManifest(); } catch (e) { return null; }
    if (!manifest || !Array.isArray(manifest.files)) return null;
    const name = swfNameFrom(url);
    const info = manifest.files.find((f) => f && f.name && f.name.toLowerCase() === name.toLowerCase());
    if (!info || !Array.isArray(info.parts) || !info.parts.length || !info.size) return null;

    // Count the reassembly into the same progress table Ruffle's own fetches
    // use, so the page's bar moves while the chunks download.
    const entry = { loaded: 0, total: info.size, done: false };
    downloads.set(url, entry);
    reportProgress();
    let bytes = null;
    let offset = 0;
    try {
      bytes = new Uint8Array(info.size);
      for (const part of info.parts) {
        const partUrl = new URL(GAME_FILES_DIR + "swf_parts/" + part.file, document.baseURI).href;
        const res = await realFetch(partUrl, { cache: "no-cache" });
        if (!res.ok) throw new Error("part " + part.file + " returned HTTP " + res.status);
        const buf = new Uint8Array(await res.arrayBuffer());
        if (buf.byteLength !== part.size) {
          throw new Error("part " + part.file + " is " + buf.byteLength + " bytes instead of " + part.size);
        }
        if (offset + buf.byteLength > info.size) {
          throw new Error("the parts of " + name + " add up to more than " + info.size + " bytes");
        }
        bytes.set(buf, offset);
        offset += buf.byteLength;
        entry.loaded = offset;
        reportProgress();
      }
      if (offset !== info.size) {
        throw new Error(name + " came to " + offset + " bytes instead of " + info.size);
      }
    } catch (err) {
      downloads.delete(url);
      reportProgress();
      throw new Error("Could not reassemble " + name + " from swf_parts/ (" + err.message + ")");
    }
    entry.loaded = info.size;
    entry.done = true;
    reportProgress();
    if (window.AIR && AIR.log) AIR.log("Reassembled " + name + " from " + info.parts.length + " part(s).");
    const response = new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/x-shockwave-flash",
        "Content-Length": String(info.size),
      },
    });
    // A constructed Response has url "" - Ruffle reads it to parse the loader's
    // query parameters and to resolve the movie's own URL (chapters load
    // relative to it), so stamp it with the URL that was actually requested.
    try {
      Object.defineProperty(response, "url", { value: new URL(url, document.baseURI).href });
    } catch (e) { /* unreadable url: Ruffle falls back to its config */ }
    return response;
  }

  window.fetch = async function (input, init) {
    const url = typeof input === "string" ? input : (input && input.url) || "";
    const isSwf = /\.swf(\?|#|$)/i.test(url);
    const method = String((init && init.method) || (input && input.method) || "GET").toUpperCase();
    let response = await realFetch(input, init);
    // A HEAD probe for a split file must stay a 404 (falling back to the
    // manifest is script.js's job) - only real GETs trigger the join.
    if (isSwf && !response.ok && method === "GET") {
      const joined = await joinFromParts(url);
      if (joined) return joined;
    }
    if (!isSwf || !response.body || !response.ok) return response;

    const entry = { loaded: 0, total: Number(response.headers.get("content-length")) || 0, done: false };
    downloads.set(url, entry);
    reportProgress();
    const counter = new TransformStream({
      transform(chunk, controller) {
        entry.loaded += chunk.byteLength;
        reportProgress();
        controller.enqueue(chunk);
      },
      flush() {
        entry.done = true;
        reportProgress();
      },
    });
    return new Response(response.body.pipeThrough(counter), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  };

  // ---- audio unlock -----------------------------------------------------------
  // Browsers keep audio suspended until the first click, and this game's intro is
  // synced to streamed audio, so it waits on a black frame until then. Keep hold
  // of the AudioContext(s) Ruffle creates so the page can resume them from its
  // own "click to start" prompt without passing that click to the game.
  const audioContexts = [];
  const NativeAudioContext = window.AudioContext || window.webkitAudioContext;
  if (NativeAudioContext) {
    const Tracked = class extends NativeAudioContext {
      constructor(...args) {
        super(...args);
        audioContexts.push(this);
      }
    };
    window.AudioContext = Tracked;
    if (window.webkitAudioContext) window.webkitAudioContext = Tracked;
  }

  function audioBlocked() {
    return audioContexts.some((c) => c.state === "suspended");
  }

  function resumeAudio() {
    return Promise.all(audioContexts.map((c) => (c.state === "suspended" ? c.resume() : null)));
  }

  function onAudioUnblocked(callback) {
    for (const c of audioContexts) {
      c.addEventListener("statechange", () => { if (!audioBlocked()) callback(); });
    }
  }

  // ---- Ruffle ---------------------------------------------------------------
  let readyPromise = null;

  function ensureRuffle() {
    if (readyPromise) return readyPromise;
    window.RufflePlayer = window.RufflePlayer || {};
    window.RufflePlayer.config = Object.assign(
      { polyfills: false, fontSources: FONT_SOURCES, defaultFonts: { sans: ["Liberation Sans"], serif: ["Liberation Serif"] } },
      window.RufflePlayer.config || {}
    );
    readyPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = RUFFLE_SOURCE;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load " + RUFFLE_SOURCE));
      document.head.appendChild(s);
    }).then(() => {
      if (!window.RufflePlayer || typeof window.RufflePlayer.newest !== "function") {
        throw new Error("Ruffle loaded but window.RufflePlayer.newest() is missing.");
      }
      return window.RufflePlayer.newest();
    });
    readyPromise.catch(() => { readyPromise = null; });
    return readyPromise;
  }

  /**
   * Loads a .swf into mountEl.
   * @param {HTMLElement} mountEl
   * @param {string} swfUrl
   * @param {object} [opts] - { base, renderer, logLevel, onProgress, onTrace }
   * @returns {Promise<HTMLElement>} the Ruffle player element
   */
  async function loadSwf(mountEl, swfUrl, opts) {
    opts = opts || {};
    progressListener = opts.onProgress || null;
    downloads.clear();
    const ruffle = await ensureRuffle();
    unload(mountEl);

    const player = ruffle.createPlayer();
    player.style.width = "100%";
    player.style.height = "100%";
    mountEl.appendChild(player);

    const config = {
      // Absolute URLs: Ruffle derives the movie's security sandbox from them.
      url: new URL(swfUrl, document.baseURI).href,
      base: opts.base ? new URL(opts.base, document.baseURI).href : undefined,
      // AIR mode exposes flash.desktop / flash.filesystem (patched, see README).
      playerRuntime: "air",
      // The AIR file classes reach the page via ExternalInterface (air-fs.js).
      allowScriptAccess: true,
      // The page's "Play" button already provided the user gesture audio needs.
      autoplay: "on",
      unmuteOverlay: "hidden",
      splashScreen: false,
      letterbox: "on",
      backgroundColor: "#000000",
      allowFullscreen: true,
      // The game uses right-click itself (right-click a character to unlock their
      // bio), so Ruffle's own context menu must not pop up over it.
      contextMenu: "off",
      preferredRenderer: opts.renderer || null,
      logLevel: opts.logLevel || "error",
      // Don't let Ruffle's own "this is taking a while" / version prompts appear.
      warnOnUnsupportedContent: false,
      showSwfDownload: false,
    };
    await player.ruffle().load(config);
    // The game's trace() output, e.g. to tell which screen is showing.
    if (opts.onTrace) player.ruffle().traceObserver = opts.onTrace;
    return player;
  }

  function unload(mountEl) {
    mountEl.querySelectorAll("ruffle-player, ruffle-object, ruffle-embed").forEach((p) => {
      try { p.ruffle && p.ruffle().destroy ? p.ruffle().destroy() : p.remove(); } catch (e) { /* already gone */ }
    });
    mountEl.innerHTML = "";
  }

  window.AIRRuntime.ensureRuffle = ensureRuffle;
  window.AIRRuntime.swfManifest = swfManifest;
  window.AIRRuntime.loadSwf = loadSwf;
  window.AIRRuntime.unload = unload;
  window.AIRRuntime.audioBlocked = audioBlocked;
  window.AIRRuntime.resumeAudio = resumeAudio;
  window.AIRRuntime.onAudioUnblocked = onAudioUnblocked;
})();
