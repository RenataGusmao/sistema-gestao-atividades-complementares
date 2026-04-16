const Auditoria = require('../models/Auditoria');

async function registrarAuditoria({
  usuarioId,
  acao,
  entidade,
  registroId,
  descricao,
  dadosAnteriores = null,
  dadosNovos = null,
  ipOrigem = null,
  userAgent = null
}) {
  return Auditoria.create({
    usuarioId,
    acao,
    entidade,
    registroId,
    descricao,
    dadosAnteriores,
    dadosNovos,
    ipOrigem,
    userAgent
  });
}

module.exports = {
  registrarAuditoria
};