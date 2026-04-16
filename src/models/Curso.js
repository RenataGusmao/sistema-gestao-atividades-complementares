const mongoose = require('mongoose');

const CursoSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: [true, 'O código do curso é obrigatório.'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: 20,
    match: [/^[A-Z0-9]+$/, 'O código do curso deve conter apenas letras e números.']
  },
  nome: {
    type: String,
    required: [true, 'O nome do curso é obrigatório.'],
    unique: true,
    trim: true,
    maxlength: 150
  },
  descricao: {
    type: String,
    trim: true,
    maxlength: 500
  },
  cargaHorariaTotalComplementar: {
    type: Number,
    required: [true, 'A carga horária total complementar do curso é obrigatória.'],
    min: [0, 'A carga horária total complementar não pode ser negativa.']
  },
  ativo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
  versionKey: false
});

CursoSchema.index({ codigo: 1 }, { unique: true });
CursoSchema.index({ nome: 1 }, { unique: true });

module.exports = mongoose.model('Curso', CursoSchema);