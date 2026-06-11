const Atividade = require('../models/Atividade');
const Aluno = require('../models/Aluno');
const Curso = require('../models/Curso');
const Usuario = require('../models/Usuario');
const CategoriaAtividade = require('../models/CategoriaAtividade');
const RegraCargaHoraria = require('../models/RegraCargaHoraria');
const { registrarAuditoria } = require('../services/audit.service');
const { uploadArquivos } = require('../services/storage.service');
const { enviarEmail } = require('../services/email.service');

function coordenadorRestrito(req) {
  const perfis = req.user?.perfis || [];
  return perfis.includes('coordenador') && !perfis.includes('administrador');
}

function cursosCoordenadosIds(req) {
  return (req.user?.cursosCoordenados || [])
    .map((item) => String(item.cursoId))
    .filter(Boolean);
}

function cursoPermitidoParaCoordenador(req, cursoId) {
  if (!coordenadorRestrito(req)) return true;
  return cursosCoordenadosIds(req).includes(String(cursoId));
}

function normalizarMimeType(mimeType) {
  const permitidos = ['application/pdf', 'image/jpeg', 'image/png'];
  return permitidos.includes(mimeType) ? mimeType : null;
}

async function montarAnexosDoUpload(files = [], contexto = {}) {
  const uploads = await uploadArquivos(files, {
    folderParts: ['atividades', contexto.alunoId, contexto.cursoId]
  });

  return files.map((file, index) => ({
    nomeArquivo: file.originalname,
    urlArquivo: uploads[index].url,
    tipoArquivo: normalizarMimeType(file.mimetype),
    tamanhoBytes: uploads[index].bytes || file.size,
    storageProvider: uploads[index].provider,
    storageKey: uploads[index].storageKey,
    resourceType: uploads[index].resourceType
  }));
}

function montarAnexosDoBody(anexos = []) {
  return anexos.map((anexo) => ({
    nomeArquivo: anexo.nomeArquivo,
    urlArquivo: anexo.urlArquivo,
    tipoArquivo: normalizarMimeType(anexo.tipoArquivo),
    tamanhoBytes: anexo.tamanhoBytes
  }));
}

function validarTiposAnexos(anexos = []) {
  return anexos.some((anexo) => !anexo.tipoArquivo);
}

async function validarReferencias({ alunoId, cursoId, categoriaId }) {
  const [aluno, curso, categoria] = await Promise.all([
    Aluno.findById(alunoId),
    Curso.findById(cursoId),
    CategoriaAtividade.findById(categoriaId)
  ]);

  if (!aluno) return { ok: false, status: 404, message: 'Aluno não encontrado.' };
  if (!curso) return { ok: false, status: 404, message: 'Curso não encontrado.' };
  if (!categoria) return { ok: false, status: 404, message: 'Categoria não encontrada.' };

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

async function buscarEmailsCoordenadores(cursoId) {
  const coordenadores = await Usuario.find({
    'cursosCoordenados.cursoId': cursoId,
    ativo: true
  }).select('email');

  return coordenadores.map((c) => c.email).filter(Boolean);
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

    if (!cursoPermitidoParaCoordenador(req, cursoId)) {
      return res.status(403).json({ message: 'Coordenador não pode criar atividade fora dos cursos que coordena.' });
    }

    const validacao = await validarReferencias({ alunoId, cursoId, categoriaId });

    if (!validacao.ok) {
      return res.status(validacao.status).json({ message: validacao.message });
    }

    let anexosNormalizados = [];

    if (req.files && req.files.length > 0) {
      anexosNormalizados = await montarAnexosDoUpload(req.files, { alunoId, cursoId });
    } else if (Array.isArray(anexos)) {
      anexosNormalizados = montarAnexosDoBody(anexos);
    }

    if (validarTiposAnexos(anexosNormalizados)) {
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

    try {
      const emailsCoordenadores = await buscarEmailsCoordenadores(cursoId);

      if (emailsCoordenadores.length > 0) {
        await enviarEmail({
          to: emailsCoordenadores.join(','),
          subject: `Nova atividade submetida - ${validacao.curso.nome}`,
          text: `Uma nova atividade complementar foi submetida e aguarda análise.

Aluno: ${validacao.aluno.nome}
Curso: ${validacao.curso.nome}
Título: ${titulo}
Carga horária informada: ${cargaHorariaInformada} horas

Acesse o sistema para aprovar ou reprovar a atividade.

Atenciosamente,
Sistema Acadêmico`
        });
      }
    } catch (emailError) {
      console.error('[EMAIL] Falha ao notificar coordenadores sobre nova atividade:', emailError.message);
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

    if (coordenadorRestrito(req)) {
      const permitidos = cursosCoordenadosIds(req);

      if (req.query.cursoId && !permitidos.includes(String(req.query.cursoId))) {
        return res.status(200).json([]);
      }

      filtro.cursoId = req.query.cursoId || { $in: permitidos };
    }

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

    if (!cursoPermitidoParaCoordenador(req, atividade.cursoId?._id || atividade.cursoId)) {
      return res.status(403).json({ message: 'Acesso negado à atividade informada.' });
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

    if (!cursoPermitidoParaCoordenador(req, atividadeAnterior.cursoId)) {
      return res.status(403).json({ message: 'Coordenador não pode alterar atividade fora dos cursos que coordena.' });
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
      if (req.body[campo] !== undefined) {
        payload[campo] = req.body[campo];
      }
    });

    if (req.files && req.files.length > 0) {
      payload.anexos = await montarAnexosDoUpload(req.files, { alunoId: atividadeAnterior.alunoId, cursoId: atividadeAnterior.cursoId });
    } else if (Array.isArray(payload.anexos)) {
      payload.anexos = montarAnexosDoBody(payload.anexos);
    }

    if (payload.anexos && validarTiposAnexos(payload.anexos)) {
      return res.status(422).json({
        message: 'Erro de validação.',
        errors: ['Os tipos de arquivo permitidos são PDF, JPG/JPEG e PNG.']
      });
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

    if (!cursoPermitidoParaCoordenador(req, atividade.cursoId)) {
      return res.status(403).json({ message: 'Coordenador não pode remover atividade fora dos cursos que coordena.' });
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
    const {
      status,
      justificativaReprovacao,
      observacaoCoordenador,
      cargaHorariaValidada
    } = req.body;

    const atividade = await Atividade.findById(req.params.id);

    if (!atividade) {
      return res.status(404).json({ message: 'Atividade não encontrada.' });
    }

    if (!cursoPermitidoParaCoordenador(req, atividade.cursoId)) {
      return res.status(403).json({ message: 'Coordenador não pode validar atividade fora dos cursos que coordena.' });
    }

    const statusPermitidos = ['Em análise', 'Aprovada', 'Reprovada'];

    if (!statusPermitidos.includes(status)) {
      return res.status(422).json({ message: 'Status inválido para atualização.' });
    }

    if (status === 'Reprovada' && !justificativaReprovacao) {
      return res.status(422).json({
        message: 'A justificativa de reprovação é obrigatória.'
      });
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
      decisao: status === 'Aprovada'
        ? 'Aprovação'
        : status === 'Reprovada'
          ? 'Reprovação'
          : 'Atualização',
      justificativa: status === 'Reprovada'
        ? justificativaReprovacao
        : observacaoCoordenador,
      cargaHorariaValidada: atividade.cargaHorariaValidada
    });

    await atividade.save();

    const isSuperAdmin = (req.user?.perfis || []).includes('superAdmin');
    const aluno = await Aluno.findById(atividade.alunoId);

    function montarMensagemAluno(nomeAluno) {
      if (status === 'Aprovada') {
        return `Olá ${nomeAluno},\n\nSua atividade "${atividade.titulo}" foi aprovada.\n\nCarga horária validada: ${atividade.cargaHorariaValidada} horas.\n\nAtenciosamente,\nSistema Acadêmico`;
      }
      if (status === 'Reprovada') {
        return `Olá ${nomeAluno},\n\nSua atividade "${atividade.titulo}" foi reprovada.\n\nJustificativa:\n${justificativaReprovacao}\n\nAtenciosamente,\nSistema Acadêmico`;
      }
      return `Olá ${nomeAluno},\n\nSua atividade "${atividade.titulo}" está em análise.\n\nAtenciosamente,\nSistema Acadêmico`;
    }

    function montarMensagemCoordenador(nomeCurso, nomeAluno) {
      const labelStatus = status === 'Aprovada'
        ? 'aprovada'
        : status === 'Reprovada'
          ? 'reprovada'
          : 'colocada em análise';

      const linhaJustificativa = status === 'Reprovada'
        ? `\nJustificativa: ${justificativaReprovacao}`
        : '';

      const linhaCarga = status === 'Aprovada'
        ? `\nCarga horária validada: ${atividade.cargaHorariaValidada} horas.`
        : '';

      return `Informamos que a atividade complementar abaixo foi ${labelStatus} pelo Administrador do sistema.\n\nAluno: ${nomeAluno}\nCurso: ${nomeCurso}\nTítulo: ${atividade.titulo}${linhaCarga}${linhaJustificativa}\n\nAtenciosamente,\nSistema Acadêmico`;
    }

    const emailPromises = [];

    if (aluno?.email) {
      emailPromises.push(
        enviarEmail({
          to: aluno.email,
          subject: `Atualização da atividade - ${status}`,
          text: montarMensagemAluno(aluno.nome)
        }).catch((err) => {
          console.error('[EMAIL] Falha ao notificar aluno sobre atualização de status:', err.message);
        })
      );
    }

    if (isSuperAdmin) {
      const curso = await Curso.findById(atividade.cursoId);
      const emailsCoordenadores = await buscarEmailsCoordenadores(atividade.cursoId);

      if (emailsCoordenadores.length > 0) {
        emailPromises.push(
          enviarEmail({
            to: emailsCoordenadores.join(','),
            subject: `Atividade ${status} pelo Administrador - ${curso?.nome ?? ''}`,
            text: montarMensagemCoordenador(curso?.nome ?? 'N/A', aluno?.nome ?? 'N/A')
          }).catch((err) => {
            console.error('[EMAIL] Falha ao notificar coordenadores sobre atualização pelo superAdmin:', err.message);
          })
        );
      }
    }

    await Promise.all(emailPromises);

    if (req.user?._id) {
      await registrarAuditoria({
        usuarioId: req.user._id,
        acao: status === 'Aprovada'
          ? 'APROVACAO'
          : status === 'Reprovada'
            ? 'REPROVACAO'
            : 'ATUALIZACAO',
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