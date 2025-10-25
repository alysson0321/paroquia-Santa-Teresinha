require('dotenv').config();
const express = require('express');
// const mysql = require('mysql2'); // <-- MUDANÇA: Não usamos mais mysql
const { Pool } = require('pg'); // <-- MUDANÇA: Usamos o 'pg' (Pool é a forma correta de conectar)
const multer = require('multer');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000; // Porta dinâmica do Render

app.use(cors()); 
app.use(express.json());

// app.use(express.json()); // <-- Duplicado, removi

// --- NOVA CONEXÃO (PostgreSQL com Render) ---
// <-- MUDANÇA: Usamos um Pool. O Render vai fornecer esta URL de conexão
// automaticamente como uma Variável de Ambiente.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // O Render pode exigir SSL para conexões externas
  ssl: {
    rejectUnauthorized: false
  }
});

// <-- MUDANÇA: O Pool gerencia conexões, então não precisamos do db.connect()

// Multer (Ignorando por enquanto, como solicitado)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/comprovantes/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });


//Rotas ->
app.get('/', (req, res) => {
  res.send('API da paróquia está funcionando!');
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

//Cadastro usuario
app.post('/usuarios', (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' });
  }

  // <-- MUDANÇA: Trocamos ? por $1, $2, etc. e adicionamos RETURNING id
  const query = 'INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES ($1, $2, $3, $4) RETURNING id';
  
  // <-- MUDANÇA: Usamos 'pool.query' e a resposta está em 'result.rows'
  pool.query(query, [nome, email, senha, 'paroquiano'], (erro, result) => {
    if (erro) {
      console.error('erro ao cadastrar usuário:', erro);
      return res.status(500).json({ erro: 'erro ao cadastrar usuário.' });
    }

    // <-- MUDANÇA: O ID retornado está em result.rows[0].id
    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!', id: result.rows[0].id });
  });
});

//Login usuario
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
  }

  // <-- MUDANÇA: Trocamos ? por $1
  const query = 'SELECT * FROM usuarios WHERE email = $1';
  
  pool.query(query, [email], (erro, result) => { // <-- MUDANÇA: 'result'
    if (erro) {
      console.error('erro ao buscar usuário:', erro);
      return res.status(500).json({ erro: 'erro no servidor.' });
    }

    // <-- MUDANÇA: Os dados estão em 'result.rows'
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const usuario = result.rows[0]; // <-- MUDANÇA

    if (usuario.senha !== senha) {
      return res.status(401).json({ erro: 'Senha incorreta.' });
    }

    res.status(200).json({ mensagem: 'Login bem-sucedido!', usuario });
  });
});


// Rota para cadastrar intenção de missa
app.post('/intencoes', (req, res) => {
  const { usuario_id, descricao, data_missa } = req.body;

  if (!usuario_id || !descricao || !data_missa) {
    return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
  }

  // <-- MUDANÇA: Trocamos ? por $1, $2, $3
  const sql = "INSERT INTO intencoes_missa (usuario_id, descricao, data_missa) VALUES ($1, $2, $3)";

  pool.query(sql, [usuario_id, descricao, data_missa], (err, result) => {
    if (err) {
      console.error('Erro ao inserir intenção:', err);
      res.status(500).json({ erro: 'Erro ao inserir intenção no banco de dados.' });
    } else {
      console.log('Intenção inserida com sucesso!');
      res.status(200).json({ mensagem: 'Intenção cadastrada com sucesso!' });
    }
  });
});

// ============================
// ROTA: Listar intenções por usuário
// ============================
app.get('/intencoes', (req, res) => {
  const usuario_id = req.query.usuario_id;

  if (!usuario_id) {
    return res.status(400).json({ erro: "Informe o ID do usuário." });
  }

  // <-- MUDANÇA: Trocamos ? por $1
  const sql = 'SELECT * FROM intencoes_missa WHERE usuario_id = $1';
  pool.query(sql, [usuario_id], (err, result) => { // <-- MUDANÇA: 'result'
    if (err) {
      console.error("Erro ao buscar intenções:", err);
      return res.status(500).json({ erro: "Erro no servidor." });
    }
    res.json(result.rows); // <-- MUDANÇA: 'result.rows'
  });
});

// ============================
// ROTA: Listar dízimos por usuário
// ============================
app.get('/pagamentos_dizimo', (req, res) => {
  const usuario_id = req.query.usuario_id;

  if (!usuario_id) {
    return res.status(400).json({ erro: "Informe o ID do usuário." });
  }

  // <-- MUDANÇA: Trocamos ? por $1
  const sql = 'SELECT * FROM pagamentos_dizimo WHERE usuario_id = $1';
  pool.query(sql, [usuario_id], (err, result) => { // <-- MUDANÇA: 'result'
    if (err) {
      console.error("Erro ao buscar dízimos:", err);
      return res.status(500).json({ erro: "Erro no servidor." });
    }
    res.json(result.rows); // <-- MUDANÇA: 'result.rows'
  });
});


// Cadastrar evento
app.post('/eventos', (req, res) => {
  const { titulo, data_inicio, data_fim, local, banner } = req.body;

  if (!titulo || !data_inicio || !data_fim || !local || !banner) {
    return res.status(400).json({ erro: 'Todos os campos (titulo, data_inicio, data_fim, local, banner) são obrigatórios.' });
  }

  // <-- MUDANÇA: Trocamos ? por $1, $2, etc. e adicionamos RETURNING id
  const query = 'INSERT INTO eventos (titulo, data_inicio, data_fim, local, banner) VALUES ($1, $2, $3, $4, $5) RETURNING id';
  pool.query(query, [titulo, data_inicio, data_fim, local, banner], (err, result) => {
    if (err) {
      console.error('Erro ao cadastrar evento:', err);
      return res.status(500).json({ erro: 'Erro ao cadastrar evento.' });
    }
    res.status(201).json({ mensagem: 'Evento cadastrado com sucesso!', id: result.rows[0].id }); // <-- MUDANÇA
  });
});

// Listar eventos
app.get('/eventos', (req, res) => {
  const query = 'SELECT * FROM eventos ORDER BY data_inicio DESC';
  pool.query(query, (err, result) => { // <-- MUDANÇA
    if (err) {
      console.error('Erro ao buscar eventos:', err);
      return res.status(500).json({ erro: 'Erro ao buscar eventos.' });
    }
    res.status(200).json(result.rows); // <-- MUDANÇA
  });
});


// Cadastrar mídia
app.post('/midias', (req, res) => {
  const { titulo, data_evento, banner, link_externo } = req.body;

  if (!titulo || !data_evento || !banner || !link_externo) {
    return res.status(400).json({ erro: 'Todos os campos (titulo, data_evento, banner, link_externo) são obrigatórios.' });
  }

  // <-- MUDANÇA: Trocamos ? por $1, $2, etc. e adicionamos RETURNING id
  const query = 'INSERT INTO midias (titulo, data_evento, banner, link_externo) VALUES ($1, $2, $3, $4) RETURNING id';
  pool.query(query, [titulo, data_evento, banner, link_externo], (err, result) => {
    if (err) {
      console.error('Erro ao cadastrar mídia:', err);
      return res.status(500).json({ erro: 'Erro ao cadastrar mídia.' });
    }
    res.status(201).json({ mensagem: 'Mídia cadastrada com sucesso!', id: result.rows[0].id }); // <-- MUDANÇA
  });
});

// Listar mídias
app.get('/midias', (req, res) => {
  const query = 'SELECT * FROM midias ORDER BY data_evento DESC';
  pool.query(query, (err, result) => { // <-- MUDANÇA
    if (err) {
      console.error('Erro ao buscar mídias:', err);
      return res.status(500).json({ erro: 'Erro ao buscar mídias.' });
    }
    res.status(200).json(result.rows); // <-- MUDANÇA
  });
});
// --------------- PIX ------------------- //
app.post('/pagamentos-dizimo', async (req, res) => {
  let { usuario_id, valor, data_pagamento } = req.body;

  if (!usuario_id || !valor || !data_pagamento) {
    return res.status(400).json({ erro: 'usuario id, valor e data de pagamento são obrigatórios.' });
  }

  valor = parseFloat(valor);

  try {
    console.log("Recebido:", { usuario_id, valor, data_pagamento });

    const qrCodePix = QrCodePix({
      version: '01',
      key: '(87) 98126-3429', // Considere mover para process.env.CHAVE_PIX
      name: 'Paroquia Sta Teresinha',
      city: 'Jucati-PE',
      transactionId: `DIZ${Date.now().toString().slice(-6)}`,
      message: 'Dízimo Paroquia',
      value: valor
    });

    const copiaCola = await qrCodePix.payload();
    const qrCodeBase64 = await qrCodePix.base64();

    // <-- MUDANÇA: Trocamos ? por $1, $2, etc. e adicionamos RETURNING id
    const query = 'INSERT INTO pagamentos_dizimo (usuario_id, valor, data_pagamento, status) VALUES ($1, $2, $3, $4) RETURNING id';
    pool.query(query, [usuario_id, valor, data_pagamento, 'pendente'], (erro, result) => {
      if (erro) {
        console.error('Erro ao salvar pagamento:', erro);
        return res.status(500).json({ erro: 'Erro ao salvar pagamento' });
      }

      res.status(201).json({
        mensagem: 'Pagamento iniciado! Escaneie o QR Code para pagar.',
        copia_cola: copiaCola,
        qrCodeBase64: qrCodeBase64,
        pagamentoId: result.rows[0].id // <-- MUDANÇA
      });
    });

  } catch (erro) {
    console.error('Erro ao gerar PIX:', erro);
    res.status(500).json({ erro: 'Erro ao gerar PIX.' });
  }
});