const Aluno = require('../models/Aluno');
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

module.exports = {
  criar,
  listar,
  buscarPorId,
  atualizar,
  remover
};