const mongoose = require('mongoose');

const RegraCargaHorariaSchema = new mongoose.Schema({
  cursoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Curso',
    required: [true, 'O curso é obrigatório.'],
    index: true
  },
  categoriaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CategoriaAtividade',
    required: [true, 'A categoria é obrigatória.'],
    index: true
  },
  cargaHorariaMaximaCategoria: {
    type: Number,
    required: [true, 'A carga horária máxima por categoria é obrigatória.'],
    min: [0, 'A carga horária máxima por categoria não pode ser negativa.']
  },
  cargaHorariaMaximaSemestre: {
    type: Number,
    required: [true, 'A carga horária máxima por semestre é obrigatória.'],
    min: [0, 'A carga horária máxima por semestre não pode ser negativa.']
  },
  observacao: {
    type: String,
    trim: true,
    maxlength: 500
  },
  ativa: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
  versionKey: false
});

RegraCargaHorariaSchema.index(
  { cursoId: 1, categoriaId: 1 },
  { unique: true, name: 'uk_regra_curso_categoria' }
);

module.exports = mongoose.model('RegraCargaHoraria', RegraCargaHorariaSchema);