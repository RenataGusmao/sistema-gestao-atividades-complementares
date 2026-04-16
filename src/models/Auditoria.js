const mongoose = require('mongoose');

const AuditoriaSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'O usuário responsável pela ação é obrigatório.'],
    index: true
  },
  acao: {
    type: String,
    required: [true, 'A ação realizada é obrigatória.'],
    trim: true,
    enum: [
      'CRIACAO',
      'ATUALIZACAO',
      'EXCLUSAO',
      'LOGIN',
      'LOGOUT',
      'APROVACAO',
      'REPROVACAO',
      'AJUSTE_CARGA_HORARIA',
      'VINCULO_CURSO',
      'ALTERACAO_REGRA'
    ]
  },
  entidade: {
    type: String,
    required: [true, 'A entidade afetada é obrigatória.'],
    trim: true,
    enum: [
      'Usuario',
      'Aluno',
      'Curso',
      'CategoriaAtividade',
      'RegraCargaHoraria',
      'Atividade',
      'ConfiguracaoSistema',
      'StatusAtividade'
    ],
    index: true
  },
  registroId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'O identificador do registro afetado é obrigatório.'],
    index: true
  },
  descricao: {
    type: String,
    required: [true, 'A descrição da auditoria é obrigatória.'],
    trim: true,
    maxlength: 1000
  },
  dadosAnteriores: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  dadosNovos: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  ipOrigem: {
    type: String,
    trim: true,
    maxlength: 45
  },
  userAgent: {
    type: String,
    trim: true,
    maxlength: 500
  },
  dataEvento: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  versionKey: false
});

AuditoriaSchema.index({ entidade: 1, registroId: 1, dataEvento: -1 });
AuditoriaSchema.index({ usuarioId: 1, dataEvento: -1 });
AuditoriaSchema.index({ acao: 1, dataEvento: -1 });

module.exports = mongoose.model('Auditoria', AuditoriaSchema);