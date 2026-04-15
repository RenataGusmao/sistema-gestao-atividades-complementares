const Curso = require('../models/Curso');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { registrarAuditoria } = require('../services/audit.service');

exports.listar = asyncHandler(async (req, res) => {
  const cursos = await Curso.find().sort({ nomeCurso: 1 });
  res.json({ data: cursos });
});

exports.criar = asyncHandler(async (req, res) => {
  const curso = await Curso.create(req.body);

  await registrarAuditoria({
    usuarioId: req.user._id,
    tabelaAfetada: 'cursos',
    acao: 'INSERT',
    idRegistroAfetado: String(curso._id),
    descricaoAcao: 'Criação de curso',
    ipOrigem: req.ip
  });

  res.status(201).json({ message: 'Curso criado com sucesso.', data: curso });
});

exports.atualizar = asyncHandler(async (req, res) => {
  const curso = await Curso.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!curso) throw new AppError('Curso não encontrado.', 404);

  await registrarAuditoria({
    usuarioId: req.user._id,
    tabelaAfetada: 'cursos',
    acao: 'UPDATE',
    idRegistroAfetado: String(curso._id),
    descricaoAcao: 'Atualização de curso',
    ipOrigem: req.ip
  });

  res.json({ message: 'Curso atualizado com sucesso.', data: curso });
});
