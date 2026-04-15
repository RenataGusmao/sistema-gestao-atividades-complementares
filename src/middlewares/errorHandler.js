module.exports = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      message: 'Erro de validação.',
      errors: Object.values(err.errors).map((e) => e.message)
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      message: 'Registro duplicado.',
      fields: err.keyValue
    });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({ message: err.message });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor.';

  return res.status(statusCode).json({ message });
};
