import nodemailer from 'nodemailer';

function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_USER,
      pass: process.env.BREVO_KEY,
    },
  });
}

async function sendMail(to: string, subject: string, html: string): Promise<void> {
  if (!process.env.BREVO_USER || !process.env.BREVO_KEY) {
    console.warn('[Email] BREVO_USER veya BREVO_KEY eksik, e-posta gönderilmedi.');
    return;
  }
  const transporter = createTransporter();
  await transporter.sendMail({
    from: '"Mini Challenge Arena" <noreply@minichallengearena.com>',
    to,
    subject,
    html,
  });
}

export const emailService = {
  async sendPasswordReset(to: string, token: string): Promise<void> {
    const resetUrl = `${process.env.APP_URL ?? 'https://mini-challenge-arena-production.up.railway.app'}/v1/auth/reset-password?token=${token}`;
    await sendMail(to, 'Şifre Sıfırlama — Mini Challenge Arena', `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;background:#f9fafb;border-radius:16px">
        <h2 style="color:#6c3aed">🏆 Mini Challenge Arena</h2>
        <p style="color:#374151">Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
        <a href="${resetUrl}" style="display:inline-block;background:#6c3aed;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px;margin:16px 0">
          🔑 Şifremi Sıfırla
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:16px">
          Buton çalışmazsa:<br>
          <a href="${resetUrl}" style="color:#6c3aed">${resetUrl}</a>
        </p>
        <p style="color:#9ca3af;font-size:12px">Bu bağlantı <strong>1 saat</strong> geçerlidir.</p>
      </div>
    `);
  },

  async sendVerificationCode(to: string, username: string, code: string): Promise<void> {
    await sendMail(to, `${code} — E-posta Doğrulama Kodu`, `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px">
        <h2 style="color:#6c3aed">🏆 Mini Challenge Arena</h2>
        <p>Merhaba <strong>${username}</strong>,</p>
        <p>E-posta adresinizi doğrulamak için aşağıdaki 6 haneli kodu kullanın:</p>
        <div style="background:#f4f4f4;border-radius:12px;padding:20px;text-align:center;margin:16px 0">
          <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#333">${code}</span>
        </div>
        <p style="color:#888;font-size:13px">Bu kod <strong>10 dakika</strong> geçerlidir.</p>
      </div>
    `);
  },
};
