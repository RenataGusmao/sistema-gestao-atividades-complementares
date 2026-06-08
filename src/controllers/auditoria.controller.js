const Auditoria = require('../models/Auditoria');

async function listar(req, res) {
  try {
    const filtro = {};

    if (req.query.acao) {
      filtro.acao = req.query.acao;
    }

    if (req.query.entidade) {
      filtro.entidade = req.query.entidade;
    }

    if (req.query.usuarioId) {
      filtro.usuarioId = req.query.usuarioId;
    }

    const limite = Math.min(Number(req.query.limite) || 100, 500);

    const auditorias = await Auditoria
      .find(filtro)
      .populate('usuarioId', 'nome email codigoUsuario perfis')
      .sort({ dataEvento: -1 })
      .limit(limite);

    return res.status(200).json(auditorias);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Erro ao listar registros de auditoria.'
    });
  }
}

module.exports = {
  listar
};
