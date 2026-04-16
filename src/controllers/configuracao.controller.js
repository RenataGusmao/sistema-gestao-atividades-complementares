const ConfiguracaoSistema = require('../models/ConfiguracaoSistema');
const { registrarAuditoria } = require('../services/audit.service');

async function criarOuAtualizar(req, res) {
  try {
    const { chave, valor, tipo, categoria, descricao, editavel, ativo } = req.body;

    const configuracaoAnterior = await ConfiguracaoSistema.findOne({ chave });

    const configuracao = await ConfiguracaoSistema.findOneAndUpdate(
      { chave },
      {
        chave,
        valor,
        tipo,
        categoria,
        descricao,
        editavel,
        ativo
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    if (req.user?._id) {
      await registrarAuditoria({
        usuarioId: req.user._id,
        acao: configuracaoAnterior ? 'ATUALIZACAO' : 'CRIACAO',
        entidade: 'ConfiguracaoSistema',
        registroId: configuracao._id,
        descricao: configuracaoAnterior
          ? 'Configuração do sistema atualizada.'
          : 'Configuração do sistema criada.',
        dadosAnteriores: configuracaoAnterior,
        dadosNovos: configuracao,
        ipOrigem: req.ip,
        userAgent: req.get('User-Agent') || null
      });
    }

    return res.status(configuracaoAnterior ? 200 : 201).json(configuracao);
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
    return res.status(500).json({ message: 'Erro ao salvar configuração.' });
  }
}

async function listar(req, res) {
  try {
    const configuracoes = await ConfiguracaoSistema.find().sort({ categoria: 1, chave: 1 });
    return res.status(200).json(configuracoes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao listar configurações.' });
  }
}

async function buscarPorChave(req, res) {
  try {
    const configuracao = await ConfiguracaoSistema.findOne({ chave: req.params.chave });

    if (!configuracao) {
      return res.status(404).json({ message: 'Configuração não encontrada.' });
    }

    return res.status(200).json(configuracao);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao buscar configuração.' });
  }
}

module.exports = {
  criarOuAtualizar,
  listar,
  buscarPorChave
};