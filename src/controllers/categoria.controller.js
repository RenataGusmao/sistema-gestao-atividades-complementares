const CategoriaAtividade = require('../models/CategoriaAtividade');
const { registrarAuditoria } = require('../services/audit.service');

async function criar(req, res) {
  try {
    const categoria = await CategoriaAtividade.create(req.body);

    if (req.user?._id) {
      await registrarAuditoria({
        usuarioId: req.user._id,
        acao: 'CRIACAO',
        entidade: 'CategoriaAtividade',
        registroId: categoria._id,
        descricao: 'Categoria de atividade cadastrada no sistema.',
        dadosNovos: categoria,
        ipOrigem: req.ip,
        userAgent: req.get('User-Agent') || null
      });
    }

    return res.status(201).json(categoria);
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
    return res.status(500).json({ message: 'Erro ao criar categoria.' });
  }
}

async function listar(req, res) {
  try {
    const filtro = {};
    if (req.query.ativa !== undefined) filtro.ativa = req.query.ativa === 'true';
    if (req.query.areaParametro) filtro.areaParametro = req.query.areaParametro;

    const categorias = await CategoriaAtividade.find(filtro).sort({ nome: 1 });
    return res.status(200).json(categorias);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao listar categorias.' });
  }
}

async function buscarPorId(req, res) {
  try {
    const categoria = await CategoriaAtividade.findById(req.params.id);

    if (!categoria) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }

    return res.status(200).json(categoria);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao buscar categoria.' });
  }
}

async function atualizar(req, res) {
  try {
    const categoriaAnterior = await CategoriaAtividade.findById(req.params.id);

    if (!categoriaAnterior) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }

    const categoriaAtualizada = await CategoriaAtividade.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (req.user?._id) {
      await registrarAuditoria({
        usuarioId: req.user._id,
        acao: 'ATUALIZACAO',
        entidade: 'CategoriaAtividade',
        registroId: categoriaAtualizada._id,
        descricao: 'Categoria de atividade atualizada no sistema.',
        dadosAnteriores: categoriaAnterior,
        dadosNovos: categoriaAtualizada,
        ipOrigem: req.ip,
        userAgent: req.get('User-Agent') || null
      });
    }

    return res.status(200).json(categoriaAtualizada);
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
    return res.status(500).json({ message: 'Erro ao atualizar categoria.' });
  }
}

async function remover(req, res) {
  try {
    const categoria = await CategoriaAtividade.findById(req.params.id);

    if (!categoria) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }

    await CategoriaAtividade.findByIdAndDelete(req.params.id);

    if (req.user?._id) {
      await registrarAuditoria({
        usuarioId: req.user._id,
        acao: 'EXCLUSAO',
        entidade: 'CategoriaAtividade',
        registroId: categoria._id,
        descricao: 'Categoria de atividade removida do sistema.',
        dadosAnteriores: categoria,
        ipOrigem: req.ip,
        userAgent: req.get('User-Agent') || null
      });
    }

    return res.status(200).json({ message: 'Categoria removida com sucesso.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao remover categoria.' });
  }
}

module.exports = {
  criar,
  listar,
  buscarPorId,
  atualizar,
  remover
};