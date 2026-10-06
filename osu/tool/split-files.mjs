#!/usr/bin/env node
// Splits framework files that exceed GitHub's 100 MB upload limit into 95 MB
// parts (X.piASu.part000, X.piASu.part001, ...) and writes a sidecar index
// (X.piASu.index = {"parts":N,"size":bytes,"type":mime}), then DELETEs the
// original sized file. The service worker reassembles X transparently when
// the game fetches it, and also serves X.piASu.index, which the .NET runtime
// can pick up as a fallback manifest when static-files.json is absent.
// Safe to re-run: files already split (an .index sidecar exists) are skipped.
// Usage:  node tool/split-files.mjs [dir]   (default: osu/_framework)
import fs from "node:fs";
import path from "node:path";

const dir = path.resolve(process.argv[2] ?? "osu/_framework");
const PART_BYTES = 95 * 1024 * 1024;

const MIME = {
  ".wasm": "application/wasm",
  ".dat": "application/octet-stream",
  ".js": "text/javascript",
  ".json": "application/json",
};

if (!fs.existsSync(dir)) {
  console.error("directory not found:", dir);
  process.exit(1);
}

const entries = fs.readdirSync(dir, { withFileTypes: true });
const big = [];
for (const e of entries) {
  if (!e.isFile()) continue;
  const full = path.join(dir, e.name);
  const size = fs.statSync(full).size;
  if (size > PART_BYTES) big.push({ name: e.name, full, size });
}

if (!big.length) {
  console.log("No files over", PART_BYTES / 1024 / 1024, "MB in", dir, "— nothing to do.");
  process.exit(0);
}

for (const f of big) {
  const indexName = f.full + ".piASu.index";
  const alreadySplit = fs.existsSync(indexName) && fs.existsSync(f.full + ".piASu.part000");
  if (alreadySplit) {
    console.log("already split, skipping:", f.name);
    continue;
  }
  const ext = path.extname(f.name).toLowerCase();
  const type = MIME[ext] ?? "application/octet-stream";
  const parts = Math.ceil(f.size / PART_BYTES);
  const fd = fs.openSync(f.full, "r");
  try {
    for (let i = 0; i < parts; i++) {
      const out = f.full + ".piASu.part" + String(i).padStart(3, "0");
      const len = Math.min(PART_BYTES, f.size - i * PART_BYTES);
      const buf = Buffer.alloc(len);
      fs.readSync(fd, buf, 0, len, i * PART_BYTES);
      fs.writeFileSync(out, buf);
      console.log(
        "wrote " + path.basename(out) + " (" + (len / 1024 / 1024).toFixed(1) + " MB) [" + (i + 1) + "/" + parts + "]",
      );
    }
  } finally {
    fs.closeSync(fd);
  }
  fs.writeFileSync(indexName, JSON.stringify({ parts, size: f.size, type }));
  console.log("wrote " + path.basename(indexName), JSON.stringify({ parts, size: f.size, type }));
  fs.rmSync(f.full);
  console.log("deleted original " + f.name + " (" + (f.size / 1024 / 1024).toFixed(1) + " MB)");
}
