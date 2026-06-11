const mongoose = require('mongoose');

const certificadoSchema = new mongoose.Schema({
  aluno: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Aluno',
    required: true
  },
  nomeArquivo: String,
  caminho: String,
  tipoArquivo: String,
  tamanhoBytes: Number,
  storageProvider: String,
  storageKey: String,
  resourceType: String,
  dataEnvio: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Certificado', certificadoSchema);