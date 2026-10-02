require('../src/config/env');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('../src/config/database');

const tables = ['usuarios', 'intencoes_missa', 'pagamentos_dizimo', 'eventos', 'midias'];

async function backup(client) {
  const snapshot = { createdAt: new Date().toISOString(), tables: {} };
  for (const table of tables) {
    const result = await client.query(`SELECT * FROM ${table}`);
    snapshot.tables[table] = result.rows;
  }
  const backupDir = path.resolve(__dirname, '../../../../work');
  fs.mkdirSync(backupDir, { recursive: true });
  const file = path.join(backupDir, `neon-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(file, JSON.stringify(snapshot, null, 2), { encoding: 'utf8', flag: 'wx' });
  return file;
}

async function migrate() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL não está configurada.');
  const client = await pool.connect();
  try {
    const backupFile = await backup(client);
    await client.query('BEGIN');

    for (const table of tables) {
      await client.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`);
      await client.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`);
    }

    await client.query('CREATE INDEX IF NOT EXISTS idx_intencoes_usuario_data ON intencoes_missa(usuario_id, data_missa)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_dizimos_usuario_status ON pagamentos_dizimo(usuario_id, status)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_eventos_data ON eventos(data_inicio)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_midias_data ON midias(data_evento)');

    const users = await client.query('SELECT id, senha FROM usuarios');
    let passwordsUpdated = 0;
    for (const user of users.rows) {
      if (!/^\$2[aby]\$/.test(user.senha)) {
        await client.query('UPDATE usuarios SET senha=$1, atualizado_em=CURRENT_TIMESTAMP WHERE id=$2', [await bcrypt.hash(user.senha, 12), user.id]);
        passwordsUpdated += 1;
      }
    }

    const adminEmail = 'alyssonfdbr874@gmail.com';
    const adminHash = await bcrypt.hash('cavalo12', 12);
    await client.query(`INSERT INTO usuarios (nome,email,senha,tipo_usuario) VALUES ($1,$2,$3,'admin') ON CONFLICT (email) DO UPDATE SET nome=EXCLUDED.nome,senha=EXCLUDED.senha,tipo_usuario='admin',atualizado_em=CURRENT_TIMESTAMP`, ['Administrador', adminEmail, adminHash]);
    await client.query('COMMIT');

    console.log(JSON.stringify({ ok: true, backupFile, users: users.rowCount, passwordsUpdated, adminEmail }, null, 2));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((error) => { console.error(error); process.exitCode = 1; });
