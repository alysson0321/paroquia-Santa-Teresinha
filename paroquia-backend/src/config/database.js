const { Pool } = require('pg');
const env = require('./env');

if (!env.databaseUrl) {
  const { newDb } = require('pg-mem');
  const bcrypt = require('bcryptjs');
  const memoryDb = newDb({ autoCreateForeignKeyIndices: true });
  memoryDb.public.none(`
    CREATE TABLE usuarios (id SERIAL PRIMARY KEY, nome VARCHAR(100) NOT NULL, email VARCHAR(100) UNIQUE NOT NULL, senha VARCHAR(255) NOT NULL, tipo_usuario VARCHAR(20) NOT NULL DEFAULT 'paroquiano', criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP, atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE intencoes_missa (id SERIAL PRIMARY KEY, usuario_id INT NOT NULL, descricao TEXT NOT NULL, data_missa DATE NOT NULL, criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP, atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE pagamentos_dizimo (id SERIAL PRIMARY KEY, usuario_id INT NOT NULL, valor NUMERIC NOT NULL, data_pagamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP, chave_pix TEXT NOT NULL, comprovante TEXT NOT NULL, status VARCHAR(20) DEFAULT 'pendente', atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE eventos (id SERIAL PRIMARY KEY, titulo VARCHAR(255) NOT NULL, data_inicio DATE NOT NULL, data_texto VARCHAR(100) NOT NULL, local VARCHAR(255) NOT NULL, banner TEXT NOT NULL, criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP, atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE midias (id SERIAL PRIMARY KEY, titulo VARCHAR(255) NOT NULL, data_evento DATE NOT NULL, link_externo TEXT NOT NULL, banner TEXT NOT NULL, criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP, atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
  `);
  const adminHash = bcrypt.hashSync('Admin@12345', 10);
  memoryDb.public.none(`INSERT INTO usuarios (nome,email,senha,tipo_usuario) VALUES ('Administrador','admin@paroquia.local','${adminHash}','admin')`);
  console.warn('DATABASE_URL não configurada: usando banco de demonstração em memória.');
  module.exports = new (memoryDb.adapters.createPg().Pool)();
} else {
const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.databaseUrl && !/localhost|127\.0\.0\.1/.test(env.databaseUrl)
    ? { rejectUnauthorized: false }
    : undefined,
});

module.exports = pool;
}
