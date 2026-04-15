const mongoose = require('mongoose');

const CategoriaAtividadeSchema = new mongoose.Schema({
  nomeCategoria: {
    type: String,
    required: [true, 'Nome da categoria é obrigatório.'],
    trim: true,
    maxlength: 100
  },
  descricao: {
    type: String,
    default: null
  },
  ativo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: false,
  versionKey: false
});

module.exports = mongoose.model('CategoriaAtividade', CategoriaAtividadeSchema);
