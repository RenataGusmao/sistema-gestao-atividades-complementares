const mongoose = require('mongoose');

const AuditoriaSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    default: null,
    index: true
  },
  tabelaAfetada: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  acao: {
    type: String,
    required: true,
    enum: ['INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APROVACAO', 'REPROVACAO']
  },
  idRegistroAfetado: {
    type: String,
    required: true,
    trim: true
  },
  descricaoAcao: {
    type: String,
    default: null
  },
  ipOrigem: {
    type: String,
    default: null,
    maxlength: 45
  }
}, {
  timestamps: { createdAt: 'dataEvento', updatedAt: false },
  versionKey: false
});

module.exports = mongoose.model('Auditoria', AuditoriaSchema);
