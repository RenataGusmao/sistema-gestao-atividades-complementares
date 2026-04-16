const Atividade = require('../models/Atividade');
const Aluno = require('../models/Aluno');
const Curso = require('../models/Curso');
const CategoriaAtividade = require('../models/CategoriaAtividade');
const RegraCargaHoraria = require('../models/RegraCargaHoraria');
const { registrarAuditoria } = require('../services/audit.service');

function normalizarMimeType(mimeType) {
  const permitidos = ['application/pdf', 'image/jpeg', 'image/png'];
  return permitidos.includes(mimeType) ? mimeType : null;
}

async function validarReferencias({ alunoId, cursoId, categoriaId }) {
  const [aluno, curso, categoria] = await Promise.all([
    Aluno.findById(alunoId),
    Curso.findById(cursoId),
    CategoriaAtividade.findById(categoriaId)
  ]);

  if (!aluno) {
    return { ok: false, status: 404, message: 'Aluno não encontrado.' };
  }

  if (!curso) {
    return { ok: false, status: 404, message: 'Curso não encontrado.' };
  }

  if (!categoria) {
    return { ok: false, status: 404, message: 'Categoria não encontrada.' };
  }

  const alunoVinculadoAoCurso = Array.isArray(aluno.cursos)
    && aluno.cursos.some((item) => String(item.cursoId) === String(cursoId));

  if (!alunoVinculadoAoCurso) {
    return { ok: false, status: 422, message: 'O aluno não está vinculado ao curso informado.' };
  }

  if (!aluno.matriculaAtiva) {
    return { ok: false, status: 422, message: 'O aluno não possui matrícula ativa.' };
  }

  return { ok: true, aluno, curso, categoria };
}

async function criar(req, res) {
  try {
    const {
      alunoId,
      cursoId,
      categoriaId,
      titulo,
      descricao,
      dataRealizacao,
      cargaHorariaInformada,
      anexos
    } = req.body;

    const validacao = await validarReferencias({ alunoId, cursoId, categoriaId });

    if (!validacao.ok) {
      return res.status(validacao.status).json({ message: validacao.message });
    }

    const anexosNormalizados = Array.isArray(anexos) ? anexos.map((anexo) => ({
      nomeArquivo: anexo.nomeArquivo,
      urlArquivo: anexo.urlArquivo,
      tipoArquivo: normalizarMimeType(anexo.tipoArquivo),
      tamanhoBytes: anexo.tamanhoBytes
    })) : [];

    if (anexosNormalizados.some((anexo) => !anexo.tipoArquivo)) {
      return res.status(422).json({
        message: 'Erro de validação.',
        errors: ['Os tipos de arquivo permitidos são PDF, JPG/JPEG e PNG.']
      });
    }

    const atividade = await Atividade.create({
      alunoId,
      cursoId,
      categoriaId,
      titulo,
      descricao,
      dataRealizacao,
      cargaHorariaInformada,
      anexos: anexosNormalizados,
      status: 'Enviada',
      historicoValidacoes: []
    });

    if (req.user?._id) {
      await registrarAuditoria({
        usuarioId: req.user._id,
        acao: 'CRIACAO',
        entidade: 'Atividade',
        registroId: atividade._id,
        descricao: 'Atividade criada no sistema.',
        dadosNovos: atividade,
        ipOrigem: req.ip,
        userAgent: req.get('User-Agent') || null
      });
    }

    return res.status(201).json(atividade);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Registro duplicado.',
        fields: error.keyValue || {}
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(422).json({
        message: 'Erro de validação.',
        errors
      });
    }

    console.error(error);
    return res.status(500).json({ message: 'Erro ao criar atividade.' });
  }
}

async function listar(req, res) {
  try {
    const filtro = {};

    if (req.query.cursoId) filtro.cursoId = req.query.cursoId;
    if (req.query.alunoId) filtro.alunoId = req.query.alunoId;
    if (req.query.status) filtro.status = req.query.status;
    if (req.query.categoriaId) filtro.categoriaId = req.query.categoriaId;

    const atividades = await Atividade.find(filtro)
      .populate('alunoId')
      .populate('cursoId')
      .populate('categoriaId')
      .populate('coordenadorResponsavelId')
      .populate('historicoValidacoes.usuarioId')
      .sort({ dataCriacao: -1 });

    return res.status(200).json(atividades);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao listar atividades.' });
  }
}

async function buscarPorId(req, res) {
  try {
    const atividade = await Atividade.findById(req.params.id)
      .populate('alunoId')
      .populate('cursoId')
      .populate('categoriaId')
      .populate('coordenadorResponsavelId')
      .populate('historicoValidacoes.usuarioId');

    if (!atividade) {
      return res.status(404).json({ message: 'Atividade não encontrada.' });
    }

    return res.status(200).json(atividade);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao buscar atividade.' });
  }
}

async function atualizar(req, res) {
  try {
    const atividadeAnterior = await Atividade.findById(req.params.id);

    if (!atividadeAnterior) {
      return res.status(404).json({ message: 'Atividade não encontrada.' });
    }

    if (atividadeAnterior.status !== 'Enviada') {
      return res.status(422).json({
        message: 'A atividade só pode ser editada enquanto estiver com status Enviada.'
      });
    }

    const camposPermitidos = [
      'titulo',
      'descricao',
      'dataRealizacao',
      'cargaHorariaInformada',
      'anexos',
      'categoriaId'
    ];

    const payload = {};
    camposPermitidos.forEach((campo) => {
      if (req.body[campo] !== undefined) payload[campo] = req.body[campo];
    });

    if (Array.isArray(payload.anexos)) {
      payload.anexos = payload.anexos.map((anexo) => ({
        nomeArquivo: anexo.nomeArquivo,
        urlArquivo: anexo.urlArquivo,
        tipoArquivo: normalizarMimeType(anexo.tipoArquivo),
        tamanhoBytes: anexo.tamanhoBytes
      }));

      if (payload.anexos.some((anexo) => !anexo.tipoArquivo)) {
        return res.status(422).json({
          message: 'Erro de validação.',
          errors: ['Os tipos de arquivo permitidos são PDF, JPG/JPEG e PNG.']
        });
      }
    }

    const atividadeAtualizada = await Atividade.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );

    if (req.user?._id) {
      await registrarAuditoria({
        usuarioId: req.user._id,
        acao: 'ATUALIZACAO',
        entidade: 'Atividade',
        registroId: atividadeAtualizada._id,
        descricao: 'Atividade atualizada no sistema.',
        dadosAnteriores: atividadeAnterior,
        dadosNovos: atividadeAtualizada,
        ipOrigem: req.ip,
        userAgent: req.get('User-Agent') || null
      });
    }

    return res.status(200).json(atividadeAtualizada);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(422).json({
        message: 'Erro de validação.',
        errors
      });
    }

    console.error(error);
    return res.status(500).json({ message: 'Erro ao atualizar atividade.' });
  }
}

async function remover(req, res) {
  try {
    const atividade = await Atividade.findById(req.params.id);

    if (!atividade) {
      return res.status(404).json({ message: 'Atividade não encontrada.' });
    }

    if (atividade.status !== 'Enviada') {
      return res.status(422).json({
        message: 'A atividade só pode ser excluída enquanto estiver com status Enviada.'
      });
    }

    await Atividade.findByIdAndDelete(req.params.id);

    if (req.user?._id) {
      await registrarAuditoria({
        usuarioId: req.user._id,
        acao: 'EXCLUSAO',
        entidade: 'Atividade',
        registroId: atividade._id,
        descricao: 'Atividade removida do sistema.',
        dadosAnteriores: atividade,
        ipOrigem: req.ip,
        userAgent: req.get('User-Agent') || null
      });
    }

    return res.status(200).json({ message: 'Atividade removida com sucesso.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao remover atividade.' });
  }
}

async function atualizarStatus(req, res) {
  try {
    const { status, justificativaReprovacao, observacaoCoordenador, cargaHorariaValidada } = req.body;

    const atividade = await Atividade.findById(req.params.id);

    if (!atividade) {
      return res.status(404).json({ message: 'Atividade não encontrada.' });
    }

    const statusPermitidos = ['Em análise', 'Aprovada', 'Reprovada'];

    if (!statusPermitidos.includes(status)) {
      return res.status(422).json({ message: 'Status inválido para atualização.' });
    }

    const regra = await RegraCargaHoraria.findOne({
      cursoId: atividade.cursoId,
      categoriaId: atividade.categoriaId,
      ativa: true
    });

    let cargaValidadaFinal = atividade.cargaHorariaValidada;

    if (cargaHorariaValidada !== undefined) {
      cargaValidadaFinal = cargaHorariaValidada;
    }

    if (status === 'Aprovada' && regra) {
      cargaValidadaFinal = Math.min(
        Number(cargaValidadaFinal || 0),
        Number(atividade.cargaHorariaInformada || 0),
        Number(regra.cargaHorariaMaximaCategoria || 0)
      );
    }

    if (status === 'Reprovada' && !justificativaReprovacao) {
      return res.status(422).json({
        message: 'A justificativa de reprovação é obrigatória.'
      });
    }

    const statusAnterior = atividade.status;

    atividade.status = status;
    atividade.coordenadorResponsavelId = req.user?._id || null;
    atividade.observacaoCoordenador = observacaoCoordenador ?? atividade.observacaoCoordenador;
    atividade.cargaHorariaValidada = status === 'Aprovada' ? cargaValidadaFinal : 0;
    atividade.justificativaReprovacao = status === 'Reprovada'
      ? justificativaReprovacao
      : undefined;

    atividade.historicoValidacoes.push({
      statusAnterior,
      statusNovo: status,
      usuarioId: req.user?._id,
      decisao: status === 'Aprovada' ? 'Aprovação' : status === 'Reprovada' ? 'Reprovação' : 'Atualização',
      justificativa: status === 'Reprovada' ? justificativaReprovacao : observacaoCoordenador,
      cargaHorariaValidada: atividade.cargaHorariaValidada
    });

    await atividade.save();

    if (req.user?._id) {
      await registrarAuditoria({
        usuarioId: req.user._id,
        acao: status === 'Aprovada' ? 'APROVACAO' : status === 'Reprovada' ? 'REPROVACAO' : 'ATUALIZACAO',
        entidade: 'Atividade',
        registroId: atividade._id,
        descricao: `Status da atividade atualizado para ${status}.`,
        dadosNovos: atividade,
        ipOrigem: req.ip,
        userAgent: req.get('User-Agent') || null
      });
    }

    return res.status(200).json(atividade);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(422).json({
        message: 'Erro de validação.',
        errors
      });
    }

    console.error(error);
    return res.status(500).json({ message: 'Erro ao atualizar status da atividade.' });
  }
}

module.exports = {
  criar,
  listar,
  buscarPorId,
  atualizar,
  remover,
  atualizarStatus
};