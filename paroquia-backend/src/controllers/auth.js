const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { signUser } = require('../middleware/auth');
const { userSchema, loginSchema, parse } = require('../validators/schemas');

async function register(req, res) {
  const input = parse(userSchema, req.body);
  const password = await bcrypt.hash(input.senha, 12);
  try {
    const result = await pool.query('INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES ($1,$2,$3,$4) RETURNING id,nome,email,tipo_usuario', [input.nome, input.email.toLowerCase(), password, 'paroquiano']);
    res.status(201).json({ usuario: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
    throw error;
  }
}

async function login(req, res) {
  const input = parse(loginSchema, req.body);
  const result = await pool.query('SELECT id,nome,email,senha,tipo_usuario FROM usuarios WHERE email=$1', [input.email.toLowerCase()]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(input.senha, user.senha))) return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
  delete user.senha;
  res.json({ usuario: user, token: signUser(user) });
}

module.exports = { register, login };
