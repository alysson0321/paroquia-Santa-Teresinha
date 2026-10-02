CREATE TYPE tipo_usuario_enum AS ENUM ('admin', 'paroquiano');
CREATE TYPE status_pagamento_enum AS ENUM ('pendente', 'aprovado', 'rejeitado');

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  tipo_usuario tipo_usuario_enum NOT NULL DEFAULT 'paroquiano',
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE intencoes_missa (
  id SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  data_missa DATE NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pagamentos_dizimo (
  id SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  data_pagamento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  chave_pix TEXT NOT NULL,
  comprovante TEXT NOT NULL,
  status status_pagamento_enum NOT NULL DEFAULT 'pendente',
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE eventos (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  data_inicio DATE NOT NULL,
  data_texto VARCHAR(100) NOT NULL,
  local VARCHAR(255) NOT NULL,
  banner TEXT NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE midias (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  data_evento DATE NOT NULL,
  link_externo TEXT NOT NULL,
  banner TEXT NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_intencoes_usuario_data ON intencoes_missa(usuario_id, data_missa);
CREATE INDEX idx_dizimos_usuario_status ON pagamentos_dizimo(usuario_id, status);
CREATE INDEX idx_eventos_data ON eventos(data_inicio);
CREATE INDEX idx_midias_data ON midias(data_evento);
