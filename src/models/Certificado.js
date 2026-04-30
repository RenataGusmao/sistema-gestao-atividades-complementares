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
  }
});

module.exports = mongoose.model('Certificado', certificadoSchema);