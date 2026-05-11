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
    const resetUrl = `${process.env.APP_URL ?? "https://minichallengearena.com"}/reset-password?token=${token}`;
    await transporter.sendMail({
      from: `"Mini Challenge Arena" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Şifre Sıfırlama",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
          <h2>⚡ Mini Challenge Arena</h2>
          <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
          <a href="${resetUrl}" style="display:inline-block;background:#e94560;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
            Şifremi Sıfırla
          </a>
          <p style="color:#888;font-size:12px;margin-top:16px">Bu bağlantı 1 saat geçerlidir. Siz talep etmediyseniz bu e-postayı görmezden gelin.</p>
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