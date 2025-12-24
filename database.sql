-- =========================
-- ENUMS
-- =========================
CREATE TYPE tipo_usuario_enum AS ENUM ('admin', 'paroquiano');
CREATE TYPE status_pagamento_enum AS ENUM ('pendente', 'aprovado', 'rejeitado');

-- =========================
-- USUÁRIOS
-- =========================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo_usuario tipo_usuario_enum NOT NULL DEFAULT 'paroquiano'
);

-- =========================
-- INTENÇÕES DE MISSA
-- =========================
CREATE TABLE intencoes_missa (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    descricao TEXT NOT NULL,
    data_missa DATE NOT NULL,
    CONSTRAINT fk_usuario_intencao
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

-- =========================
-- PAGAMENTOS DO DÍZIMO
-- =========================
CREATE TABLE pagamentos_dizimo (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
    data_pagamento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    chave_pix TEXT NOT NULL DEFAULT '87981263429',
    comprovante TEXT NOT NULL,
    status status_pagamento_enum NOT NULL DEFAULT 'pendente',
    CONSTRAINT fk_usuario_dizimo
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

-- =========================
-- EVENTOS
-- =========================
CREATE TABLE eventos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    data_inicio DATE NOT NULL,
    data_texto VARCHAR(100) NOT NULL,
    local VARCHAR(255) NOT NULL,
    banner TEXT NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- MÍDIAS
-- =========================
CREATE TABLE midias (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    data_evento DATE NOT NULL,
    link_externo TEXT NOT NULL,
    banner TEXT NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
