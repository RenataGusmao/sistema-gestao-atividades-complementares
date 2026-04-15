const Usuario = require('../models/Usuario');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/jwt');
const { registrarAuditoria } = require('../services/audit.service');

exports.register = asyncHandler(async (req, res) => {
  const { nome, email, senha, perfis } = req.body;

  const usuario = await Usuario.create({
    nome,
    email,
    senhaHash: senha,
    perfis: Array.isArray(perfis) && perfis.length ? perfis : ['aluno']
  });

  await registrarAuditoria({
    usuarioId: usuario._id,
    tabelaAfetada: 'usuarios',
    acao: 'INSERT',
    idRegistroAfetado: String(usuario._id),
    descricaoAcao: 'Cadastro de usuário',
    ipOrigem: req.ip
  });

  res.status(201).json({
    message: 'Usuário cadastrado com sucesso.',
    data: {
      id: usuario._id,
      nome: usuario.nome,
      email: usuario.email,
      perfis: usuario.perfis
    }
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, senha } = req.body;

  const usuario = await Usuario.findOne({ email: email?.toLowerCase() }).select('+senhaHash');
  if (!usuario || !usuario.ativo) {
    throw new AppError('Credenciais inválidas.', 401);
  }

  const senhaOk = await usuario.compararSenha(senha);
  if (!senhaOk) {
    throw new AppError('Credenciais inválidas.', 401);
  }

  const token = signToken({ sub: usuario._id, perfis: usuario.perfis });

  await registrarAuditoria({
    usuarioId: usuario._id,
    tabelaAfetada: 'usuarios',
    acao: 'LOGIN',
    idRegistroAfetado: String(usuario._id),
    descricaoAcao: 'Login realizado com sucesso',
    ipOrigem: req.ip
  });

  res.status(200).json({
    message: 'Login realizado com sucesso.',
    token,
    user: {
      id: usuario._id,
      nome: usuario.nome,
      email: usuario.email,
      perfis: usuario.perfis
    }
  });
});
