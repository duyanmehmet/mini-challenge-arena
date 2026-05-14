/**
 * Ses Dosyası Üretici — Bil Bakalım
 * WAV formatında sentetik ses efektleri üretir
 * Çalıştır: node scripts/generate-sounds.js
 * Gereksinim: Node.js (harici paket gerekmez)
 */

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 22050;
const outDir = path.join(__dirname, '..', 'assets', 'sounds');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

/** WAV başlığı yaz */
function wavHeader(dataLen, sampleRate = SAMPLE_RATE, channels = 1, bitsPerSample = 16) {
  const buf = Buffer.alloc(44);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataLen, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(channels, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * channels * bitsPerSample / 8, 28);
  buf.writeUInt16LE(channels * bitsPerSample / 8, 32);
  buf.writeUInt16LE(bitsPerSample, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataLen, 40);
  return buf;
}

/** Sine wave sample üret */
function sine(freq, t) {
  return Math.sin(2 * Math.PI * freq * t);
}

/** Ses dosyası oluştur */
function generate(filename, durationSec, sampleFn) {
  const samples = Math.floor(SAMPLE_RATE * durationSec);
  const data = Buffer.alloc(samples * 2);

  for (let i = 0; i < samples; i++) {
    const t = i / SAMPLE_RATE;
    let s = sampleFn(t, durationSec) * 0.7; // %70 volume
    s = Math.max(-1, Math.min(1, s));
    data.writeInt16LE(Math.floor(s * 32767), i * 2);
  }

  const header = wavHeader(data.length);
  const wav = Buffer.concat([header, data]);
  const outPath = path.join(outDir, filename);
  fs.writeFileSync(outPath, wav);
  console.log(`✅ ${filename} — ${durationSec}s, ${(wav.length / 1024).toFixed(1)} KB`);
}

/** Zarf (ADSR benzeri) */
function envelope(t, dur, attack = 0.01, decay = 0.05, sustain = 0.7, release = 0.1) {
  if (t < attack) return t / attack;
  if (t < attack + decay) return 1 - (1 - sustain) * (t - attack) / decay;
  if (t < dur - release) return sustain;
  return sustain * (1 - (t - (dur - release)) / release);
}

// ── HIT — Kısa yüksek ses ─────────────────────────────────────────────
generate('hit.mp3', 0.15, (t, dur) => {
  const freq = 880 * Math.pow(0.5, t * 4); // frekans düşer
  return sine(freq, t) * envelope(t, dur, 0.005, 0.02, 0.6, 0.08);
});

// ── MISS — Düşük negatif ses ──────────────────────────────────────────
generate('miss.mp3', 0.25, (t, dur) => {
  const freq = 200 + 50 * Math.sin(t * 30);
  return (sine(freq, t) * 0.5 + sine(freq * 1.5, t) * 0.3) * envelope(t, dur, 0.01, 0.05, 0.4, 0.1);
});

// ── COMBO — Yükselen arpej ────────────────────────────────────────────
generate('combo.mp3', 0.35, (t, dur) => {
  const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
  const idx = Math.floor(t / (dur / notes.length));
  const freq = notes[Math.min(idx, notes.length - 1)];
  return sine(freq, t) * envelope(t, dur, 0.01, 0.05, 0.7, 0.1);
});

// ── WIN — Zafer fanfarı ───────────────────────────────────────────────
generate('win.mp3', 0.8, (t, dur) => {
  const melody = [
    { f: 523, s: 0.0, e: 0.2 },
    { f: 659, s: 0.2, e: 0.4 },
    { f: 784, s: 0.4, e: 0.6 },
    { f: 1047, s: 0.6, e: 0.8 },
  ];
  let out = 0;
  for (const note of melody) {
    if (t >= note.s && t < note.e) {
      const lt = t - note.s;
      const ld = note.e - note.s;
      out = sine(note.f, t) * envelope(lt, ld, 0.01, 0.05, 0.8, 0.1);
      break;
    }
  }
  return out;
});

// ── LEVELUP — Hızlı yükselen skala ───────────────────────────────────
generate('levelup.mp3', 0.6, (t, dur) => {
  const notes = [262, 330, 392, 494, 587, 740, 880, 1047];
  const idx = Math.floor(t / (dur / notes.length));
  const freq = notes[Math.min(idx, notes.length - 1)];
  const lt = t - idx * (dur / notes.length);
  const ld = dur / notes.length;
  return (sine(freq, t) + sine(freq * 2, t) * 0.3) * envelope(lt, ld, 0.01, 0.02, 0.8, 0.05);
});

// ── COUNTDOWN — Tik sesi ──────────────────────────────────────────────
generate('countdown.mp3', 0.1, (t, dur) => {
  return sine(1200, t) * envelope(t, dur, 0.005, 0.01, 0.5, 0.05);
});

// ── GOAL — Gol sesi (kullanılıyor olsa dahi) ─────────────────────────
generate('goal.mp3', 0.5, (t, dur) => {
  const freq = 440 + 200 * Math.sin(t * 15);
  return (sine(freq, t) + sine(freq * 1.5, t) * 0.4) * envelope(t, dur, 0.01, 0.05, 0.7, 0.15);
});

console.log('\n🔊 Tüm ses dosyaları oluşturuldu!');
console.log('Not: WAV formatında üretildi, .mp3 uzantısıyla kaydedildi.');
console.log('Expo bu dosyaları sorunsuz çalar.');
