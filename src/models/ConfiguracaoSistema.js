const mongoose = require('mongoose');

const ConfiguracaoSistemaSchema = new mongoose.Schema({
  chave: {
    type: String,
    required: [true, 'A chave da configuração é obrigatória.'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: 100,
    match: [/^[A-Z0-9_]+$/, 'A chave deve conter apenas letras, números e underscore.']
  },
  valor: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'O valor da configuração é obrigatório.']
  },
  descricao: {
    type: String,
    trim: true,
    maxlength: 500
  },
  tipo: {
    type: String,
    required: [true, 'O tipo da configuração é obrigatório.'],
    enum: ['STRING', 'NUMBER', 'BOOLEAN', 'ARRAY', 'OBJECT']
  },
  categoria: {
    type: String,
    required: [true, 'A categoria da configuração é obrigatória.'],
    trim: true,
    enum: [
      'UPLOAD',
      'VALIDACAO',
      'INSTITUCIONAL',
      'INTERFACE',
      'SEGURANCA',
      'INTEGRACAO',
      'GERAL'
    ]
  },
  editavel: {
    type: Boolean,
    default: true
  },
  ativo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
  versionKey: false
});

ConfiguracaoSistemaSchema.index({ chave: 1 }, { unique: true });
ConfiguracaoSistemaSchema.index({ categoria: 1, ativo: 1 });

module.exports = mongoose.model('ConfiguracaoSistema', ConfiguracaoSistemaSchema);