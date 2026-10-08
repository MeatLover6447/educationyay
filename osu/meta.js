// Memory-profile detection shared between main.js (browser) and build
// tooling / tests (Node via module.exports). Kept dependency-free so any
// runtime can load it. STRINGS IN THIS FILE MUST NOT CONTAIN BACKTICKS.
const osuParams = new URLSearchParams(
  globalThis.location && globalThis.location.search ? globalThis.location.search : "",
);
const osuDeviceMem = navigator.deviceMemory || 8;
const osuHardwareConcurrency = navigator.hardwareConcurrency || 4;
const osuChromeOS =
  /\bCrOS\b/i.test(navigator.userAgent || "") || navigator.userAgentData?.platform === "Chrome OS";
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
// Chromebooks commonly report deviceMemory 8 regardless of physical RAM;
// identify ChromeOS directly so Auto does not select the high profile there.
const perf = mode === "perf";
const full = mode === "highram";
const low =
  mode === "lowram" || mode === "verylowram" || (!perf && !full && (osuDeviceMem <= 4 || osuChromeOS));
const veryLow = mode === "verylowram" || (low && osuDeviceMem <= 2);

globalThis.osuLowRam = low;
globalThis.osuVeryLowRam = veryLow;
globalThis.osuPerfRam = perf;
globalThis.osuMemProfile = perf ? "performance" : veryLow ? "very-low" : low ? "low" : "high";
globalThis.osuDeviceMemory = osuDeviceMem;
globalThis.osuHardwareConcurrency = osuHardwareConcurrency;
globalThis.osuChromeOS = osuChromeOS;

if (typeof exports === "object" && typeof module !== "undefined") {
  module.exports = {
    osuLowRam: low,
    osuVeryLowRam: veryLow,
    osuMemProfile: globalThis.osuMemProfile,
    osuDeviceMemory: osuDeviceMem,
    osuHardwareConcurrency,
    osuChromeOS,
  };
}
