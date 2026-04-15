const mongoose = require('mongoose');

const CursoSchema = new mongoose.Schema({
  nomeCurso: {
    type: String,
    required: [true, 'Nome do curso é obrigatório.'],
    trim: true,
    maxlength: 150
  },
  codigoCurso: {
    type: String,
    required: [true, 'Código do curso é obrigatório.'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: 50
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
  timestamps: { createdAt: 'dataCriacao', updatedAt: false },
  versionKey: false
});

CursoSchema.index({ codigoCurso: 1 }, { unique: true });

module.exports = mongoose.model('Curso', CursoSchema);
