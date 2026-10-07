// Memory-profile detection shared between main.js (browser) and build
// tooling / tests (Node via module.exports). Kept dependency-free so any
// runtime can load it. STRINGS IN THIS FILE MUST NOT CONTAIN BACKTICKS.
const osuParams = new URLSearchParams(
  globalThis.location && globalThis.location.search ? globalThis.location.search : "",
);
const osuDeviceMem = navigator.deviceMemory || 8;
// "highram" forces the full profile; otherwise <=4 GB devices get low and
// <=2 GB get very-low. "?lowram"/"?verylowram" force it regardless.
// Chromebooks commonly report deviceMemory 8 regardless of physical RAM, so
// use ?lowram in the URL there; the profile below is safe on 4 GB devices.
// "?perf" selects the FPS-oriented profile: jiterpreter on, 1x render
// scale, deeper warm thread pool — max smoothness for capable machines.
const osuNoLowram = osuParams.has("highram") || osuParams.has("perf");
const perf = osuParams.has("perf") && !osuParams.has("lowram") && !osuParams.has("verylowram");
const low = osuParams.has("lowram") || (!osuNoLowram && osuDeviceMem <= 4);
const veryLow = osuParams.has("verylowram") || (low && osuDeviceMem <= 2);

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
