const Usuario = require('../models/Usuario');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { registrarAuditoria } = require('../services/audit.service');


function formatarCursosCoordenados(cursosCoordenados = []) {
  if (!Array.isArray(cursosCoordenados)) return [];

  return cursosCoordenados
    .filter(Boolean)
    .map((curso) => {
      if (typeof curso === 'object' && curso.cursoId) {
        return { cursoId: curso.cursoId };
      }

      return { cursoId: curso };
    });
}

function gerarCodigoUsuario(email) {
  return email
    .split('@')[0]
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();
}

exports.listar = asyncHandler(async (req, res) => {
  const usuarios = await Usuario.find()
    .select('-senhaHash')
    .populate('cursosCoordenados.cursoId')
    .sort({ nome: 1 });

  res.json({ data: usuarios });
});

exports.buscarPorId = asyncHandler(async (req, res) => {
  const usuario = await Usuario.findById(req.params.id)
    .select('-senhaHash')
    .populate('cursosCoordenados.cursoId');

  if (!usuario) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  res.json({ data: usuario });
});

exports.criar = asyncHandler(async (req, res) => {
  const {
    codigoUsuario,
    nome,
    email,
    senhaHash,
    perfis,
    ativo,
    cursosCoordenados
  } = req.body;

  const codigoFinal = codigoUsuario || gerarCodigoUsuario(email);
  const senhaInicial = senhaHash || codigoFinal;

  if (!nome || !email || !codigoFinal) {
    throw new AppError('Nome, e-mail e código/matrícula são obrigatórios.', 400);
  }

  const usuarioExistente = await Usuario.findOne({ codigoUsuario: codigoFinal });

  if (usuarioExistente) {
    throw new AppError('Já existe um usuário cadastrado com esta matrícula.', 409);
  }

  const usuario = await Usuario.create({
    codigoUsuario: codigoFinal,
    nome,
    email,
    senhaHash: senhaInicial,
    perfis: Array.isArray(perfis) && perfis.length ? perfis : ['coordenador'],
    ativo: ativo !== undefined ? ativo : true,
    cursosCoordenados: formatarCursosCoordenados(cursosCoordenados)
  });

  await registrarAuditoria({
    usuarioId: req.user._id,
    acao: 'CRIACAO',
    entidade: 'Usuario',
    registroId: usuario._id,
    descricao: 'Usuário/coordenador criado.',
    dadosNovos: usuario,
    ipOrigem: req.ip,
    userAgent: req.get('User-Agent') || null
  });

  const usuarioSemSenha = usuario.toObject();
  delete usuarioSemSenha.senhaHash;

  res.status(201).json({
    message: 'Usuário criado com sucesso.',
    data: usuarioSemSenha
  });
});

exports.atualizar = asyncHandler(async (req, res) => {
  const {
    codigoUsuario,
    nome,
    email,
    senhaHash,
    perfis,
    ativo,
    cursosCoordenados
  } = req.body;

  const usuarioAnterior = await Usuario.findById(req.params.id).select('+senhaHash');

  if (!usuarioAnterior) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  if (email !== undefined) usuarioAnterior.email = email;

  if (codigoUsuario !== undefined) usuarioAnterior.codigoUsuario = codigoUsuario;
  if (nome !== undefined) usuarioAnterior.nome = nome;
  if (senhaHash !== undefined && senhaHash !== '') usuarioAnterior.senhaHash = senhaHash;
  if (Array.isArray(perfis)) usuarioAnterior.perfis = perfis;
  if (ativo !== undefined) usuarioAnterior.ativo = ativo;

  if (Array.isArray(cursosCoordenados)) {
    usuarioAnterior.cursosCoordenados = formatarCursosCoordenados(cursosCoordenados);
  }

  await usuarioAnterior.save();

  await registrarAuditoria({
    usuarioId: req.user._id,
    acao: 'ATUALIZACAO',
    entidade: 'Usuario',
    registroId: usuarioAnterior._id,
    descricao: 'Usuário atualizado.',
    dadosNovos: usuarioAnterior,
    ipOrigem: req.ip,
    userAgent: req.get('User-Agent') || null
  });

  const usuarioSemSenha = usuarioAnterior.toObject();
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
    acao: 'EXCLUSAO',
    entidade: 'Usuario',
    registroId: usuario._id,
    descricao: 'Usuário/coordenador removido.',
    dadosAnteriores: usuario,
    ipOrigem: req.ip,
    userAgent: req.get('User-Agent') || null
  });

  res.json({
    message: 'Usuário removido com sucesso.'
  });
});

