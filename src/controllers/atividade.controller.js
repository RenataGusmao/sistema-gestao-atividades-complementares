const path = require('path');
const Atividade = require('../models/Atividade');
const Aluno = require('../models/Aluno');
const Curso = require('../models/Curso');
const CategoriaAtividade = require('../models/CategoriaAtividade');
const StatusAtividade = require('../models/StatusAtividade');
const RegraCargaHoraria = require('../models/RegraCargaHoraria');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { registrarAuditoria } = require('../services/audit.service');

async function validarReferencias({ alunoId, cursoId, categoriaId, statusId }) {
  const [aluno, curso, categoria, status] = await Promise.all([
    Aluno.findById(alunoId),
    Curso.findById(cursoId),
    CategoriaAtividade.findById(categoriaId),
    StatusAtividade.findById(statusId)
  ]);

  if (!aluno) throw new AppError('Aluno não encontrado.', 404);
  if (!curso) throw new AppError('Curso não encontrado.', 404);
  if (!categoria) throw new AppError('Categoria não encontrada.', 404);
  if (!status) throw new AppError('Status não encontrado.', 404);

  return { aluno, curso, categoria, status };
}

exports.listar = asyncHandler(async (req, res) => {
  const filtros = {};
  if (req.query.alunoId) filtros.alunoId = req.query.alunoId;
  if (req.query.cursoId) filtros.cursoId = req.query.cursoId;
  if (req.query.statusId) filtros.statusId = req.query.statusId;

  const atividades = await Atividade.find(filtros)
    .populate('alunoId cursoId categoriaId statusId coordenadorAvaliadorId historicoStatus.statusAnteriorId historicoStatus.statusNovoId historicoStatus.usuarioResponsavelId')
    .sort({ dataSubmissao: -1 });

  res.json({ data: atividades });
});

exports.criar = asyncHandler(async (req, res) => {
  const payload = req.body;
  await validarReferencias(payload);

  const regra = await RegraCargaHoraria.findOne({ cursoId: payload.cursoId, categoriaId: payload.categoriaId, ativa: true });
  if (regra && Number(payload.cargaHorariaInformada) > Number(regra.cargaHorariaMaxima)) {
    throw new AppError('Carga horária informada ultrapassa a máxima configurada para o curso/categoria.', 422);
  }

  const anexos = (req.files || []).map((file) => ({
    nomeArquivo: file.originalname,
    caminhoArquivo: `/uploads/${file.filename}`,
    tipoArquivo: path.extname(file.originalname).replace('.', '').toLowerCase(),
    tamanhoBytes: file.size
  }));

  const atividade = await Atividade.create({
    ...payload,
    anexos,
    historicoStatus: [{
      statusAnteriorId: null,
      statusNovoId: payload.statusId,
      usuarioResponsavelId: req.user?._id || null,
      observacao: 'Submissão inicial da atividade.'
    }]
  });

  await registrarAuditoria({
    usuarioId: req.user?._id || null,
    tabelaAfetada: 'atividades',
    acao: 'INSERT',
    idRegistroAfetado: String(atividade._id),
    descricaoAcao: 'Criação de atividade complementar',
    ipOrigem: req.ip
  });

  res.status(201).json({ message: 'Atividade criada com sucesso.', data: atividade });
});

exports.atualizarStatus = asyncHandler(async (req, res) => {
  const { statusId, observacaoCoordenador, justificativaReprovacao, cargaHorariaValidada } = req.body;
  const atividade = await Atividade.findById(req.params.id);
  if (!atividade) throw new AppError('Atividade não encontrada.', 404);

  const novoStatus = await StatusAtividade.findById(statusId);
  if (!novoStatus) throw new AppError('Status informado não existe.', 404);

  const statusAnterior = atividade.statusId;
  atividade.statusId = statusId;
  atividade.observacaoCoordenador = observacaoCoordenador ?? atividade.observacaoCoordenador;
  atividade.justificativaReprovacao = justificativaReprovacao ?? atividade.justificativaReprovacao;
  atividade.cargaHorariaValidada = cargaHorariaValidada ?? atividade.cargaHorariaValidada;
  atividade.coordenadorAvaliadorId = req.user._id;
  atividade.historicoStatus.push({
    statusAnteriorId: statusAnterior,
    statusNovoId: statusId,
    usuarioResponsavelId: req.user._id,
    observacao: observacaoCoordenador || null
  });

  await atividade.save();

  const acaoAuditoria = novoStatus.nomeStatus.toLowerCase().includes('reprov') ? 'REPROVACAO' :
    novoStatus.nomeStatus.toLowerCase().includes('aprov') ? 'APROVACAO' : 'UPDATE';

  await registrarAuditoria({
    usuarioId: req.user._id,
    tabelaAfetada: 'atividades',
    acao: acaoAuditoria,
    idRegistroAfetado: String(atividade._id),
    descricaoAcao: `Alteração de status para ${novoStatus.nomeStatus}`,
    ipOrigem: req.ip
  });

  res.json({ message: 'Status da atividade atualizado com sucesso.', data: atividade });
});
