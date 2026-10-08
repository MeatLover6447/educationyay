// Memory-profile detection shared between main.js (browser) and build
// tooling / tests (Node via module.exports). Kept dependency-free so any
// runtime can load it. STRINGS IN THIS FILE MUST NOT CONTAIN BACKTICKS.
const osuParams = new URLSearchParams(
  globalThis.location && globalThis.location.search ? globalThis.location.search : "",
);
const osuDeviceMem = navigator.deviceMemory || 8;
// The loading-screen selector stores the user's choice in localStorage
// ("osu-mode"); explicit URL params still win so ?perf etc. keep working
// as shareable links.
const storedMode =
  typeof localStorage === "object" && localStorage !== null ? localStorage.getItem("osu-mode") : null;
const urlMode = osuParams.has("perf")
  ? "perf"
  : osuParams.has("verylowram")
    ? "verylowram"
    : osuParams.has("lowram")
      ? "lowram"
      : osuParams.has("highram")
        ? "highram"
        : null;
const mode =
  urlMode ??
  (storedMode === "perf" || storedMode === "lowram" || storedMode === "verylowram" || storedMode === "highram"
    ? storedMode
    : "auto");
// Chromebooks commonly report deviceMemory 8 regardless of physical RAM, so
// the loading-screen selector (or ?lowram) is the way to force the low
// profile there; auto keeps it safe on ≤4 GB devices.
const perf = mode === "perf";
const full = mode === "highram";
const low = mode === "lowram" || (!perf && !full && osuDeviceMem <= 4);
const veryLow = mode === "verylowram" || (low && osuDeviceMem <= 2);

globalThis.osuLowRam = low;
globalThis.osuVeryLowRam = veryLow;
globalThis.osuPerfRam = perf;
globalThis.osuMemProfile = perf ? "performance" : veryLow ? "very-low" : low ? "low" : "high";
globalThis.osuDeviceMemory = osuDeviceMem;

if (typeof exports === "object" && typeof module !== "undefined") {
  module.exports = {
    osuLowRam: low,
    osuVeryLowRam: veryLow,
    osuMemProfile: globalThis.osuMemProfile,
    osuDeviceMemory: osuDeviceMem,
  };
}
