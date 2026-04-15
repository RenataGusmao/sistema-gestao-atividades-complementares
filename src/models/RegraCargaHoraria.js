const mongoose = require('mongoose');

const RegraCargaHorariaSchema = new mongoose.Schema({
  cursoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Curso',
    required: true
  },
  categoriaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CategoriaAtividade',
    required: true
  },
  cargaHorariaMaxima: {
    type: Number,
    required: true,
    min: 0
  },
  observacao: {
    type: String,
    default: null
  },
  ativa: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'dataCriacao', updatedAt: false },
  versionKey: false
});

RegraCargaHorariaSchema.index({ cursoId: 1, categoriaId: 1 }, { unique: true });

module.exports = mongoose.model('RegraCargaHoraria', RegraCargaHorariaSchema);
