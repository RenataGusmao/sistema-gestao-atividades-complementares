const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

exports.protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Token não informado.', 401);
  }

  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new AppError('Token inválido ou expirado.', 401);
  }

  const usuario = await Usuario.findById(decoded.sub).select('+senhaHash');
  if (!usuario || !usuario.ativo) {
    throw new AppError('Usuário não encontrado ou inativo.', 401);
  }

  req.user = usuario;
  next();
});

exports.authorize = (...perfisPermitidos) => {
  return (req, res, next) => {
    const perfisUsuario = req.user.perfis || [];
    const autorizado = perfisPermitidos.some((perfil) => perfisUsuario.includes(perfil));

    if (!autorizado) {
      return next(new AppError('Acesso negado para este perfil.', 403));
    }

    next();
  };
};
