/**
 * App Icon Generator — Bil Bakalım
 *
 * Gereksinim: npm install canvas
 * Çalıştır: node scripts/generate-icon.js
 *
 * Kırmızı arka plan (#e94560) üzerinde 🏆 emoji ile icon üretir.
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const SIZES = [
  { name: 'icon.png',          size: 1024 },
  { name: 'adaptive-icon.png', size: 1024 },
  { name: 'splash-icon.png',   size: 512  },
  { name: 'favicon.png',       size: 64   },
];

function generate(size, outputPath) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Arka plan
  const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  grad.addColorStop(0, '#e94560');
  grad.addColorStop(1, '#1a1a2e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Emoji
  const fontSize = Math.floor(size * 0.55);
  ctx.font = `${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🏆', size / 2, size / 2);

  // Uygulama adı (büyük ikonlarda)
  if (size >= 512) {
    ctx.font = `bold ${Math.floor(size * 0.08)}px Arial`;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText('Bil Bakalım', size / 2, size * 0.82);
  }

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ ${path.basename(outputPath)} (${size}×${size}) oluşturuldu`);
}

const assetsDir = path.join(__dirname, '..', 'assets', 'images');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

try {
  for (const { name, size } of SIZES) {
    generate(size, path.join(assetsDir, name));
  }
  console.log('\n🎉 Tüm ikonlar oluşturuldu!');
  console.log('Not: Daha profesyonel bir ikon için Figma veya Adobe Illustrator kullanabilirsiniz.');
} catch (err) {
  console.error('Hata:', err.message);
  console.log('\n📌 canvas paketini yüklemeniz gerekiyor:');
  console.log('   cd mobile && npm install canvas');
}
