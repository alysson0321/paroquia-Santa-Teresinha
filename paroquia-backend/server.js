require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const multer = require("multer");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const fs = require("fs");

app.use(cors());
app.use(express.json());

// criar pastas de upload se não existirem
const uploadsDir = path.join(__dirname, "uploads");
const bannersDir = path.join(uploadsDir, "banners");
const midiasDir = path.join(uploadsDir, "midias");
const comprovantesDir = path.join(uploadsDir, "comprovantes");

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(bannersDir)) fs.mkdirSync(bannersDir);
if (!fs.existsSync(midiasDir)) fs.mkdirSync(midiasDir);
if (!fs.existsSync(comprovantesDir)) fs.mkdirSync(comprovantesDir);

// config do bd
const connectionString = process.env.DATABASE_URL;

const connectionConfig = {
  connectionString: connectionString,
};

if (
  connectionString &&
  !connectionString.includes("localhost") &&
  !connectionString.includes("127.0.0.1")
) {
  connectionConfig.ssl = {
    rejectUnauthorized: false,
  };
}

const pool = new Pool(connectionConfig);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// config multer eventos e midias ---
const bannerStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, bannersDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extensao = path.extname(file.originalname);
    cb(null, "banner-" + uniqueSuffix + extensao);
  },
});

const midiaStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, midiasDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extensao = path.extname(file.originalname);
    cb(null, "midia-" + uniqueSuffix + extensao);
  },
});

// instâncias do multer
const uploadBannerEvento = multer({ storage: bannerStorage });
const uploadBannerMidia = multer({ storage: midiaStorage });

app.use("/uploads", express.static(uploadsDir));

//rotas ->
app.get("/", (req, res) => {
  res.send("Servidor da Paróquia Santa Teresinha");
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

//cadastro usuario
app.post("/usuarios", (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res
      .status(400)
      .json({ erro: "Nome, email e senha são obrigatórios." });
  }

  const query =
    "INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES ($1, $2, $3, $4) RETURNING id";

  pool.query(query, [nome, email, senha, "paroquiano"], (erro, result) => {
    if (erro) {
      console.error("erro ao cadastrar usuário:", erro);
      return res.status(500).json({ erro: "erro ao cadastrar usuário." });
    }

    res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso!",
      id: result.rows[0].id,
    });
  });
});

//login usuario
app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: "Email e senha são obrigatórios." });
  }

  const query = "SELECT * FROM usuarios WHERE email = $1";

  pool.query(query, [email], (erro, result) => {
    if (erro) {
      console.error("erro ao buscar usuário:", erro);
      return res.status(500).json({ erro: "erro no servidor." });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    const usuario = result.rows[0];

    if (usuario.senha !== senha) {
      return res.status(401).json({ erro: "Senha incorreta." });
    }

    res.status(200).json({ mensagem: "Login bem-sucedido!", usuario });
  });
});

// rota para cadastrar intenção da missa
app.post("/intencoes", (req, res) => {
  const { usuario_id, descricao, data_missa } = req.body;

  if (!usuario_id || !descricao || !data_missa) {
    return res
      .status(400)
      .json({ erro: "Preencha todos os campos obrigatórios." });
  }

  const sql =
    "INSERT INTO intencoes_missa (usuario_id, descricao, data_missa) VALUES ($1, $2, $3)";

  pool.query(sql, [usuario_id, descricao, data_missa], (err, result) => {
    if (err) {
      console.error("Erro ao inserir intenção:", err);
      res
        .status(500)
        .json({ erro: "Erro ao inserir intenção no banco de dados." });
    } else {
      console.log("Intenção inserida com sucesso!");
      res.status(200).json({ mensagem: "Intenção cadastrada com sucesso!" });
    }
  });
});

// listar intenções por usuário
app.get("/intencoes", (req, res) => {
  const usuario_id = req.query.usuario_id;

  if (!usuario_id) {
    return res.status(400).json({ erro: "Informe o ID do usuário." });
  }

  const sql = "SELECT * FROM intencoes_missa WHERE usuario_id = $1";
  pool.query(sql, [usuario_id], (err, result) => {
    if (err) {
      console.error("Erro ao buscar intenções:", err);
      return res.status(500).json({ erro: "Erro no servidor." });
    }
    res.json(result.rows);
  });
});

// remover intenções
app.delete("/intencoes/:id", (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ erro: "ID da intenção é obrigatório." });
  }

  const query = "DELETE FROM intencoes_missa WHERE id = $1";

  pool.query(query, [id], (erro, result) => {
    if (erro) {
      console.error("Erro ao deletar intenção:", erro);
      return res.status(500).json({ erro: "Erro no servidor ao deletar." });
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: "Intenção não encontrada." });
    }

    res.status(200).json({ mensagem: "Intenção removida com sucesso!" });
  });
});

// atualizar intenção
app.put("/intencoes/:id", async (req, res) => {
  const { id } = req.params;
  const { descricao, data_missa } = req.body;

  try {
    const sql =
      "UPDATE intencoes_missa SET descricao = $1, data_missa = $2 WHERE id = $3";
    await pool.query(sql, [descricao, data_missa, id]);
    res.status(200).json({ mensagem: "Intenção atualizada com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar intenção:", error);
    res.status(500).json({ erro: "Erro ao atualizar no banco de dados." });
  }
});

// listar dízimos por usuário
app.get("/pagamentos_dizimo", (req, res) => {
  const usuario_id = req.query.usuario_id;

  if (!usuario_id) {
    return res.status(400).json({ erro: "Informe o ID do usuário." });
  }

  const sql = "SELECT * FROM pagamentos_dizimo WHERE usuario_id = $1";
  pool.query(sql, [usuario_id], (err, result) => {
    if (err) {
      console.error("Erro ao buscar dízimos:", err);
      return res.status(500).json({ erro: "Erro no servidor." });
    }
    res.json(result.rows);
  });
});

// cadastrar eventos - admin.html
app.post("/eventos", upload.single("banner"), async (req, res) => {
  try {
    const { titulo, data_inicio, data_texto, local } = req.body;

    if (!titulo || !data_inicio || !data_texto || !local) {
      return res
        .status(400)
        .json({ erro: "Preencha todos os campos de texto." });
    }
    if (!req.file) {
      return res
        .status(400)
        .json({ erro: "A imagem do banner é obrigatória." });
    }

    const bannerBase64 = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;

    const sql = `
      INSERT INTO eventos (titulo, data_inicio, data_texto, local, banner) 
      VALUES ($1, $2, $3, $4, $5) RETURNING id
    `;

    await pool.query(sql, [
      titulo,
      data_inicio,
      data_texto,
      local,
      bannerBase64,
    ]);

    res.status(201).json({ mensagem: "Evento criado com sucesso!" });
  } catch (error) {
    console.error("ERRO NO BACKEND (EVENTOS):", error);
    res.status(500).json({ erro: "Erro interno ao salvar evento." });
  }
});

// listar eventos - index.html
app.get("/eventos", (req, res) => {
  const query =
    "SELECT id, titulo, data_inicio, data_texto, local, banner FROM eventos ORDER BY data_inicio DESC";
  pool.query(query, (err, result) => {
    if (err) {
      console.error("Erro ao buscar eventos:", err);
      return res.status(500).json({ erro: "Erro ao buscar eventos." });
    }
    res.status(200).json(result.rows);
  });
});

// cadastrar mídias
app.post("/midias", upload.single("banner"), async (req, res) => {
  try {
    const { titulo, data_evento, link_externo } = req.body;

    if (!titulo || !data_evento || !link_externo) {
      return res
        .status(400)
        .json({ erro: "Preencha todos os campos de texto." });
    }
    if (!req.file) {
      return res.status(400).json({ erro: "A capa da mídia é obrigatória." });
    }

    const bannerBase64 = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;

    const sql = `
      INSERT INTO midias (titulo, data_evento, link_externo, banner) 
      VALUES ($1, $2, $3, $4) RETURNING id
    `;

    await pool.query(sql, [titulo, data_evento, link_externo, bannerBase64]);

    res.status(201).json({ mensagem: "Mídia criada com sucesso!" });
  } catch (error) {
    console.error("ERRO NO BACKEND (MIDIAS):", error);
    res.status(500).json({ erro: "Erro interno ao salvar mídia." });
  }
});

// listar mídias
app.get("/midias", (req, res) => {
  const query = "SELECT * FROM midias ORDER BY data_evento DESC";
  pool.query(query, (err, result) => {
    if (err) {
      console.error("Erro ao buscar mídias:", err);
      return res.status(500).json({ erro: "Erro ao buscar mídias." });
    }
    res.status(200).json(result.rows);
  });
});

// cadastrar pagamento dízimo
app.post(
  "/pagamentos-dizimo",
  upload.single("comprovante"),
  async (req, res) => {
    const { usuario_id, valor, data_pagamento } = req.body;

    if (!usuario_id || !valor || !data_pagamento || !req.file) {
      return res
        .status(400)
        .json({ erro: "Todos os dados e o comprovante são obrigatórios." });
    }

    try {
      const imagemBase64 = `data:${
        req.file.mimetype
      };base64,${req.file.buffer.toString("base64")}`;

      const query =
        "INSERT INTO pagamentos_dizimo (usuario_id, valor, data_pagamento, comprovante, status) VALUES ($1, $2, $3, $4, $5) RETURNING id";

      const result = await pool.query(query, [
        usuario_id,
        parseFloat(valor),
        data_pagamento,
        imagemBase64,
        "pendente",
      ]);

      res.status(201).json({
        mensagem: "Dízimo enviado com sucesso! Aguarde a aprovação.",
        pagamentoId: result.rows[0].id,
      });
    } catch (erro) {
      console.error("Erro ao salvar dízimo:", erro);
      res.status(500).json({ erro: "Erro interno ao processar o envio." });
    }
  }
);

// listar dizimos pendentes (admin)
app.get("/admin/dizimos-pendentes", async (req, res) => {
  try {
    const sql = `
      SELECT p.id, p.valor, p.data_pagamento, p.comprovante, u.nome 
      FROM pagamentos_dizimo p 
      JOIN usuarios u ON p.usuario_id = u.id 
      WHERE p.status = 'pendente'
    `;
    const result = await pool.query(sql);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar dízimos." });
  }
});

// validar ou rejeitar dízimos (admin)
app.put("/admin/dizimos/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const sql = "UPDATE pagamentos_dizimo SET status = $1 WHERE id = $2";
    await pool.query(sql, [status, id]);
    res.json({ mensagem: `Dízimo ${status} com sucesso!` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao atualizar status." });
  }
});
