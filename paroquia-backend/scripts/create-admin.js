require('../src/config/env');
const bcrypt = require('bcryptjs');
const pool = require('../src/config/database');

async function main() {
  const email = process.argv[2] || 'admin@paroquia.local';
  const password = process.argv[3] || 'Admin@12345';
  const hash = await bcrypt.hash(password, 12);
  await pool.query(`INSERT INTO usuarios (nome,email,senha,tipo_usuario) VALUES ($1,$2,$3,'admin') ON CONFLICT (email) DO UPDATE SET senha=EXCLUDED.senha,tipo_usuario='admin'`, ['Administrador', email.toLowerCase(), hash]);
  console.log(`Administrador configurado: ${email.toLowerCase()}`);
  await pool.end();
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
