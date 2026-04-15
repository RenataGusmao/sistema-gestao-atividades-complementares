const mongoose = require('mongoose');

const CursoVinculoSchema = new mongoose.Schema({
  cursoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Curso',
    required: true
  },
  matriculaAtiva: {
    type: Boolean,
    default: true
  },
  dataVinculo: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const AlunoSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório.'],
    trim: true,
    maxlength: 150
  },
  email: {
    type: String,
    required: [true, 'E-mail é obrigatório.'],
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 150,
    match: [/^\S+@\S+\.\S+$/, 'Informe um e-mail válido.']
  },
  matricula: {
    type: String,
    required: [true, 'Matrícula é obrigatória.'],
    unique: true,
    trim: true,
    maxlength: 50
  },
  ativo: {
    type: Boolean,
    default: true
  },
  dataColacaoPrevista: {
    type: Date,
    default: null
  },
  cursos: {
    type: [CursoVinculoSchema],
    default: []
  }
}, {
  timestamps: { createdAt: 'dataCriacao', updatedAt: false },
  versionKey: false
});

AlunoSchema.index({ email: 1 }, { unique: true });
AlunoSchema.index({ matricula: 1 }, { unique: true });

module.exports = mongoose.model('Aluno', AlunoSchema);
