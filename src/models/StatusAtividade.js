const mongoose = require('mongoose');

const StatusAtividadeSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'O nome do status é obrigatório.'],
    unique: true,
    trim: true,
    enum: ['Enviada', 'Em análise', 'Aprovada', 'Reprovada']
  },
  descricao: {
    type: String,
    trim: true,
    maxlength: 300
  },
  ordem: {
    type: Number,
    required: [true, 'A ordem do status é obrigatória.'],
    min: [1, 'A ordem deve ser maior que zero.']
  },
  ativo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
  versionKey: false
});

StatusAtividadeSchema.index({ nome: 1 }, { unique: true });
StatusAtividadeSchema.index({ ordem: 1 }, { unique: true });

module.exports = mongoose.model('StatusAtividade', StatusAtividadeSchema);