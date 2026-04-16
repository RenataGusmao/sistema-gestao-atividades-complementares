const StatusAtividade = require('../models/StatusAtividade');
const { registrarAuditoria } = require('../services/audit.service');

async function criar(req, res) {
  try {
    const status = await StatusAtividade.create(req.body);

    if (req.user?._id) {
      await registrarAuditoria({
        usuarioId: req.user._id,
        acao: 'CRIACAO',
        entidade: 'StatusAtividade',
        registroId: status._id,
        descricao: 'Status de atividade cadastrado no sistema.',
        dadosNovos: status,
        ipOrigem: req.ip,
        userAgent: req.get('User-Agent') || null
      });
    }

    return res.status(201).json(status);
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
    return res.status(500).json({ message: 'Erro ao criar status de atividade.' });
  }
}

async function listar(req, res) {
  try {
    const filtro = {};
    if (req.query.ativo !== undefined) filtro.ativo = req.query.ativo === 'true';

    const status = await StatusAtividade.find(filtro).sort({ ordem: 1 });
    return res.status(200).json(status);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao listar status de atividade.' });
  }
}

async function buscarPorId(req, res) {
  try {
    const status = await StatusAtividade.findById(req.params.id);

    if (!status) {
      return res.status(404).json({ message: 'Status de atividade não encontrado.' });
    }

    return res.status(200).json(status);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao buscar status de atividade.' });
  }
}

async function atualizar(req, res) {
  try {
    const statusAnterior = await StatusAtividade.findById(req.params.id);

    if (!statusAnterior) {
      return res.status(404).json({ message: 'Status de atividade não encontrado.' });
    }

    const statusAtualizado = await StatusAtividade.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (req.user?._id) {
      await registrarAuditoria({
        usuarioId: req.user._id,
        acao: 'ATUALIZACAO',
        entidade: 'StatusAtividade',
        registroId: statusAtualizado._id,
        descricao: 'Status de atividade atualizado no sistema.',
        dadosAnteriores: statusAnterior,
        dadosNovos: statusAtualizado,
        ipOrigem: req.ip,
        userAgent: req.get('User-Agent') || null
      });
    }

    return res.status(200).json(statusAtualizado);
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
    return res.status(500).json({ message: 'Erro ao atualizar status de atividade.' });
  }
}

async function remover(req, res) {
  try {
    const status = await StatusAtividade.findById(req.params.id);

    if (!status) {
      return res.status(404).json({ message: 'Status de atividade não encontrado.' });
    }

    await StatusAtividade.findByIdAndDelete(req.params.id);

    if (req.user?._id) {
      await registrarAuditoria({
        usuarioId: req.user._id,
        acao: 'EXCLUSAO',
        entidade: 'StatusAtividade',
        registroId: status._id,
        descricao: 'Status de atividade removido do sistema.',
        dadosAnteriores: status,
        ipOrigem: req.ip,
        userAgent: req.get('User-Agent') || null
      });
    }

    return res.status(200).json({ message: 'Status removido com sucesso.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao remover status de atividade.' });
  }
}

module.exports = {
  criar,
  listar,
  buscarPorId,
  atualizar,
  remover
};