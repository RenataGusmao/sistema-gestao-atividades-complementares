const Aluno = require('../models/Aluno');
const Atividade = require('../models/Atividade');
const Certificado = require('../models/Certificado');
const CategoriaAtividade = require('../models/CategoriaAtividade');
const Curso = require('../models/Curso');
const { registrarAuditoria } = require('../services/audit.service');
const { uploadArquivos } = require('../services/storage.service');
const { notificarResponsaveisNovaAtividade } = require('../services/notificacaoAtividade.service');

function coordenadorRestrito(req) {
  const perfis = req.user?.perfis || [];
  return perfis.includes('coordenador') && !perfis.includes('administrador');
}

function cursosCoordenadosIds(req) {
  return (req.user?.cursosCoordenados || [])
    .map((item) => String(item.cursoId))
    .filter(Boolean);
}

function cursosDoPayload(body = {}) {
  return (body.cursos || [])
    .map((item) => String(item.cursoId || item))
    .filter(Boolean);
}

function cursoIdValor(curso) {
  return curso?._id || curso?.id || curso;
}

function alunoPertenceAoCoordenador(aluno, idsPermitidos) {
  return (aluno?.cursos || []).some((item) => idsPermitidos.includes(String(item.cursoId)));
}

function payloadCursosPermitidos(req) {
  if (!coordenadorRestrito(req)) return true;

  const permitidos = cursosCoordenadosIds(req);
  const solicitados = cursosDoPayload(req.body);

  return solicitados.length > 0 && solicitados.every((id) => permitidos.includes(id));
}

async function criar(req, res) {
  try {
    if (!payloadCursosPermitidos(req)) {
      return res.status(403).json({ message: 'Coordenador não pode cadastrar aluno fora dos cursos que coordena.' });
    }

    const aluno = await Aluno.create(req.body);

    if (req.user?._id) {
      await registrarAuditoria({
        usuarioId: req.user._id,
        acao: 'CRIACAO',
        entidade: 'Aluno',
        registroId: aluno._id,
        descricao: 'Aluno cadastrado no sistema.',
        dadosNovos: aluno,
        ipOrigem: req.ip,
        userAgent: req.get('User-Ag ent') || null
      });
    }

    return res.status(201).json(aluno);
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
    return res.status(500).json({ message: 'Erro ao criar aluno.' });
  }
}

async function listar(req, res) {
  try {
    const filtro = {};

    if (coordenadorRestrito(req)) {
      filtro['cursos.cursoId'] = { $in: cursosCoordenadosIds(req) };
    }

    const alunos = await Aluno.find(filtro).populate('cursos.cursoId').sort({ nome: 1 });
    return res.status(200).json(alunos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao listar alunos.' });
  }
}

async function buscarPorId(req, res) {
  try {
    const aluno = await Aluno.findById(req.params.id).populate('cursos.cursoId');

    if (!aluno) {
      return res.status(404).json({ message: 'Aluno nÃ£o encontrado.' });
    }

    if (coordenadorRestrito(req) && !alunoPertenceAoCoordenador(aluno, cursosCoordenadosIds(req))) {
      return res.status(403).json({ message: 'Acesso negado ao aluno informado.' });
    }

    return res.status(200).json(aluno);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao buscar aluno.' });
  }
}

async function atualizar(req, res) {
  try {
    const alunoAnterior = await Aluno.findById(req.params.id);

    if (!alunoAnterior) {
      return res.status(404).json({ message: 'Aluno nÃ£o encontrado.' });
    }

    if (coordenadorRestrito(req)) {
      const permitidos = cursosCoordenadosIds(req);

      if (!alunoPertenceAoCoordenador(alunoAnterior, permitidos) || !payloadCursosPermitidos(req)) {
        return res.status(403).json({ message: 'Coordenador não pode alterar aluno fora dos cursos que coordena.' });
      }
    }

    const alunoAtualizado = await Aluno.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('cursos.cursoId');

    if (req.user?._id) {
      await registrarAuditoria({
        usuarioId: req.user._id,
        acao: 'ATUALIZACAO',
        entidade: 'Aluno',
        registroId: alunoAtualizado._id,
        descricao: 'Aluno atualizado no sistema.',
        dadosAnteriores: alunoAnterior,
        dadosNovos: alunoAtualizado,
        ipOrigem: req.ip,
        userAgent: req.get('User-Agent') || null
      });
    }

    return res.status(200).json(alunoAtualizado);
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
    return res.status(500).json({ message: 'Erro ao atualizar aluno.' });
  }
}

async function remover(req, res) {
  try {
    const aluno = await Aluno.findById(req.params.id);

    if (!aluno) {
      return res.status(404).json({ message: 'Aluno nÃ£o encontrado.' });
    }

    if (coordenadorRestrito(req) && !alunoPertenceAoCoordenador(aluno, cursosCoordenadosIds(req))) {
      return res.status(403).json({ message: 'Coordenador não pode remover aluno fora dos cursos que coordena.' });
    }

    await Aluno.findByIdAndDelete(req.params.id);

    if (req.user?._id) {
      await registrarAuditoria({
        usuarioId: req.user._id,
        acao: 'EXCLUSAO',
        entidade: 'Aluno',
        registroId: aluno._id,
        descricao: 'Aluno removido do sistema.',
        dadosAnteriores: aluno,
        ipOrigem: req.ip,
        userAgent: req.get('User-Agent') || null
      });
    }

    return res.status(200).json({ message: 'Aluno removido com sucesso.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao remover aluno.' });
  }
}

async function dashboard(req, res) {
  try {
    const aluno = req.aluno;

    return res.status(200).json({
      aluno: {
        id: aluno._id,
        nome: aluno.nome,     
        email: aluno.email,
        matricula: aluno.matricula,
        matriculaAtiva: aluno.matriculaAtiva,
        ultimoLogin: aluno.ultimoLogin,
        cursos: (aluno.cursos || []).map((item) => ({
          _id: cursoIdValor(item.cursoId),
          nome: item.cursoId?.nome,
          codigo: item.cursoId?.codigo
        }))
      }
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Erro ao carregar dashboard.'
    });
  } 
}

async function listarMinhasAtividades(req, res) {
  try {

    const filtro = {
      alunoId: req.aluno._id
    };

    if (req.query.cursoId) {

      const cursoPermitido = (req.aluno.cursos || [])
        .some((item) =>
          String(cursoIdValor(item.cursoId)) === String(req.query.cursoId)
        );

      if (!cursoPermitido) {
        return res.status(403).json({
          message: 'O aluno não está vinculado ao curso informado.'
        });
      }

      filtro.cursoId = req.query.cursoId;
    }

    const atividades = await Atividade.find(
      filtro,
      {
        titulo: 1,
        status: 1,
        cargaHorariaInformada: 1,
        cargaHorariaValidada: 1,
        justificativaReprovacao: 1,
        dataCriacao: 1,
        cursoId: 1,
        categoriaId: 1
      }
    )
      .populate('cursoId', 'nome codigo')
      .populate('categoriaId', 'nome areaParametro');

    return res.status(200).json(
      atividades.map((atividade) => ({
        _id: atividade._id,
        titulo: atividade.titulo,
        status: atividade.status,
        cargaHoraria:
          atividade.status === 'Aprovada'
            ? atividade.cargaHorariaValidada
            : atividade.cargaHorariaInformada,
        cargaHorariaInformada: atividade.cargaHorariaInformada,
        cargaHorariaValidada: atividade.cargaHorariaValidada,
        cursoId: atividade.cursoId,
        categoriaId: atividade.categoriaId,
        justificativaReprovacao: atividade.justificativaReprovacao,
        dataCriacao: atividade.dataCriacao
      }))
    );

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Erro ao listar atividades.'
    });
  }
}

async function listarCategoriasDisponiveis(req, res) {
  try {
    const cursoAlunoId = req.query.cursoId || cursoIdValor(req.aluno.cursos?.[0]?.cursoId);
    const cursos = (req.aluno.cursos || [])
      .map((item) => item.cursoId)
      .filter(Boolean);
    const cursoPermitido = cursos.some((curso) => String(cursoIdValor(curso)) === String(cursoAlunoId));

    if (!cursoAlunoId) {
      return res.status(422).json({
        message: 'Não foi possível identificar o curso do aluno.'
      });
    }

    if (!cursoPermitido) {
      return res.status(403).json({
        message: 'O aluno não está vinculado ao curso informado.'
      });
    }

    const categorias = await CategoriaAtividade
      .find({ curso: cursoAlunoId, ativa: true })
      .sort({ areaParametro: 1, nome: 1 });

    return res.status(200).json({
      cursoId: cursoAlunoId,
      cursos: cursos.map((curso) => ({
        _id: cursoIdValor(curso),
        id: cursoIdValor(curso),
        nome: curso.nome || 'Curso',
        codigo: curso.codigo || ''
      })),
      categorias
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Erro ao listar categorias disponíveis.'
    });
  }
}
async function submeterAtividade(req, res) {
  try {
    const {
      cursoId,
      categoriaId,
      titulo,
      descricao,
      dataRealizacao,
      cargaHorariaInformada,
      cargaHoraria
    } = req.body;

    const arquivos = Array.isArray(req.files)
      ? req.files
      : [
          ...(req.files?.anexos || []),
          ...(req.files?.certificado || [])
        ];

    if (!arquivos || arquivos.length === 0) {
      return res.status(422).json({
        message: 'É obrigatório anexar ao menos um certificado.'
      });
    }

    const cursoAlunoId = cursoId || cursoIdValor(req.aluno.cursos?.[0]?.cursoId);
    const cursoPermitido = (req.aluno.cursos || [])
      .some((item) => String(cursoIdValor(item.cursoId)) === String(cursoAlunoId));

    if (!cursoPermitido) {
      return res.status(403).json({
        message: 'O aluno não está vinculado ao curso informado.'
      });
    }

    const categoria = categoriaId
      ? await CategoriaAtividade.findById(categoriaId)
      : await CategoriaAtividade.findOne({ curso: cursoAlunoId, ativa: true }).sort({ nome: 1 });

    if (!cursoAlunoId || !categoria) {
      return res.status(422).json({
        message: 'Não foi possível identificar curso/categoria para a atividade.'
      });
    }

    const uploads = await uploadArquivos(arquivos, {
      folderParts: ['alunos', req.aluno._id, cursoAlunoId]
    });

    const anexos = arquivos.map((file, index) => ({
      nomeArquivo: file.originalname,
      urlArquivo: uploads[index].url,
      tipoArquivo: file.mimetype,
      tamanhoBytes: uploads[index].bytes || file.size,
      storageProvider: uploads[index].provider,
      storageKey: uploads[index].storageKey,
      resourceType: uploads[index].resourceType
    }));

    const atividade = await Atividade.create({
      alunoId: req.aluno._id,
      cursoId: cursoAlunoId,
      categoriaId: categoria._id,
      titulo,
      descricao: descricao || titulo,
      dataRealizacao: dataRealizacao || new Date(),
      cargaHorariaInformada: cargaHorariaInformada || cargaHoraria,
      anexos,
      status: 'Enviada'
    });

    for (const anexo of anexos) {
      await Certificado.create({
        aluno: req.aluno._id,
        nomeArquivo: anexo.nomeArquivo,
        caminho: anexo.urlArquivo,
        tipoArquivo: anexo.tipoArquivo,
        tamanhoBytes: anexo.tamanhoBytes,
        storageProvider: anexo.storageProvider,
        storageKey: anexo.storageKey,
        resourceType: anexo.resourceType
      });
    }

    if (String(categoria.curso) !== String(cursoAlunoId)) {
      return res.status(422).json({
        message: 'A categoria selecionada não pertence ao curso informado.'
      });
    }

    const curso = await Curso.findById(cursoAlunoId).select('nome');

    notificarResponsaveisNovaAtividade({
      aluno: req.aluno,
      curso,
      atividade
    }).catch((emailError) => {
      console.error('[EMAIL] Falha ao notificar responsaveis sobre atividade submetida pelo aluno:', emailError.message);
    });

    return res.status(201).json(atividade);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Erro ao submeter atividade.'
    });
  }
}

async function listarCertificados(req, res) {
  try {
    const certificados = await Certificado.find(
      { aluno: req.aluno._id },
      {
        nomeArquivo: 1,
        caminho: 1,
        dataEnvio: 1
      }
    );

    return res.status(200).json(certificados);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Erro ao listar certificados.'
    });
  }
}

async function listarMeusCursos(req, res) {
  try {
    const cursos = (req.aluno.cursos || []).map((item) => ({
      _id: item.cursoId._id || item.cursoId,
      nome: item.cursoId.nome,
      codigo: item.cursoId.codigo
    }));

    return res.status(200).json(cursos);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Erro ao listar cursos.'
    });
  }
}

module.exports = {
  criar,
  listar,
  buscarPorId,
  dashboard,
  listarMinhasAtividades,
  listarCategoriasDisponiveis,
  listarCertificados,
  submeterAtividade,
  atualizar,
  remover,
  listarMeusCursos
};


