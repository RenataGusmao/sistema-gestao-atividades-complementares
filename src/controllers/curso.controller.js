const Curso = require('../models/Curso');
const { registrarAuditoria } = require('../services/audit.service');

async function criar(req, res) {
  try {
    const curso = await Curso.create(req.body);

    if (req.user?._id) {
      await registrarAuditoria({
        usuarioId: req.user._id,
        acao: 'CRIACAO',
        entidade: 'Curso',
        registroId: curso._id,
        descricao: 'Curso cadastrado no sistema.',
        dadosNovos: curso,
        ipOrigem: req.ip,
        userAgent: req.get('User-Agent') || null
      });
    }

    return res.status(201).json(curso);
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
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}

async function listar(req, res) {
  try {
    const cursos = await Curso.find().sort({ nome: 1 });
    return res.status(200).json(cursos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao listar cursos.' });
  }
}

async function buscarPorId(req, res) {
  try {
    const curso = await Curso.findById(req.params.id);

    if (!curso) {
      return res.status(404).json({ message: 'Curso não encontrado.' });
    }

    return res.status(200).json(curso);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao buscar curso.' });
  }
}

async function atualizar(req, res) {
  try {
    const cursoAnterior = await Curso.findById(req.params.id);

    if (!cursoAnterior) {
      return res.status(404).json({ message: 'Curso não encontrado.' });
    }

    const cursoAtualizado = await Curso.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (req.user?._id) {
      await registrarAuditoria({
        usuarioId: req.user._id,
        acao: 'ATUALIZACAO',
        entidade: 'Curso',
        registroId: cursoAtualizado._id,
        descricao: 'Curso atualizado no sistema.',
        dadosAnteriores: cursoAnterior,
        dadosNovos: cursoAtualizado,
        ipOrigem: req.ip,
        userAgent: req.get('User-Agent') || null
      });
    }

    return res.status(200).json(cursoAtualizado);
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
    return res.status(500).json({ message: 'Erro ao atualizar curso.' });
  }
}

async function remover(req, res) {
  try {
    const curso = await Curso.findById(req.params.id);

    if (!curso) {
      return res.status(404).json({ message: 'Curso não encontrado.' });
    }

    await Curso.findByIdAndDelete(req.params.id);

    if (req.user?._id) {
      await registrarAuditoria({
        usuarioId: req.user._id,
        acao: 'EXCLUSAO',
        entidade: 'Curso',
        registroId: curso._id,
        descricao: 'Curso removido do sistema.',
        dadosAnteriores: curso,
        ipOrigem: req.ip,
        userAgent: req.get('User-Agent') || null
      });
    }

    return res.status(200).json({ message: 'Curso removido com sucesso.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao remover curso.' });
  }
}

module.exports = {
  criar,
  listar,
  buscarPorId,
  atualizar,
  remover
};