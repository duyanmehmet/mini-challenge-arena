/**
 * Lottie Animasyon Üretici — Bil Bakalım
 * Çalıştır: node scripts/generate-animations.js
 * Gereksinim: Node.js (harici paket gerekmez)
 */

const fs = require('fs');
const path = require('path');

// ── Konfeti Animasyonu ────────────────────────────────────────────────
function buildConfetti() {
  const colors = ['#e94560','#f0c040','#2ecc71','#3498db','#9b59b6','#1abc9c','#e67e22'];
  const layers = [];

  for (let i = 0; i < 30; i++) {
    const color = colors[i % colors.length];
    const hex = color.replace('#', '');
    const r = parseInt(hex.slice(0,2),16)/255;
    const g = parseInt(hex.slice(2,4),16)/255;
    const b = parseInt(hex.slice(4,6),16)/255;

    const startX = Math.random() * 400;
    const startY = -20 - Math.random() * 100;
    const endY   = 450 + Math.random() * 100;
    const endX   = startX + (Math.random() - 0.5) * 120;
    const delay  = Math.floor(Math.random() * 40);
    const size   = 8 + Math.random() * 12;
    const rot    = Math.random() * 720 - 360;

    layers.push({
      ddd: 0, ind: i + 1, ty: 4, nm: `confetti_${i}`,
      sr: 1, ks: {
        o: { a: 0, k: 100 },
        r: { a: 1, k: [
          { t: delay, s: [0], e: [rot], i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] } },
          { t: 90, s: [rot] }
        ]},
        p: { a: 1, k: [
          { t: delay, s: [startX, startY, 0], e: [endX, endY, 0], i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 } },
          { t: 90, s: [endX, endY, 0] }
        ]},
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0, shapes: [{
        ty: 'gr', it: [
          { ty: 'rc', d: 1, s: { a: 0, k: [size, size * 0.6] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 1 } },
          { ty: 'fl', c: { a: 0, k: [r, g, b, 1] }, o: { a: 0, k: 100 }, r: 1 },
          { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
        ]
      }],
      ip: delay, op: 90, st: delay
    });
  }

  return { v: '5.9.0', fr: 30, ip: 0, op: 90, w: 400, h: 400, nm: 'confetti', ddd: 0, assets: [], layers };
}

// ── Level Up Animasyonu ──────────────────────────────────────────────
function buildLevelUp() {
  const layers = [];

  // Yıldız patlaması — 8 ışın
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const endX = 200 + Math.cos(angle) * 150;
    const endY = 200 + Math.sin(angle) * 150;

    layers.push({
      ddd: 0, ind: i + 1, ty: 4, nm: `ray_${i}`,
      sr: 1, ks: {
        o: { a: 1, k: [{ t: 0, s: [100], e: [0], i: { x: [1], y: [1] }, o: { x: [0], y: [0] } }, { t: 60, s: [0] }] },
        r: { a: 0, k: 0 },
        p: { a: 1, k: [
          { t: 0, s: [200, 200, 0], e: [endX, endY, 0], i: { x: 0.3, y: 1 }, o: { x: 0.7, y: 0 } },
          { t: 60, s: [endX, endY, 0] }
        ]},
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [
          { t: 0, s: [0, 0, 100], e: [100, 100, 100], i: { x: 0.3, y: 1 }, o: { x: 0.7, y: 0 } },
          { t: 30, s: [100, 100, 100] }
        ]}
      },
      ao: 0, shapes: [{
        ty: 'gr', it: [
          { ty: 'sr', sy: 1, d: 1, pt: { a: 0, k: 5 }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 0 }, ir: { a: 0, k: 10 }, is: { a: 0, k: 0 }, os: { a: 0, k: 0 }, or: { a: 0, k: 20 } },
          { ty: 'fl', c: { a: 0, k: [0.94, 0.75, 0.25, 1] }, o: { a: 0, k: 100 }, r: 1 },
          { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
        ]
      }],
      ip: 0, op: 60, st: 0
    });
  }

  // Merkez yıldız
  layers.push({
    ddd: 0, ind: 9, ty: 4, nm: 'center_star',
    sr: 1, ks: {
      o: { a: 0, k: 100 },
      r: { a: 1, k: [{ t: 0, s: [0], e: [360], i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] } }, { t: 60, s: [360] }] },
      p: { a: 0, k: [200, 200, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: { a: 1, k: [
        { t: 0, s: [0, 0, 100], e: [200, 200, 100], i: { x: 0.2, y: 1 }, o: { x: 0.8, y: 0 } },
        { t: 20, s: [200, 200, 100], e: [150, 150, 100], i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 } },
        { t: 60, s: [150, 150, 100] }
      ]}
    },
    ao: 0, shapes: [{
      ty: 'gr', it: [
        { ty: 'sr', sy: 1, d: 1, pt: { a: 0, k: 5 }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 0 }, ir: { a: 0, k: 20 }, is: { a: 0, k: 0 }, os: { a: 0, k: 0 }, or: { a: 0, k: 40 } },
        { ty: 'fl', c: { a: 0, k: [0.94, 0.75, 0.25, 1] }, o: { a: 0, k: 100 }, r: 1 },
        { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
      ]
    }],
    ip: 0, op: 60, st: 0
  });

  return { v: '5.9.0', fr: 30, ip: 0, op: 60, w: 400, h: 400, nm: 'levelup', ddd: 0, assets: [], layers };
}

// ── Geri Sayım Animasyonu ─────────────────────────────────────────────
function buildCountdown() {
  // Basit bir nabız/pulse animasyonu
  return {
    v: '5.9.0', fr: 30, ip: 0, op: 30, w: 200, h: 200, nm: 'countdown', ddd: 0, assets: [],
    layers: [{
      ddd: 0, ind: 1, ty: 4, nm: 'pulse',
      sr: 1, ks: {
        o: { a: 1, k: [
          { t: 0, s: [100], e: [30], i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] } },
          { t: 30, s: [30] }
        ]},
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [
          { t: 0, s: [100, 100, 100], e: [160, 160, 100], i: { x: 0.5, y: 1 }, o: { x: 0.5, y: 0 } },
          { t: 30, s: [160, 160, 100] }
        ]}
      },
      ao: 0, shapes: [{
        ty: 'gr', it: [
          { ty: 'el', d: 1, s: { a: 0, k: [80, 80] }, p: { a: 0, k: [0, 0] } },
          { ty: 'fl', c: { a: 0, k: [0.91, 0.27, 0.38, 1] }, o: { a: 0, k: 100 }, r: 1 },
          { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
        ]
      }],
      ip: 0, op: 30, st: 0
    }]
  };
}

// ── Dosyaları yaz ──────────────────────────────────────────────────────
const outDir = path.join(__dirname, '..', 'assets', 'animations');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const animations = {
  'confetti.json':  buildConfetti(),
  'level-up.json':  buildLevelUp(),
  'countdown.json': buildCountdown(),
};

for (const [filename, data] of Object.entries(animations)) {
  const filePath = path.join(outDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  const layers = data.layers.length;
  console.log(`✅ ${filename} — ${layers} layer, ${(fs.statSync(filePath).size / 1024).toFixed(1)} KB`);
}

console.log('\n🎉 Tüm Lottie animasyonları oluşturuldu!');
