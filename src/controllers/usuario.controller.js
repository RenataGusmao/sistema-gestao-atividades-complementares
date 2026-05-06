const Usuario = require('../models/Usuario');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { registrarAuditoria } = require('../services/audit.service');

exports.listar = asyncHandler(async (req, res) => {
  const usuarios = await Usuario.find().select('-senhaHash').sort({ nome: 1 });
  res.json({ data: usuarios });
});

exports.buscarPorId = asyncHandler(async (req, res) => {
  const usuario = await Usuario.findById(req.params.id).select('-senhaHash');

  if (!usuario) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  res.json({ data: usuario });
});

exports.criar = asyncHandler(async (req, res) => {
  const { nome, email, senha, perfis, ativo, cursosCoordenados } = req.body;

  if (!nome || !email || !senha) {
    throw new AppError('Nome, e-mail e senha são obrigatórios.', 400);
  }

  const usuarioExistente = await Usuario.findOne({ email });

  if (usuarioExistente) {
    throw new AppError('Já existe um usuário cadastrado com este e-mail.', 409);
  }

  const usuario = await Usuario.create({
    nome,
    email,
    senha,
    perfis: Array.isArray(perfis) && perfis.length ? perfis : ['coordenador'],
    ativo: ativo !== undefined ? ativo : true,
    cursosCoordenados: Array.isArray(cursosCoordenados) ? cursosCoordenados : []
  });

  await registrarAuditoria({
    usuarioId: req.user._id,
    tabelaAfetada: 'usuarios',
    acao: 'CREATE',
    idRegistroAfetado: String(usuario._id),
    descricaoAcao: 'Criação de usuário/coordenador',
    ipOrigem: req.ip
  });

  const usuarioSemSenha = usuario.toObject();
  delete usuarioSemSenha.senha;
  delete usuarioSemSenha.senhaHash;

  res.status(201).json({
    message: 'Usuário criado com sucesso.',
    data: usuarioSemSenha
  });
});

exports.atualizar = asyncHandler(async (req, res) => {
  const { nome, email, senha, perfis, ativo, cursosCoordenados } = req.body;

  const usuario = await Usuario.findById(req.params.id).select('+senhaHash');

  if (!usuario) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  if (email && email !== usuario.email) {
    const usuarioExistente = await Usuario.findOne({ email });

    if (usuarioExistente) {
      throw new AppError('Já existe um usuário cadastrado com este e-mail.', 409);
    }

    usuario.email = email;
  }

  if (nome !== undefined) usuario.nome = nome;
  if (senha !== undefined && senha !== '') usuario.senha = senha;
  if (Array.isArray(perfis)) usuario.perfis = perfis;
  if (ativo !== undefined) usuario.ativo = ativo;
  if (Array.isArray(cursosCoordenados)) usuario.cursosCoordenados = cursosCoordenados;

  await usuario.save();

  await registrarAuditoria({
    usuarioId: req.user._id,
    tabelaAfetada: 'usuarios',
    acao: 'UPDATE',
    idRegistroAfetado: String(usuario._id),
    descricaoAcao: 'Atualização de usuário',
    ipOrigem: req.ip
  });

  const usuarioSemSenha = usuario.toObject();
  delete usuarioSemSenha.senha;
  delete usuarioSemSenha.senhaHash;

  res.json({
    message: 'Usuário atualizado com sucesso.',
    data: usuarioSemSenha
  });
});

exports.remover = asyncHandler(async (req, res) => {
  const usuario = await Usuario.findById(req.params.id);

  if (!usuario) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  await Usuario.findByIdAndDelete(req.params.id);

  await registrarAuditoria({
    usuarioId: req.user._id,
    tabelaAfetada: 'usuarios',
    acao: 'DELETE',
    idRegistroAfetado: String(usuario._id),
    descricaoAcao: 'Remoção de usuário/coordenador',
    ipOrigem: req.ip
  });

  res.json({
    message: 'Usuário removido com sucesso.'
  });
});