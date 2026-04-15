const mongoose = require('mongoose');

const ConfiguracaoSistemaSchema = new mongoose.Schema({
  chaveConfiguracao: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },
  valorConfiguracao: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  descricao: {
    type: String,
    default: null
  }
}, {
  timestamps: { createdAt: false, updatedAt: 'dataAtualizacao' },
  versionKey: false
});

module.exports = mongoose.model('ConfiguracaoSistema', ConfiguracaoSistemaSchema);
