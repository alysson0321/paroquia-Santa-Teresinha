const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signUser(user) {
  return jwt.sign({ id: user.id, role: user.tipo_usuario }, env.jwtSecret, { expiresIn: '2h' });
}

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ erro: 'Autenticação necessária.' });
  try {
    req.user = jwt.verify(token, env.jwtSecret);
    next();
  } catch {
    return res.status(401).json({ erro: 'Sessão inválida ou expirada.' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ erro: 'Acesso restrito à administração.' });
  next();
}

module.exports = { signUser, authenticate, requireAdmin };
