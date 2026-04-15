const mongoose = require('mongoose');

const StatusAtividadeSchema = new mongoose.Schema({
  nomeStatus: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  }
}, {
  timestamps: false,
  versionKey: false
});

module.exports = mongoose.model('StatusAtividade', StatusAtividadeSchema);
