#!/usr/bin/env node
/**
 * Soru Üretici — Claude API ile otomatik Türkçe soru üretimi
 *
 * KURULUM (tek seferlik):
 *   cd "Mini Challenge Arena/mobile"
 *   npm install @anthropic-ai/sdk
 *
 * API KEY AYARLA:
 *   Mac/Linux : export ANTHROPIC_API_KEY="sk-ant-..."
 *   Windows   : $env:ANTHROPIC_API_KEY="sk-ant-..."
 *   key al    : https://console.anthropic.com → API Keys
 *
 * KULLANIM:
 *   node scripts/generate-questions.js --category tarih --count 50
 *   node scripts/generate-questions.js --category genel --count 80
 *
 * KATEGORİLER:
 *   history, geography, science, general, art, cinema, sports, turkey,
 *   kids, license, medical, economy, arabic, french, german, spanish
 */

'use strict';

const path = require('path');
const fs   = require('fs');

// SDK kontrolü
let Anthropic;
try {
  Anthropic = require('@anthropic-ai/sdk');
} catch {
  console.error('\n❌ @anthropic-ai/sdk kurulu değil.');
  console.error('   Şunu çalıştır: npm install @anthropic-ai/sdk\n');
  process.exit(1);
}

// ── Sabitler ──────────────────────────────────────────────────────────────────
const VALID_CATEGORIES = [
  'history','geography','science','general','art','cinema','sports','turkey',
  'kids','license','medical','economy','arabic','french','german','spanish',
];

const CATEGORY_PROMPTS = {
  history  : 'Osmanlı tarihi, Türkiye Cumhuriyeti tarihi, dünya tarihi, savaşlar, medeniyetler ve tarihi kişiler',
  geography: 'Ülkeler, başkentler, dağlar, nehirler, kıtalar ve Türkiye coğrafyası',
  science  : 'Fizik, kimya, biyoloji, astronomi, insan vücudu ve bilimsel keşifler',
  general  : 'Mitoloji, ünlü kişiler, icatlar, rekorlar, hayvanlar, coğrafya ve karışık konular',
  art      : 'Resim, heykel, mimari, müzik, edebiyat, tiyatro ve Türk-dünya sanatı',
  cinema   : 'Filmler, yönetmenler, oyuncular, Oscar ödülleri, Türk sineması ve diziler',
  sports   : 'Futbol, basketbol, tenis, olimpiyatlar, Türk sporcular ve dünya rekorları',
  turkey   : 'Türk şehirleri, yemekleri, gelenekleri, tarihi, ekonomisi ve ünlü Türkler',
  kids     : 'Çocuklar için basit sorular: hayvanlar, renkler, sayılar, mevsimler, şehirler (8-14 yaş)',
  license  : 'Trafik kuralları, yol işaretleri, hız sınırları, Karayolları Trafik Kanunu ve ehliyet bilgileri',
  medical  : 'İnsan vücudu, hastalıklar, vitaminler, ilaçlar, ilk yardım ve tıbbi terimler',
  economy  : 'Ekonomi kavramları, finans, borsa, Türkiye ekonomisi ve ünlü ekonomistler',
  arabic   : 'Temel Arapça kelimeler, sayılar, selamlama ve günlük ifadeler (Türkçe açıklamalı)',
  french   : 'Temel Fransızca kelimeler, sayılar, selamlama ve günlük ifadeler (Türkçe açıklamalı)',
  german   : 'Temel Almanca kelimeler, sayılar, selamlama ve günlük ifadeler (Türkçe açıklamalı)',
  spanish  : 'Temel İspanyolca kelimeler, sayılar, selamlama ve günlük ifadeler (Türkçe açıklamalı)',
};

// ── CLI argümanları ───────────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  let category = null, count = 50;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--category' && args[i+1]) category = args[++i];
    if (args[i] === '--count'    && args[i+1]) count    = parseInt(args[++i], 10);
  }
  return { category, count };
}

// ── Mevcut soruları oku ────────────────────────────────────────────────────────
function readExistingFile(category) {
  const filePath = path.join(__dirname, '..', 'src', 'data', 'questions', `${category}.ts`);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Dosya bulunamadı: ${filePath}`);
    process.exit(1);
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = content.match(/\{ q:/g);
  const count   = matches ? matches.length : 0;

  const existingTexts = new Set();
  for (const m of content.matchAll(/\{ q: '([^']+)'/g)) {
    existingTexts.add(m[1].toLowerCase().trim());
  }
  return { filePath, content, count, existingTexts };
}

// ── Claude API çağrısı ────────────────────────────────────────────────────────
async function callClaude(client, category, batchCount, existingTexts) {
  const topic  = CATEGORY_PROMPTS[category] || category;
  const isLang = ['arabic','french','german','spanish'].includes(category);

  const userPrompt =
`${topic} konularında TAM OLARAK ${batchCount} adet Türkçe soru üret.
${isLang ? 'Dil soruları: soru ve cevaplar Türkçe olmalı, yabancı kelimeyi ve Türkçe karşılığını içermeli.' : ''}

Sadece geçerli JSON dizisi olarak yanıt ver (başka hiçbir şey ekleme):
[
  { "q": "Soru?", "a": ["A", "B", "C", "D"], "c": 0, "e": "Açıklama.", "d": 1 },
  ...
]

Kurallar:
- "q": Türkçe soru metni (? ile bitmeli)
- "a": tam 4 şık (makul alternatifler, çok bariz yanlış olmamalı)
- "c": doğru cevabın indeksi (0-3)
- "e": 1-2 cümle Türkçe açıklama
- "d": 1=kolay (~%30), 2=orta (~%45), 3=zor (~%25)
- Sadece JSON dizi ver, markdown veya açıklama ekleme
- TAM OLARAK ${batchCount} soru üret`;

  const response = await client.messages.create({
    model     : 'claude-sonnet-4-6',
    max_tokens: 8000,
    system    : 'Türkçe bilgi yarışması soruları üreten bir asistansın. Sadece geçerli JSON formatında yanıt ver.',
    messages  : [{ role: 'user', content: userPrompt }],
  });

  const raw = response.content[0]?.text?.trim() || '';
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) throw new Error(`JSON bulunamadı. Ham yanıt: ${raw.slice(0, 150)}`);

  let parsed;
  try { parsed = JSON.parse(match[0]); }
  catch (e) { throw new Error(`JSON parse hatası: ${e.message}`); }

  if (!Array.isArray(parsed)) throw new Error('Yanıt dizi değil');

  const valid = [], skipped = [];
  for (const q of parsed) {
    if (!q.q || !Array.isArray(q.a) || q.a.length !== 4 ||
        q.c == null || !q.e || q.c < 0 || q.c > 3) {
      skipped.push('format hatası');
      continue;
    }
    const key = q.q.toLowerCase().trim();
    if (existingTexts.has(key)) { skipped.push('tekrar'); continue; }
    existingTexts.add(key);
    valid.push({ q: q.q, a: q.a, c: q.c, e: q.e, d: q.d || 2 });
  }

  return { valid, skipped, usage: response.usage };
}

// ── Dosyaya ekle ──────────────────────────────────────────────────────────────
function appendQuestions(filePath, content, questions) {
  const closingIdx = content.lastIndexOf('\n];');
  if (closingIdx === -1) throw new Error('Dosyada kapanış `];` bulunamadı');

  const lines = questions.map(q => {
    const esc  = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const aStr = q.a.map(s => `'${esc(s)}'`).join(', ');
    return `  { q: '${esc(q.q)}', a: [${aStr}], c: ${q.c}, e: '${esc(q.e)}', d: ${q.d} },`;
  }).join('\n');

  const newContent =
    content.slice(0, closingIdx) +
    '\n\n  // ── Otomatik üretildi ──────────────────────────────\n' +
    lines + '\n' +
    content.slice(closingIdx);

  fs.writeFileSync(filePath, newContent, 'utf8');
}

// ── Asenkron bekleme ──────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Ana fonksiyon ─────────────────────────────────────────────────────────────
async function main() {
  const { category, count } = parseArgs();

  if (!category || !VALID_CATEGORIES.includes(category)) {
    console.error(`\n❌ Geçersiz kategori: "${category}"`);
    console.error(`Geçerli kategoriler:\n  ${VALID_CATEGORIES.join(', ')}\n`);
    process.exit(1);
  }
  if (isNaN(count) || count < 1 || count > 5000) {
    console.error('❌ --count 1-5000 arasında olmalı');
    process.exit(1);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('\n❌ ANTHROPIC_API_KEY ortam değişkeni bulunamadı');
    console.error('   Mac/Linux : export ANTHROPIC_API_KEY="sk-ant-..."');
    console.error('   Windows   : $env:ANTHROPIC_API_KEY="sk-ant-..."\n');
    process.exit(1);
  }

  console.log('\n🚀 Soru Üretici Başladı');
  console.log(`   Kategori : ${category}`);
  console.log(`   İstenen  : ${count} yeni soru`);

  const { filePath, content, count: existing, existingTexts } = readExistingFile(category);
  console.log(`   Mevcut   : ${existing} soru`);
  console.log(`   Hedef    : ${existing + count} soru\n`);

  const client     = new Anthropic({ apiKey });
  const allValid   = [];
  let totalSkipped = 0;
  let remaining    = count;
  let batchNum     = 0;

  while (remaining > 0) {
    batchNum++;
    const batchCount = Math.min(remaining, 50);
    console.log(`📝 Batch ${batchNum}: ${batchCount} soru isteniyor...`);

    let result = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        result = await callClaude(client, category, batchCount, existingTexts);
        break;
      } catch (err) {
        console.warn(`  ⚠️  Deneme ${attempt}/3: ${err.message.slice(0, 80)}`);
        if (attempt < 3) { await sleep(8000 * attempt); }
        else { console.error('  ❌ 3 denemeden sonra bu batch atlandı'); }
      }
    }

    if (!result) break;

    console.log(`  ✅ ${result.valid.length} geçerli / ${result.skipped.length} atlandı`);
    console.log(`  💰 ${result.usage.input_tokens} giriş + ${result.usage.output_tokens} çıkış token\n`);

    allValid.push(...result.valid);
    totalSkipped += result.skipped.length;
    remaining    -= result.valid.length;

    if (remaining > 0) await sleep(3000); // rate limit bekleme
  }

  if (allValid.length === 0) {
    console.error('❌ Hiç geçerli soru üretilemedi');
    process.exit(1);
  }

  const toWrite = allValid.slice(0, count);
  console.log(`💾 ${toWrite.length} soru dosyaya ekleniyor...`);
  appendQuestions(filePath, content, toWrite);

  console.log('\n✨ Tamamlandı!');
  console.log(`   Eklenen     : ${toWrite.length} soru`);
  console.log(`   Atlanan     : ${totalSkipped} soru`);
  console.log(`   Yeni toplam : ${existing + toWrite.length} soru`);
  console.log(`   Dosya       : ${path.relative(process.cwd(), filePath)}\n`);
}

main().catch(err => {
  console.error('❌ Beklenmeyen hata:', err.message);
  process.exit(1);
});
