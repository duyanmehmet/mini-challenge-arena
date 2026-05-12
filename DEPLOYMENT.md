# Deploy Rehberi — Mini Challenge Arena Backend

## Railway (Önerilen — Ücretsiz)

1. railway.app'e git, GitHub ile giriş yap
2. "New Project" → "Deploy from GitHub repo"
3. `mini-challenge-arena/backend` klasörünü seç
4. Environment variables ekle:
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://...  (Railway PostgreSQL eklentisi)
   JWT_SECRET=en_az_32_karakter_guvenli_anahtar
   JWT_EXPIRES_IN=30d
   PORT=3000
   ```
5. Deploy — URL otomatik verilir

## Render (Alternatif — Ücretsiz)

1. render.com → New Web Service
2. GitHub repo bağla
3. Root Directory: `backend`
4. Build Command: `npm install && npm run build`
5. Start Command: `npm run start`

## PostgreSQL Migrate

Railway/Render'a deploy ettikten sonra:
```bash
DATABASE_URL=<production_url> npx knex migrate:latest
DATABASE_URL=<production_url> npx knex seed:run
```

## Mobile .env Güncelle

```
EXPO_PUBLIC_API_URL=https://your-app.railway.app/v1
```