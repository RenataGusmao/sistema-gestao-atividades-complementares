const Aluno = require('../models/Aluno');
const Atividade = require('../models/Atividade');
const Certificado = require('../models/Certificado');
const CategoriaAtividade = require('../models/CategoriaAtividade');
const { registrarAuditoria } = require('../services/audit.service');

async function criar(req, res) {
  try {
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
        userAgent: req.get('User-Agent') || null
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
    const alunos = await Aluno.find().populate('cursos.cursoId').sort({ nome: 1 });
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
      return res.status(404).json({ message: 'Aluno não encontrado.' });
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
      return res.status(404).json({ message: 'Aluno não encontrado.' });
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
      return res.status(404).json({ message: 'Aluno não encontrado.' });
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
        ultimoLogin: aluno.ultimoLogin
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
    const atividades = await Atividade.find(
  { alunoId: req.aluno._id },
  {
    titulo: 1,
    status: 1,
    cargaHorariaInformada: 1,
    justificativaReprovacao: 1,
    dataCriacao: 1
  }
);

    return res.status(200).json(atividades.map((atividade) => ({
      _id: atividade._id,
      titulo: atividade.titulo,
      status: atividade.status,
      cargaHoraria: atividade.cargaHorariaInformada,
      cargaHorariaInformada: atividade.cargaHorariaInformada,
      justificativaReprovacao: atividade.justificativaReprovacao,
      dataCriacao: atividade.dataCriacao
    })));

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Erro ao listar atividades.'
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

    const cursoAlunoId = cursoId || req.aluno.cursos?.[0]?.cursoId;
    const categoria = categoriaId
      ? await CategoriaAtividade.findById(categoriaId)
      : await CategoriaAtividade.findOne({ curso: cursoAlunoId, ativa: true }).sort({ nome: 1 });

    if (!cursoAlunoId || !categoria) {
      return res.status(422).json({
        message: 'Nao foi possivel identificar curso/categoria para a atividade.'
      });
    }

    const anexos = arquivos.map(file => ({
      nomeArquivo: file.originalname,
      urlArquivo: `/uploads/${file.filename}`,
      tipoArquivo: file.mimetype,
      tamanhoBytes: file.size
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
        caminho: anexo.urlArquivo
      });
    }

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

module.exports = {
  criar,
  listar,
  buscarPorId,
  dashboard,
  listarMinhasAtividades,
  listarCertificados,
  submeterAtividade,
  atualizar,
  remover
};
