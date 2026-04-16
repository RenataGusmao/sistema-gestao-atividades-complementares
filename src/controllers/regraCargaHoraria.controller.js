const RegraCargaHoraria = require('../models/RegraCargaHoraria');
const Curso = require('../models/Curso');
const CategoriaAtividade = require('../models/CategoriaAtividade');
const { registrarAuditoria } = require('../services/audit.service');

async function criar(req, res) {
  try {
    const { cursoId, categoriaId } = req.body;

    const [curso, categoria] = await Promise.all([
      Curso.findById(cursoId),
      CategoriaAtividade.findById(categoriaId)
    ]);

    if (!curso) {
      return res.status(404).json({ message: 'Curso não encontrado.' });
    }

    if (!categoria) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }

    const regra = await RegraCargaHoraria.create(req.body);

    if (req.user?._id) {
      await registrarAuditoria({
        usuarioId: req.user._id,
        acao: 'ALTERACAO_REGRA',
        entidade: 'RegraCargaHoraria',
        registroId: regra._id,
        descricao: 'Regra de carga horária cadastrada no sistema.',
        dadosNovos: regra,
        ipOrigem: req.ip,
        userAgent: req.get('User-Agent') || null
      });
    }

    return res.status(201).json(regra);
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
    return res.status(500).json({ message: 'Erro ao criar regra de carga horária.' });
  }
}

async function listar(req, res) {
  try {
    const filtro = {};
    if (req.query.cursoId) filtro.cursoId = req.query.cursoId;
    if (req.query.categoriaId) filtro.categoriaId = req.query.categoriaId;
    if (req.query.ativa !== undefined) filtro.ativa = req.query.ativa === 'true';

    const regras = await RegraCargaHoraria.find(filtro)
      .populate('cursoId')
      .populate('categoriaId')
      .sort({ dataCriacao: -1 });

    return res.status(200).json(regras);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao listar regras de carga horária.' });
  }
}

async function buscarPorId(req, res) {
  try {
    const regra = await RegraCargaHoraria.findById(req.params.id)
      .populate('cursoId')
      .populate('categoriaId');

    if (!regra) {
      return res.status(404).json({ message: 'Regra não encontrada.' });
    }

    return res.status(200).json(regra);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao buscar regra de carga horária.' });
  }
}

async function atualizar(req, res) {
  try {
    const regraAnterior = await RegraCargaHoraria.findById(req.params.id);

    if (!regraAnterior) {
      return res.status(404).json({ message: 'Regra não encontrada.' });
    }

    const regraAtualizada = await RegraCargaHoraria.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (req.user?._id) {
      await registrarAuditoria({
        usuarioId: req.user._id,
        acao: 'ALTERACAO_REGRA',
        entidade: 'RegraCargaHoraria',
        registroId: regraAtualizada._id,
        descricao: 'Regra de carga horária atualizada no sistema.',
        dadosAnteriores: regraAnterior,
        dadosNovos: regraAtualizada,
        ipOrigem: req.ip,
        userAgent: req.get('User-Agent') || null
      });
    }

    return res.status(200).json(regraAtualizada);
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
    return res.status(500).json({ message: 'Erro ao atualizar regra de carga horária.' });
  }
}

async function remover(req, res) {
  try {
    const regra = await RegraCargaHoraria.findById(req.params.id);

    if (!regra) {
      return res.status(404).json({ message: 'Regra não encontrada.' });
    }

    await RegraCargaHoraria.findByIdAndDelete(req.params.id);

    if (req.user?._id) {
      await registrarAuditoria({
        usuarioId: req.user._id,
        acao: 'ALTERACAO_REGRA',
        entidade: 'RegraCargaHoraria',
        registroId: regra._id,
        descricao: 'Regra de carga horária removida do sistema.',
        dadosAnteriores: regra,
        ipOrigem: req.ip,
        userAgent: req.get('User-Agent') || null
      });
    }

    return res.status(200).json({ message: 'Regra removida com sucesso.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao remover regra de carga horária.' });
  }
}

module.exports = {
  criar,
  listar,
  buscarPorId,
  atualizar,
  remover
};