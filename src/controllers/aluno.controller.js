const Aluno = require('../models/Aluno');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { registrarAuditoria } = require('../services/audit.service');

exports.listar = asyncHandler(async (req, res) => {
  const alunos = await Aluno.find().populate('cursos.cursoId').sort({ nome: 1 });
  res.json({ data: alunos });
});

exports.criar = asyncHandler(async (req, res) => {
  const aluno = await Aluno.create(req.body);

  await registrarAuditoria({
    usuarioId: req.user._id,
    tabelaAfetada: 'alunos',
    acao: 'INSERT',
    idRegistroAfetado: String(aluno._id),
    descricaoAcao: 'Criação de aluno',
    ipOrigem: req.ip
  });

  res.status(201).json({ message: 'Aluno criado com sucesso.', data: aluno });
});

exports.buscarPorId = asyncHandler(async (req, res) => {
  const aluno = await Aluno.findById(req.params.id).populate('cursos.cursoId');
  if (!aluno) throw new AppError('Aluno não encontrado.', 404);
  res.json({ data: aluno });
});
