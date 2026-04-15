const Auditoria = require('../models/Auditoria');

async function registrarAuditoria({ usuarioId = null, tabelaAfetada, acao, idRegistroAfetado, descricaoAcao = null, ipOrigem = null }) {
  await Auditoria.create({
    usuarioId,
    tabelaAfetada,
    acao,
    idRegistroAfetado,
    descricaoAcao,
    ipOrigem
  });
}

module.exports = { registrarAuditoria };
