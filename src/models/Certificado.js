const mongoose = require('mongoose');

const certificadoSchema = new mongoose.Schema({
  aluno: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Aluno',
    required: true
  },

  nomeArquivo: String,
  caminho: String,

  dataEnvio: {
    type: Date,
    default: Date.now
  },

  status: {
    type: String,
    enum: ['PENDENTE', 'APROVADO', 'REPROVADO'],
    default: 'PENDENTE'
  }

});

module.exports = mongoose.model('Certificado', certificadoSchema);