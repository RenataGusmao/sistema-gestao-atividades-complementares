const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const perfisValidos = ['aluno', 'coordenador', 'administrador'];

const CursoCoordenadoSchema = new mongoose.Schema({
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

const UsuarioSchema = new mongoose.Schema({
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
  senhaHash: {
    type: String,
    required: [true, 'Senha é obrigatória.'],
    select: false
  },
  perfis: {
    type: [String],
    enum: perfisValidos,
    default: ['aluno']
  },
  cursosCoordenados: {
    type: [CursoCoordenadoSchema],
    default: []
  },
  ativo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
  versionKey: false
});

UsuarioSchema.index({ email: 1 }, { unique: true });

UsuarioSchema.pre('save', async function (next) {
  if (!this.isModified('senhaHash')) return next();
  const rounds = Number(process.env.BCRYPT_SALT_ROUNDS || 12);
  this.senhaHash = await bcrypt.hash(this.senhaHash, rounds);
  next();
});

UsuarioSchema.methods.compararSenha = function (senha) {
  return bcrypt.compare(senha, this.senhaHash);
};

module.exports = mongoose.model('Usuario', UsuarioSchema);
