import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST ?? "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const emailService = {
  async sendPasswordReset(to: string, token: string): Promise<void> {
    // Deep link — uygulamayı doğrudan reset-password ekranında açar
    const resetUrl = `${process.env.APP_URL ?? "https://minichallengearena.com"}/v1/auth/reset-password?token=${token}`;
    await transporter.sendMail({
      from: `"Mini Challenge Arena" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Şifre Sıfırlama — Mini Challenge Arena",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;background:#f9fafb;border-radius:16px">
          <h2 style="color:#6c3aed">🏆 Mini Challenge Arena</h2>
          <p style="color:#374151">Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
          <a href="${resetUrl}" style="display:inline-block;background:#6c3aed;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px;margin:16px 0">
            🔑 Şifremi Sıfırla
          </a>
          <p style="color:#9ca3af;font-size:12px;margin-top:16px">
            Buton çalışmazsa şu bağlantıyı kopyalayın:<br>
            <a href="${resetUrl}" style="color:#6c3aed">${resetUrl}</a>
          </p>
          <p style="color:#9ca3af;font-size:12px">Bu bağlantı <strong>1 saat</strong> geçerlidir. Siz talep etmediyseniz bu e-postayı görmezden gelin.</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
          <p style="color:#9ca3af;font-size:11px;text-align:center">Mini Challenge Arena · destek@minichallengearena.com</p>
        </div>
      `,
    });
  },

  async sendVerificationCode(to: string, username: string, code: string): Promise<void> {
    await transporter.sendMail({
      from: `"Mini Challenge Arena" <${process.env.EMAIL_USER}>`,
      to,
      subject: `${code} — E-posta Doğrulama Kodu`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px">
          <h2 style="color:#e94560">🏆 Mini Challenge Arena</h2>
          <p>Merhaba <strong>${username}</strong>,</p>
          <p>E-posta adresinizi doğrulamak için aşağıdaki 6 haneli kodu kullanın:</p>
          <div style="background:#f4f4f4;border-radius:12px;padding:20px;text-align:center;margin:16px 0">
            <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#333">${code}</span>
          </div>
          <p style="color:#888;font-size:13px">Bu kod <strong>10 dakika</strong> geçerlidir. Siz talep etmediyseniz bu e-postayı görmezden gelin.</p>
        </div>
      `,
    });
  },

  async sendWelcome(to: string, username: string): Promise<void> {
    await transporter.sendMail({
      from: `"Mini Challenge Arena" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Hoş geldin! 🎮",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
          <h2>⚡ Hoş geldin, ${username}!</h2>
          <p>Mini Challenge Arena'ya katıldığın için teşekkürler. 6 oyun modunda arkadaşlarınla yarış, liderlik tablosuna çık!</p>
          <p>İyi oyunlar! 🏆</p>
        </div>
      `,
    });
  },
};