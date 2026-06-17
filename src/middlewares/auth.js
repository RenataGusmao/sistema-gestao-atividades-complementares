const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

function cursoIdValor(curso) {
  return curso?._id || curso?.id || curso;
}

function agregarPerfis(usuarios) {
  return [...new Set(
    usuarios.flatMap((usuario) => usuario.perfis || [])
  )];
}

function agregarCursosCoordenados(usuarios) {
  const cursosPorId = new Map();

  usuarios.forEach((usuario) => {
    (usuario.cursosCoordenados || []).forEach((item) => {
      const cursoId = cursoIdValor(item.cursoId);

      if (cursoId && !cursosPorId.has(String(cursoId))) {
        cursosPorId.set(String(cursoId), item);
      }
    });
  });

  return Array.from(cursosPorId.values());
}

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

  const usuariosMesmoEmail = await Usuario.find({
    email: usuario.email,
    ativo: true
  })
    .select('+senhaHash')
    .populate('cursosCoordenados.cursoId');

  usuario.perfis = agregarPerfis(usuariosMesmoEmail);
  usuario.cursosCoordenados = agregarCursosCoordenados(usuariosMesmoEmail);

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
