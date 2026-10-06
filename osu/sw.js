importScripts("epoxy.js");
const WISP = "wss://garbsoftball.com/wisp/";
const CACHE = "osu-files";
const FWCACHE = "osu-fw-v1";
let manifest;
const clients = [];
let next = 0;
const getManifest = () =>
  (manifest ??= fetch("static-files.json", { cache: "no-cache" })
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({})));
let ready;
const getClient = () => {
  const i = next++ % 3;
  return (clients[i] ??= (async () => {
    await (ready ??= epoxy.default({ module_or_path: "epoxy.wasm" }));
    const options = new epoxy.EpoxyClientOptions();
    options.user_agent = navigator.userAgent;
    options.redirect_limit = 10;
    return new epoxy.EpoxyClient(WISP, options);
  })().catch((e) => {
    clients[i] = null;
    throw e;
  }));
};
const timeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("no response from " + WISP + " after " + ms / 1e3 + "s")), ms),
    ),
  ]);
const postProgress = (file) => {
  self.clients
    .matchAll({ includeUncontrolled: true, type: "window" })
    .then((list) => {
      for (const c of list) c.postMessage({ type: "osu-fw-progress", file });
    })
    .catch(() => {});
};
const postReassemble = (file, idx, total) => {
  self.clients
    .matchAll({ includeUncontrolled: true, type: "window" })
    .then((list) => {
      for (const c of list) c.postMessage({ type: "osu-fw-reassemble", file, idx, total });
    })
    .catch(() => {});
};
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) =>
  e.waitUntil(
    (async () => {
      await self.clients.claim();
      const files = await getManifest();
      const cache = await caches.open(CACHE);
      for (const req of await cache.keys())
        if (!files[new URL(req.url).pathname.slice(new URL(registration.scope).pathname.length)])
          await cache.delete(req);
    })(),
  ),
);
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (e.request.cache === "only-if-cached" && e.request.mode !== "same-origin") return;
  e.respondWith(
    respond(e.request, url).catch((err) => {
      console.warn("sw: " + url.pathname + ": " + (err?.message ?? err) + "; falling back to network");
      return fetch(e.request);
    }),
  );
});
async function respond(request, url) {
  const scopePath = new URL(registration.scope).pathname;
  const path = url.pathname.slice(scopePath.length);
  if (path.startsWith("proxy/"))
    return isolated(await proxy(request, request.url.slice(request.url.indexOf("/proxy/") + 7)));
  const packed = (await getManifest())[path];
  if (packed && request.method === "GET") return isolated(await cached(url.pathname, packed));
  // Big files of this build are shipped split:
  //   X.piASu000.part000, X.piASu000.part001, ... (95 MB max per part so the
  // repo clears GitHub's 100 MB upload limit), plus X.piASu.index describing
  // {"parts":N,"size":bytes,"type":"mime"}. The .NET runtime fetches X the
  // normal way; this worker joins the parts and serves X transparently.
  // Serving X.piASu.index (77-byte JSON) matters too: when static-files.json
  // is absent the runtime falls back to globbing these index files as its
  // boot manifest. (splitFiles convention: tool/split-files.mjs)
  const partMatch = path.match(/^(.*)\.piASu\.part\d+$/);
  if (request.method === "GET" && partMatch !== null) return isolated(await reassemble(partMatch[1]));
  if (request.method === "GET" && path.endsWith(".piASu.index"))
    return isolated(await cachedIndex(url.pathname));
  if (path.startsWith("_framework/") && !path.endsWith(".js")) {
    if (request.method === "GET" && /\.[a-z0-9]{8,12}\.(wasm|dat)$/i.test(path)) {
      // The file may ship split (see tool/split-files.mjs); reassemble if an
      // index sidecar exists, else serve the plain file.
      if (await hasSplitIndex(url.pathname)) return isolated(await reassemble(url.pathname));
      return isolated(await cachedRaw(url.pathname));
    }
    return isolated(await fetch(request));
  }
  return isolated(
    await fetch(request.mode === "navigate" ? request.url : request, {
      cache: "no-cache",
      credentials: "same-origin",
    }),
  );
}
const splitIndex = new Map();
async function hasSplitIndex(pathname) {
  if (splitIndex.has(pathname)) return true;
  const fw = await caches.open(FWCACHE);
  const hit = await fw.match(pathname + ".piASu.index");
  if (hit) {
    splitIndex.set(pathname, await hit.json());
    return true;
  }
  // Negative results are cached only in memory so a later-added split still
  // gets picked up on the next load.
  const res = await fetch(pathname + ".piASu.index", { cache: "no-cache" });
  if (res.ok) {
    // Buffer once and build independent Responses — res.clone() after the
    // body was read would throw and 404 the whole file on a cold cache.
    const buf = await res.arrayBuffer();
    const index = JSON.parse(new TextDecoder().decode(buf));
    splitIndex.set(pathname, index);
    fw.put(pathname + ".piASu.index", new Response(buf, { status: 200, headers: { "Content-Type": "application/json" } })).catch(() => {});
    return true;
  }
  return false;
}
async function reassemble(pathname) {
  const fw = await caches.open(FWCACHE);
  const hit = await fw.match(pathname);
  if (hit) return hit;
  let index = splitIndex.get(pathname);
  if (!index) {
    const res = await fetch(pathname + ".piASu.index", { cache: "no-cache" });
    if (!res.ok) throw new Error("split index missing for " + pathname + ": HTTP " + res.status);
    index = await res.json();
    splitIndex.set(pathname, index);
  }
  const buffers = new Array(index.parts);
  let size = 0;
  for (let i = 0; i < index.parts; i++) {
    const part = pathname + ".piASu.part" + String(i).padStart(3, "0");
    const res = await fetch(part, { cache: "force-cache" });
    if (!res.ok) throw new Error("split part missing: " + part + " HTTP " + res.status);
    const buf = await res.arrayBuffer();
    size += buf.byteLength;
    buffers[i] = buf;
    postReassemble(pathname.split("/").pop(), i + 1, index.parts);
  }
  if (size !== index.size)
    throw new Error("reassembled " + pathname + " is " + size + " bytes, expected " + index.size);
  const mergedBuf = new Uint8Array(size);
  let offset = 0;
  for (const buf of buffers) {
    mergedBuf.set(new Uint8Array(buf), offset);
    offset += buf.byteLength;
  }
  const headers = new Headers({ "Content-Type": index.type, "Content-Length": String(index.size) });
  headers.set("Cross-Origin-Resource-Policy", "same-origin");
  // Two independent Response objects over the same bytes — cloning a Response
  // whose body may already be read throws under concurrency.
  fw.put(pathname, new Response(mergedBuf, { status: 200, headers })).catch(() => {});
  postProgress(pathname.split("/").pop());
  return new Response(mergedBuf, { status: 200, headers });
}
async function cachedIndex(pathname) {
  const fw = await caches.open(FWCACHE);
  const hit = await fw.match(pathname);
  if (hit) return hit;
  const res = await fetch(pathname, { cache: "no-cache" });
  if (res.ok) {
    try {
      const buf = await res.arrayBuffer();
      const headers = new Headers(res.headers);
      fw.put(pathname, new Response(buf, { headers })).catch(() => {});
      postProgress(pathname.split("/").pop());
      return new Response(buf, { headers });
    } catch (e) {
      return fetch(pathname, { cache: "no-cache" });
    }
  }
  return res;
}
async function proxy(request, target) {
  let host;
  try {
    host = new URL(target).hostname;
  } catch {
    return new Response("bad url", { status: 400 });
  }
  if (host !== "ppy.sh" && !host.endsWith(".ppy.sh")) return new Response("host not allowed", { status: 403 });
  // Spectator/multiplayer realtime is unsupported in this build (the game
  // logs that itself); fail fast instead of stalling the wisp tunnel 30s.
  if (host === "spectator.osu.ppy.sh" || host === "bancho.osu.ppy.sh")
    return new Response("realtime features unavailable in this build", { status: 503 });
  const headers = {};
  request.headers.forEach((v, k) => {
    if (!["host", "origin", "referer"].includes(k)) headers[k] = v;
  });
  const body = ["GET", "HEAD"].includes(request.method)
    ? void 0
    : new Uint8Array(await request.arrayBuffer());
  const deadline = Date.now() + 15000;
  for (;;) {
    try {
      const res = await timeout((await getClient()).fetch(target, { method: request.method, headers, body }), 30000);
      return new Response(res.body, { status: res.status, statusText: res.statusText, headers: res.headers });
    } catch (e) {
      const message = String(e?.message ?? e);
      if (Date.now() > deadline) {
        clients.length = 0;
        console.warn("wisp request to " + target + " failed: " + message);
        return new Response(message, { status: 502 });
      }
      // The wisp relay drops connections sometimes; drop the stale client and
      // retry with a fresh one instead of failing the game's request.
      clients.length = 0;
      console.warn("wisp request to " + target + " failed, retrying: " + message);
      await new Promise((r) => setTimeout(r, 1200));
    }
  }
}
async function cached(pathname, packed) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(pathname);
  if (hit && hit.headers.get("x-osu-hash") === packed.hash) return hit;
  const res = unpack(pathname, packed);
  const [a, b] = res.body.tee();
  const headers = new Headers(res.headers);
  headers.set("x-osu-hash", packed.hash);
  cache.put(pathname, new Response(b, { headers })).catch(() => {});
  return new Response(a, { headers: res.headers });
}
async function cachedRaw(pathname) {
  const fw = await caches.open(FWCACHE);
  const hit = await fw.match(pathname);
  if (hit) return hit;
  const res = await fetch(pathname, { cache: "no-cache" });
  if (res.ok) {
    try {
      const buf = await res.arrayBuffer();
      const headers = new Headers(res.headers);
      fw.put(pathname, new Response(buf, { headers })).catch(() => {});
      postProgress(pathname.split("/").pop());
      return new Response(buf, { headers });
    } catch (e) {
      console.warn("sw: could not cache " + pathname + ": " + (e?.message ?? e));
      return fetch(pathname, { cache: "no-cache" });
    }
  }
  return res;
}
function isolated(response) {
  if (response.status === 0 || response.type === "opaqueredirect") return response;
  const headers = new Headers(response.headers);
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Cross-Origin-Embedder-Policy", "require-corp");
  headers.set("Cross-Origin-Resource-Policy", "same-origin");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
function unpack(pathname, { parts, type, size }) {
  let part = 0;
  let reader;
  const gzipped = new ReadableStream({
    async pull(controller) {
      for (;;) {
        if (!reader) {
          if (part === parts) {
            controller.close();
            return;
          }
          const res = await fetch(pathname + ".part" + part++);
          if (!res.ok) throw new Error(pathname + ": part " + (part - 1) + " returned " + res.status);
          reader = res.body.getReader();
        }
        const { done, value } = await reader.read();
        if (done) {
          reader = null;
          continue;
        }
        controller.enqueue(value);
        return;
      }
    },
  });
  return new Response(gzipped.pipeThrough(new DecompressionStream("gzip")), {
    headers: { "Content-Type": type, "Content-Length": String(size) },
  });
}
