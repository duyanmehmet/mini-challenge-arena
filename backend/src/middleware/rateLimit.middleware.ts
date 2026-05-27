import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Çok fazla istek. 15 dakika bekleyin.' },
});

export const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { message: 'Çok fazla e-posta isteği. 15 dakika bekleyin.' },
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 120,
  message: { message: 'Çok fazla istek.' },
});
