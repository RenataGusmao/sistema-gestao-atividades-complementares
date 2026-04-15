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
  if (!usuario) throw new AppError('Usuário não encontrado.', 404);
  res.json({ data: usuario });
});

exports.atualizar = asyncHandler(async (req, res) => {
  const { nome, perfis, ativo, cursosCoordenados } = req.body;
  const usuario = await Usuario.findById(req.params.id).select('+senhaHash');
  if (!usuario) throw new AppError('Usuário não encontrado.', 404);

  if (nome !== undefined) usuario.nome = nome;
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

  res.json({ message: 'Usuário atualizado com sucesso.', data: usuario.toObject() });
});
