const ConfiguracaoSistema = require('../models/ConfiguracaoSistema');
const asyncHandler = require('../utils/asyncHandler');
const { registrarAuditoria } = require('../services/audit.service');

exports.listar = asyncHandler(async (req, res) => {
  const configuracoes = await ConfiguracaoSistema.find().sort({ chaveConfiguracao: 1 });
  res.json({ data: configuracoes });
});

exports.salvar = asyncHandler(async (req, res) => {
  const { chaveConfiguracao, valorConfiguracao, descricao } = req.body;
  const config = await ConfiguracaoSistema.findOneAndUpdate(
    { chaveConfiguracao },
    { valorConfiguracao, descricao },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  await registrarAuditoria({
    usuarioId: req.user._id,
    tabelaAfetada: 'configuracoes_sistema',
    acao: 'UPDATE',
    idRegistroAfetado: String(config._id),
    descricaoAcao: `Atualização da configuração ${chaveConfiguracao}`,
    ipOrigem: req.ip
  });

  res.json({ message: 'Configuração salva com sucesso.', data: config });
});
