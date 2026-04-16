const mongoose = require('mongoose');

const historicoValidacaoSchema = new mongoose.Schema({
  statusAnterior: {
    type: String,
    enum: ['Enviada', 'Em análise', 'Aprovada', 'Reprovada'],
    required: true
  },
  statusNovo: {
    type: String,
    enum: ['Enviada', 'Em análise', 'Aprovada', 'Reprovada'],
    required: true
  },
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  dataAcao: {
    type: Date,
    default: Date.now
  },
  decisao: {
    type: String,
    enum: ['Aprovação', 'Reprovação', 'Atualização'],
    required: true
  },
  justificativa: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  cargaHorariaValidada: {
    type: Number,
    min: 0
  }
}, { _id: false });

const anexoSchema = new mongoose.Schema({
  nomeArquivo: {
    type: String,
    required: true,
    trim: true
  },
  urlArquivo: {
    type: String,
    required: true,
    trim: true
  },
  tipoArquivo: {
    type: String,
    required: true,
    enum: ['application/pdf', 'image/jpeg', 'image/png']
  },
  tamanhoBytes: {
    type: Number,
    required: true,
    max: 10 * 1024 * 1024
  },
  dataUpload: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const AtividadeSchema = new mongoose.Schema({
  alunoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Aluno',
    required: [true, 'O aluno é obrigatório.'],
    index: true
  },
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
  coordenadorResponsavelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    default: null,
    index: true
  },
  titulo: {
    type: String,
    required: [true, 'O título é obrigatório.'],
    trim: true,
    maxlength: 200
  },
  descricao: {
    type: String,
    required: [true, 'A descrição é obrigatória.'],
    trim: true,
    maxlength: 2000
  },
  dataRealizacao: {
    type: Date,
    required: [true, 'A data de realização é obrigatória.']
  },
  cargaHorariaInformada: {
    type: Number,
    required: [true, 'A carga horária informada é obrigatória.'],
    min: [0, 'A carga horária informada não pode ser negativa.']
  },
  cargaHorariaValidada: {
    type: Number,
    default: 0,
    min: [0, 'A carga horária validada não pode ser negativa.']
  },
  status: {
    type: String,
    enum: ['Enviada', 'Em análise', 'Aprovada', 'Reprovada'],
    default: 'Enviada',
    required: true,
    index: true
  },
  justificativaReprovacao: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  observacaoCoordenador: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  anexos: {
    type: [anexoSchema],
    validate: {
      validator: function (value) {
        return Array.isArray(value) && value.length > 0;
      },
      message: 'É obrigatório anexar ao menos um comprovante.'
    }
  },
  historicoValidacoes: {
    type: [historicoValidacaoSchema],
    default: []
  }
}, {
  timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
  versionKey: false
});

AtividadeSchema.pre('save', function (next) {
  if (this.status === 'Reprovada' && !this.justificativaReprovacao) {
    return next(new Error('A justificativa de reprovação é obrigatória.'));
  }

  if (this.cargaHorariaValidada > this.cargaHorariaInformada) {
    return next(new Error('A carga horária validada não pode ser maior que a carga horária informada.'));
  }

  next();
});

module.exports = mongoose.model('Atividade', AtividadeSchema);