const mongoose = require('mongoose');

const CursoVinculadoSchema = new mongoose.Schema({
  cursoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Curso',
    required: true
  },
  dataVinculo: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const AlunoSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'O nome do aluno é obrigatório.'],
    trim: true,
    maxlength: 150
  },
  email: {
    type: String,
    required: [true, 'O e-mail é obrigatório.'],
    lowercase: true,
    trim: true,
    maxlength: 150,
    match: [/^\S+@\S+\.\S+$/, 'Informe um e-mail válido.']
  },
  matricula: {
    type: String,
    required: [true, 'A matrícula é obrigatória.'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: 30
  },
  cursos: {
    type: [CursoVinculadoSchema],
    validate: {
      validator: function (value) {
        return Array.isArray(value) && value.length > 0;
      },
      message: 'O aluno deve estar vinculado a pelo menos um curso.'
    }
  },
  matriculaAtiva: {
    type: Boolean,
    default: true
  },
  dataPrevistaColacao: {
    type: Date,
    required: [true, 'A data prevista de colação é obrigatória.']
  }
}, {
  timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
  versionKey: false
});

AlunoSchema.index({ matricula: 1 }, { unique: true });
AlunoSchema.index({ email: 1 });

module.exports = mongoose.model('Aluno', AlunoSchema);