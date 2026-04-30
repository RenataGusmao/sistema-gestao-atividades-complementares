const mongoose = require('mongoose');

const CategoriaAtividadeSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'O nome da categoria é obrigatório.'],
    trim: true,
    maxlength: 100
  },
  codigo: {
    type: String,
    required: [true, 'O código da categoria é obrigatório.'],
    trim: true,
    uppercase: true,
    maxlength: 20,
    match: [/^[A-Z0-9_]+$/, 'O código da categoria deve conter apenas letras, números e underscore.']
  },
  descricao: {
    type: String,
    trim: true,
    maxlength: 500
  },
  areaParametro: {
    type: String,
    required: [true, 'A área/parâmetro da categoria é obrigatória.'],
    trim: true,
    maxlength: 100
  },
  ativa: {
    type: Boolean,
    default: true
  },

 
  curso: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Curso',
    required: [true, 'O curso é obrigatório para a categoria.']
  }

}, {
  timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
  versionKey: false
});



CategoriaAtividadeSchema.index({ nome: 1, curso: 1 }, { unique: true });


CategoriaAtividadeSchema.index({ codigo: 1, curso: 1 }, { unique: true });


CategoriaAtividadeSchema.index({ areaParametro: 1 });

module.exports = mongoose.model('CategoriaAtividade', CategoriaAtividadeSchema);