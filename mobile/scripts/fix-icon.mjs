// adaptive-icon.png'deki fazla padding'i kaldırır, ikonu büyütür
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC  = path.join(__dirname, '../assets/images/adaptive-icon.png');
const DEST = path.join(__dirname, '../assets/images/adaptive-icon-new.png');
const OUT_SIZE = 1024; // Android önerilen boyut

async function main() {
  const img = sharp(SRC);
  const { width, height, channels } = await img.metadata();
  console.log(`Orijinal boyut: ${width}x${height}`);

  // Ham piksel verisini al
  const { data } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = width, H = height;

  // Arka plan rengi: #0d0d1a → R=13, G=13, B=26
  // Eşik: piksel bu renge yakınsa "boşluk" say
  const isBackground = (r, g, b) =>
    r < 40 && g < 40 && b < 60;

  let top = 0, bottom = H - 1, left = 0, right = W - 1;

  // Üstten tara
  outer: for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (!isBackground(data[i], data[i+1], data[i+2])) { top = y; break outer; }
    }
  }
  // Alttan tara
  outer: for (let y = H - 1; y >= 0; y--) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (!isBackground(data[i], data[i+1], data[i+2])) { bottom = y; break outer; }
    }
  }
  // Soldan tara
  outer: for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
      const i = (y * W + x) * 4;
      if (!isBackground(data[i], data[i+1], data[i+2])) { left = x; break outer; }
    }
  }
  // Sağdan tara
  outer: for (let x = W - 1; x >= 0; x--) {
    for (let y = 0; y < H; y++) {
      const i = (y * W + x) * 4;
      if (!isBackground(data[i], data[i+1], data[i+2])) { right = x; break outer; }
    }
  }

  console.log(`İkon alanı: left=${left}, top=${top}, right=${right}, bottom=${bottom}`);

  const cropW = right - left + 1;
  const cropH = bottom - top + 1;
  const size  = Math.max(cropW, cropH);

  // %12 padding ekle (Android safe zone için)
  const padding = Math.round(size * 0.12);
  const paddedSize = size + padding * 2;

  await sharp(SRC)
    .extract({ left, top, width: cropW, height: cropH })
    .resize(size, size, { fit: 'contain', background: { r: 13, g: 13, b: 26, alpha: 1 } })
    .extend({
      top:    padding,
      bottom: padding,
      left:   padding,
      right:  padding,
      background: { r: 13, g: 13, b: 26, alpha: 1 },
    })
    .resize(OUT_SIZE, OUT_SIZE)
    .png()
    .toFile(DEST);

  console.log(`✅ Kaydedildi: ${DEST} (${OUT_SIZE}x${OUT_SIZE})`);
}

main().catch(console.error);
