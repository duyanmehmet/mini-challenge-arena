import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import db from "../database";
import { authLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

function signToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: (process.env.JWT_EXPIRES_IN ?? "30d") as any });
}

function mapUser(u: any) {
  return {
    id: u.id, username: u.username, email: u.email,
    avatarId: u.avatar_id, coins: u.coins, xp: u.xp, level: u.level,
    currentLeague: u.current_league, weeklyScore: u.weekly_score, isPremium: u.is_premium,
    streakCount: u.streak_count ?? 0,
    emailVerified: u.email_verified ?? false,
  };
}

// ── Kayıt ──
router.post("/register", authLimiter, async (req, res) => {
  const { username, email, password, avatarId = 1 } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: "Tüm alanlar zorunlu." });
  if (username.length < 3 || username.length > 20)
    return res.status(400).json({ message: "Kullanıcı adı 3-20 karakter olmalı." });

  try {
    const exists = await db("users").where("email", email.toLowerCase()).orWhere("username", username).first();
    if (exists) return res.status(409).json({ message: "E-posta veya kullanıcı adı zaten kullanılıyor." });

    const hash = await bcrypt.hash(password, 12);
    const userId = uuidv4();
    await db("users").insert({ id: userId, username, email: email.toLowerCase(), password_hash: hash, avatar_id: avatarId });

    const user = await db("users").where("id", userId).first();

    const { DailyTaskService } = await import("../services/DailyTaskService");
    await DailyTaskService.ensureTasksForToday(userId);

    // Doğrulama kodu gönder (sessiz hata — network hatası kayıt akışını engellemesin)
    import("../services/email.service").then(async ({ emailService }) => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await db("email_verifications").insert({
        id: uuidv4(), user_id: userId, code,
        expires_at: expiresAt.toISOString(), used: false,
      });
      emailService.sendVerificationCode(email.toLowerCase(), username, code).catch(() => {});
    }).catch(() => {});

    res.status(201).json({ user: mapUser(user), token: signToken(userId) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ── Giriş ──
router.post("/login", authLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "E-posta ve şifre gerekli." });

  try {
    const user = await db("users").where("email", email.toLowerCase()).first();
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({ message: "E-posta veya şifre hatalı." });

    // Streak güncelle
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    let streak = user.streak_count ?? 1;
    if (user.last_played_date !== today) {
      streak = user.last_played_date === yesterday ? streak + 1 : 1;
    }
    const coinsBonus = user.last_played_date !== today ? Math.min(streak, 7) * 10 : 0;

    await db("users").where("id", user.id).update({
      streak_count: streak, last_played_date: today,
      last_login_at: db.fn.now(),
      coins: db.raw("coins + ?", [coinsBonus]),
    });

    const { DailyTaskService } = await import("../services/DailyTaskService");
    await DailyTaskService.ensureTasksForToday(user.id);

    const updated = await db("users").where("id", user.id).first();
    res.json({ user: mapUser(updated), token: signToken(user.id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ── E-posta doğrulama kodu gönder ──
router.post("/send-verification", authLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "E-posta gerekli." });

  try {
    const user = await db("users").where("email", email.toLowerCase()).first();
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    if (user.email_verified) return res.status(400).json({ message: "E-posta zaten doğrulanmış." });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 dakika

    await db("email_verifications").where("user_id", user.id).delete();
    await db("email_verifications").insert({
      id: uuidv4(), user_id: user.id, code,
      expires_at: expiresAt.toISOString(), used: false,
    });

    const { emailService } = await import("../services/email.service");
    await emailService.sendVerificationCode(user.email, user.username, code).catch(() => {});

    res.json({ message: "Doğrulama kodu e-posta adresinize gönderildi." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ── E-posta doğrulama kodunu onayla ──
router.post("/verify-email", authLimiter, async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ message: "E-posta ve kod gerekli." });

  try {
    const user = await db("users").where("email", email.toLowerCase()).first();
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    const record = await db("email_verifications")
      .where({ user_id: user.id, code, used: false })
      .where("expires_at", ">", new Date().toISOString())
      .first();

    if (!record) return res.status(400).json({ message: "Kod hatalı veya süresi dolmuş." });

    await db("email_verifications").where("id", record.id).update({ used: true });
    await db("users").where("id", user.id).update({ email_verified: true });

    const updated = await db("users").where("id", user.id).first();
    res.json({ message: "E-posta doğrulandı.", user: mapUser(updated), token: signToken(user.id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ── Google ile Giriş ──
router.post("/google", authLimiter, async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) return res.status(400).json({ message: "Access token gerekli." });

  try {
    // Google'dan kullanıcı bilgilerini al
    const gRes = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
    if (!gRes.ok) return res.status(401).json({ message: "Geçersiz Google token." });

    const gUser = await gRes.json() as { id: string; email: string; name: string; picture: string };

    if (!gUser.email) return res.status(400).json({ message: "Google hesabından e-posta alınamadı." });

    // Mevcut kullanıcı var mı?
    let user = await db("users").where("email", gUser.email.toLowerCase()).first();

    if (!user) {
      // Yeni kullanıcı oluştur
      const userId = uuidv4();
      const username = gUser.name?.replace(/\s+/g, "_").slice(0, 20) || `user_${userId.slice(0, 6)}`;

      // Benzersiz kullanıcı adı garantile
      const exists = await db("users").where("username", username).first();
      const finalUsername = exists ? `${username}_${userId.slice(0, 4)}` : username;

      await db("users").insert({
        id: userId,
        username: finalUsername,
        email: gUser.email.toLowerCase(),
        password_hash: uuidv4(), // Google giriş — şifre kullanılmaz
        avatar_id: 1,
        email_verified: true,   // Google e-postası doğrulanmış kabul edilir
      });

      user = await db("users").where("id", userId).first();

      // Günlük görevleri oluştur
      const { DailyTaskService } = await import("../services/DailyTaskService");
      await DailyTaskService.ensureTasksForToday(userId).catch(() => {});
    }

    res.json({ user: mapUser(user), token: signToken(user.id) });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ── Şifre sıfırlama isteği ──
router.post("/forgot-password", authLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "E-posta gerekli." });

  try {
    const user = await db("users").where("email", email.toLowerCase()).first();
    if (user) {
      const resetToken = uuidv4();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 saat
      await db("users").where("id", user.id).update({
        reset_token: resetToken,
        reset_token_expires: expiresAt.toISOString(),
      });
      const { emailService } = await import("../services/email.service");
      await emailService.sendPasswordReset(email, resetToken).catch(() => {});
    }
    // Kullanıcı var olsa da olmasa da aynı yanıt (güvenlik)
    res.json({ message: "E-posta gönderildi (eğer hesap mevcutsa)." });
  } catch {
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// ── Şifre sıfırlama — tarayıcıda HTML form (e-posta linkinden gelir) ──
router.get("/reset-password", async (req, res) => {
  const { token } = req.query as { token?: string };

  const errorHtml = (msg: string) => res.send(`
    <!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Hata — Mini Challenge Arena</title>
    <style>body{font-family:sans-serif;background:#0d0d1a;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
    .box{background:#13132a;border-radius:20px;padding:32px;max-width:400px;width:90%;text-align:center}
    h2{color:#ef4444}p{color:#9ca3af;line-height:1.6}</style></head>
    <body><div class="box"><h2>❌ Hata</h2><p>${msg}</p></div></body></html>
  `);

  if (!token) return errorHtml("Geçersiz bağlantı. Lütfen yeni bir sıfırlama isteği gönderin.");

  try {
    const user = await db("users").where("reset_token", token).first();
    if (!user) return errorHtml("Bu bağlantı geçersiz veya daha önce kullanılmış.");
    if (user.reset_token_expires && new Date(user.reset_token_expires) < new Date())
      return errorHtml("Bu bağlantının süresi dolmuş. Lütfen yeni bir sıfırlama isteği gönderin.");

    res.send(`
      <!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Şifre Sıfırla — Mini Challenge Arena</title>
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:sans-serif;background:#0d0d1a;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh}
        .box{background:#13132a;border-radius:20px;padding:32px;max-width:420px;width:90%}
        h2{color:#8b5cf6;margin-bottom:8px;font-size:22px}
        p{color:#7c7aaa;font-size:14px;margin-bottom:24px}
        label{display:block;color:#c4b5fd;font-size:13px;margin-bottom:6px}
        input{width:100%;background:#0d0d1a;border:1.5px solid #2e2b5a;border-radius:12px;padding:14px;color:#fff;font-size:16px;margin-bottom:16px;outline:none}
        input:focus{border-color:#8b5cf6}
        button{width:100%;background:#6c3aed;color:#fff;border:none;border-radius:12px;padding:16px;font-size:16px;font-weight:bold;cursor:pointer;margin-top:4px}
        button:hover{background:#7c3aed}
        .success{background:#13132a;border-radius:20px;padding:32px;max-width:420px;width:90%;text-align:center}
        .success h2{color:#22c55e;margin-bottom:12px}
        .success p{color:#7c7aaa}
        .err{color:#ef4444;font-size:13px;margin-top:-8px;margin-bottom:12px;display:none}
      </style></head>
      <body>
        <div class="box" id="formBox">
          <h2>🔑 Şifre Sıfırla</h2>
          <p>Mini Challenge Arena hesabın için yeni şifreni belirle.</p>
          <label>Yeni Şifre</label>
          <input type="password" id="pw1" placeholder="En az 6 karakter" />
          <label>Şifre Tekrar</label>
          <input type="password" id="pw2" placeholder="Şifreyi tekrar gir" />
          <div class="err" id="errMsg"></div>
          <button onclick="submit()">Şifremi Güncelle</button>
        </div>
        <div class="success" id="successBox" style="display:none">
          <h2>✅ Başarılı!</h2>
          <p>Şifren güncellendi.<br>Uygulamayı açıp giriş yapabilirsin.</p>
        </div>
        <script>
          async function submit() {
            const pw1 = document.getElementById('pw1').value;
            const pw2 = document.getElementById('pw2').value;
            const err = document.getElementById('errMsg');
            err.style.display = 'none';
            if (pw1.length < 6) { err.textContent = 'Şifre en az 6 karakter olmalı.'; err.style.display='block'; return; }
            if (pw1 !== pw2) { err.textContent = 'Şifreler eşleşmiyor.'; err.style.display='block'; return; }
            const res = await fetch(window.location.origin + '/v1/auth/reset-password', {
              method: 'POST', headers: {'Content-Type':'application/json'},
              body: JSON.stringify({ token: '${token}', newPassword: pw1 })
            });
            const data = await res.json();
            if (res.ok) {
              document.getElementById('formBox').style.display = 'none';
              document.getElementById('successBox').style.display = 'block';
            } else {
              err.textContent = data.message ?? 'Bir hata oluştu.';
              err.style.display = 'block';
            }
          }
        </script>
      </body></html>
    `);
  } catch {
    errorHtml("Sunucu hatası. Lütfen tekrar deneyin.");
  }
});

// ── Şifre sıfırlama onay (API — uygulama içinden) ──
router.post("/reset-password", authLimiter, async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword || newPassword.length < 6)
    return res.status(400).json({ message: "Token ve en az 6 karakterli şifre gerekli." });

  try {
    const user = await db("users").where("reset_token", token).first();
    if (!user) return res.status(400).json({ message: "Geçersiz veya süresi dolmuş token." });
    if (user.reset_token_expires && new Date(user.reset_token_expires) < new Date())
      return res.status(400).json({ message: "Token süresi dolmuş. Lütfen yeni bir sıfırlama isteği gönderin." });

    const hash = await bcrypt.hash(newPassword, 12);
    await db("users").where("id", user.id).update({ password_hash: hash, reset_token: null });

    res.json({ message: "Şifreniz başarıyla güncellendi." });
  } catch {
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

export default router;