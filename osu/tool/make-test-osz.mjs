// Builds a tiny valid .osz (stored zip: one .osu + a short wav) for testing
// the browser import pipeline. Usage: node tool/make-test-osz.mjs [outPath]
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const out = process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), "..", "test.osz");

const crcTable = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
const crc32 = (buf) => {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};

const osu = `osu file format v14

[General]
AudioFilename: audio.wav
AudioLeadIn: 0
PreviewTime: 500
Countdown: 0
SampleSet: Normal
StackLeniency: 0.7
Mode: 0
LetterboxInBreaks: 0

[Editor]
DistanceSpacing: 1
BeatDivisor: 4
GridSize: 4

[Metadata]
Title: Buffy Test
TitleUnicode: Buffy Test
Artist: Buffy
ArtistUnicode: Buffy
Creator: Buffy
Version: Normal
Source:
Tags:
BeatmapID: 0
BeatmapSetID: -1

[Difficulty]
HPDrainRate:5
CircleSize:5
OverallDifficulty:5
ApproachRate:5
SliderMultiplier:1.4
SliderTickRate:1

[Events]
//Background and Video events
//Break Periods
//Storyboard Layer 0 (Background)
//Storyboard Layer 1 (Fail)
//Storyboard Layer 2 (Pass)
//Storyboard Layer 3 (Foreground)
//Storyboard Sound Samples

[TimingPoints]
0,500,4,2,0,60,1,0

[HitObjects]
256,192,500,1,0,0:0:0:0:
256,192,1500,1,0,0:0:0:0:
256,192,2500,1,0,0:0:0:0:
`;
// 0.5 s of 44100 Hz mono 16-bit quiet sine so the browser can decode it.
const rate = 44100;
const seconds = 0.5;
const samples = Math.floor(rate * seconds);
const pcm = new Int16Array(samples);
for (let i = 0; i < samples; i++) pcm[i] = Math.round(Math.sin((i / rate) * 440 * 2 * Math.PI) * 2000);
const pcmBytes = new Uint8Array(pcm.buffer);
const wav = new Uint8Array(44 + pcmBytes.length);
const dv = new DataView(wav.buffer);
const ascii = (off, s) => {
  for (let i = 0; i < s.length; i++) wav[off + i] = s.charCodeAt(i);
};
ascii(0, "RIFF");
dv.setUint32(4, 36 + pcmBytes.length, true);
ascii(8, "WAVE");
ascii(12, "fmt ");
dv.setUint32(16, 16, true);
dv.setUint16(20, 1, true);
dv.setUint16(22, 1, true);
dv.setUint32(24, rate, true);
dv.setUint32(28, rate * 2, true);
dv.setUint16(32, 2, true);
dv.setUint16(34, 16, true);
ascii(36, "data");
dv.setUint32(40, pcmBytes.length, true);
wav.set(pcmBytes, 44);

const entries = [
  ["buffy-test.osu", Buffer.from(osu, "utf8")],
  ["audio.wav", Buffer.from(wav)],
];

const chunks = [];
const central = [];
let offset = 0;
for (const [name, data] of entries) {
  const nameBytes = Buffer.from(name, "utf8");
  const crc = crc32(data);
  const local = Buffer.alloc(30 + nameBytes.length);
  local.write("PK\x03\x04", 0, "binary");
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0, 6);
  local.writeUInt16LE(0, 8);
  local.writeUInt16LE(0, 10);
  local.writeUInt16LE(0, 12);
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(data.length, 18);
  local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(nameBytes.length, 26);
  local.writeUInt16LE(0, 28);
  nameBytes.copy(local, 30);
  chunks.push(local, data);
  const cd = Buffer.alloc(46 + nameBytes.length);
  cd.write("PK\x01\x02", 0, "binary");
  cd.writeUInt16LE(20, 4);
  cd.writeUInt16LE(20, 6);
  cd.writeUInt16LE(0, 8);
  cd.writeUInt16LE(0, 10);
  cd.writeUInt16LE(0, 12);
  cd.writeUInt16LE(0, 14);
  cd.writeUInt32LE(crc, 16);
  cd.writeUInt32LE(data.length, 20);
  cd.writeUInt32LE(data.length, 24);
  cd.writeUInt16LE(nameBytes.length, 28);
  cd.writeUInt16LE(0, 30);
  cd.writeUInt16LE(0, 32);
  cd.writeUInt16LE(0, 34);
  cd.writeUInt16LE(0, 36);
  cd.writeUInt32LE(0, 38);
  cd.writeUInt32LE(offset, 42);
  nameBytes.copy(cd, 46);
  central.push(cd);
  offset += local.length + data.length;
}
const centralBuf = Buffer.concat(central);
const eocd = Buffer.alloc(22);
eocd.write("PK\x05\x06", 0, "binary");
eocd.writeUInt16LE(0, 4);
eocd.writeUInt16LE(0, 6);
eocd.writeUInt16LE(entries.length, 8);
eocd.writeUInt16LE(entries.length, 10);
eocd.writeUInt32LE(centralBuf.length, 12);
eocd.writeUInt32LE(offset, 16);
eocd.writeUInt16LE(0, 20);

writeFileSync(out, Buffer.concat([...chunks, centralBuf, eocd]));
console.log("wrote " + out + " (" + (offset + centralBuf.length + 22) + " bytes)");
