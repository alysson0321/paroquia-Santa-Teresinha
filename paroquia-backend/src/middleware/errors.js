function notFound(req, res) {
  res.status(404).json({ erro: 'Recurso não encontrado.' });
}

function errorHandler(error, req, res, next) {
  console.error(error);
  if (error.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ erro: 'Arquivo excede o limite permitido.' });
  if (error.name === 'MulterError') return res.status(400).json({ erro: 'Arquivo inválido.' });
  res.status(error.status || 500).json({ erro: error.status ? error.message : 'Erro interno do servidor.' });
}

module.exports = { notFound, errorHandler };
