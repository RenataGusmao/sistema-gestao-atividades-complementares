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

  if (!nome || !email || !senhaHash) {
    throw new AppError('Nome, e-mail e senha são obrigatórios.', 400);
  }

  const usuarioExistente = await Usuario.findOne({ email });

  if (usuarioExistente) {
    throw new AppError('Já existe um usuário cadastrado com este e-mail.', 409);
  }

  const usuario = await Usuario.create({
    codigoUsuario: codigoUsuario || gerarCodigoUsuario(email),
    nome,
    email,
    senhaHash,
    perfis: Array.isArray(perfis) && perfis.length ? perfis : ['coordenador'],
    ativo: ativo !== undefined ? ativo : true,
    cursosCoordenados: formatarCursosCoordenados(cursosCoordenados)
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

  if (codigoUsuario !== undefined) usuario.codigoUsuario = codigoUsuario;
  if (nome !== undefined) usuario.nome = nome;
  if (senhaHash !== undefined && senhaHash !== '') usuario.senhaHash = senhaHash;
  if (Array.isArray(perfis)) usuario.perfis = perfis;
  if (ativo !== undefined) usuario.ativo = ativo;

  if (Array.isArray(cursosCoordenados)) {
    usuario.cursosCoordenados = formatarCursosCoordenados(cursosCoordenados);
  }

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