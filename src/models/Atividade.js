const mongoose = require('mongoose');

const AnexoSchema = new mongoose.Schema({
  nomeArquivo: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  caminhoArquivo: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  tipoArquivo: {
    type: String,
    required: true,
    enum: ['pdf', 'jpg', 'jpeg', 'png']
  },
  tamanhoBytes: {
    type: Number,
    required: true,
    min: 1
  },
  dataUpload: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const HistoricoStatusSchema = new mongoose.Schema({
  statusAnteriorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StatusAtividade',
    default: null
  },
  statusNovoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StatusAtividade',
    required: true
  },
  usuarioResponsavelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    default: null
  },
  observacao: {
    type: String,
    default: null
  },
  dataAlteracao: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const AtividadeSchema = new mongoose.Schema({
  alunoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Aluno',
    required: true,
    index: true
  },
  cursoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Curso',
    required: true,
    index: true
  },
  categoriaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CategoriaAtividade',
    required: true,
    index: true
  },
  statusId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StatusAtividade',
    required: true,
    index: true
  },
  titulo: {
    type: String,
    required: [true, 'Título é obrigatório.'],
    trim: true,
    maxlength: 200
  },
  descricao: {
    type: String,
    required: [true, 'Descrição é obrigatória.'],
    trim: true
  },
  dataRealizacao: {
    type: Date,
    required: [true, 'Data de realização é obrigatória.']
  },
  cargaHorariaInformada: {
    type: Number,
    required: [true, 'Carga horária informada é obrigatória.'],
    min: 0
  },
  cargaHorariaValidada: {
    type: Number,
    default: null,
    min: 0
  },
  justificativaReprovacao: {
    type: String,
    default: null
  },
  observacaoCoordenador: {
    type: String,
    default: null
  },
  coordenadorAvaliadorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    default: null
  },
  anexos: {
    type: [AnexoSchema],
    default: []
  },
  historicoStatus: {
    type: [HistoricoStatusSchema],
    default: []
  }
}, {
  timestamps: { createdAt: 'dataSubmissao', updatedAt: 'dataUltimaAtualizacao' },
  versionKey: false
});

AtividadeSchema.index({ alunoId: 1, cursoId: 1 });
AtividadeSchema.index({ statusId: 1 });
AtividadeSchema.index({ dataSubmissao: -1 });

module.exports = mongoose.model('Atividade', AtividadeSchema);
