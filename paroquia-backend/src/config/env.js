const dotenv = require('dotenv');

dotenv.config();

const required = ['DATABASE_URL', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length && process.env.NODE_ENV === 'production') {
  throw new Error(`Variáveis obrigatórias ausentes: ${missing.join(', ')}`);
}

module.exports = {
  port: Number(process.env.PORT || 3000),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'dev-only-change-me',
  frontendOrigins: Array.from(new Set([
    ...(process.env.FRONTEND_ORIGIN || '').split(',').map((origin) => origin.trim()).filter(Boolean),
    'https://paroquiasantateresinha.onrender.com',
    'http://localhost:5500',
  ])),
  pixKey: process.env.PIX_KEY || '87981263429',
  maxUploadBytes: Number(process.env.MAX_UPLOAD_MB || 5) * 1024 * 1024,
};
