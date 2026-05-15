# Production Deploy Rehberi — Zeka Meydanı

## 1. Backend — Railway.app (Ücretsiz)

1. https://railway.app → New Project → Deploy from GitHub Repo → bu repo → `backend` klasörü
2. PostgreSQL ekle: Add Service → PostgreSQL  
3. Environment Variables ekle:
   ```
   NODE_ENV=production
   DATABASE_URL=<railway postgresql url - otomatik gelir>
   JWT_SECRET=gizli-anahtar-en-az-32-karakter
   JWT_EXPIRES_IN=30d
   PORT=3000
   ```
4. Deploy tamamlandığında URL al (örn: `https://zeka-meydani.up.railway.app`)
5. Migrations çalıştır: Railway shell'den `npx knex migrate:latest`

## 2. Mobile — .env güncelle

`mobile/.env` dosyasını aç ve Railway URL'ini yaz:
```
EXPO_PUBLIC_API_URL=https://zeka-meydani.up.railway.app/v1
```

## 3. Test et

```bash
cd mobile
npx expo start --clear
```

Telefonda QR okut, giriş yap — başarılıysa production çalışıyor.

## 4. App Store / Play Store için EAS Build

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```
