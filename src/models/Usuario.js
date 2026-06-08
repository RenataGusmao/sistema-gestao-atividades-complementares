const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const perfisValidos = ['administrador', 'coordenador'];

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
  codigoUsuario: {
    type: String,
    required: [true, 'O cÃ³digo do usuÃ¡rio Ã© obrigatÃ³rio.'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: 30,
    match: [/^[A-Z0-9]+$/, 'O cÃ³digo do usuÃ¡rio deve conter apenas letras e nÃºmeros.']
  },
  nome: {
    type: String,
    required: [true, 'O nome Ã© obrigatÃ³rio.'],
    trim: true,
    maxlength: 150
  },
  email: {
    type: String,
    required: [true, 'O e-mail Ã© obrigatÃ³rio.'],
    lowercase: true,
    trim: true,
    maxlength: 150,
    match: [/^\S+@\S+\.\S+$/, 'Informe um e-mail vÃ¡lido.']
  },
  senhaHash: {
    type: String,
    required: [true, 'A senha Ã© obrigatÃ³ria.'],
    select: false
  },
  perfis: {
    type: [String],
    enum: perfisValidos,
    validate: {
      validator: function (value) {
        return Array.isArray(value) && value.length > 0;
      },
      message: 'O usuÃ¡rio deve possuir ao menos um perfil.'
    }
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

UsuarioSchema.pre('save', async function (next) {
  if (!this.isModified('senhaHash')) return next();

  try {
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 12);
    this.senhaHash = await bcrypt.hash(this.senhaHash, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

UsuarioSchema.methods.compararSenha = function (senha) {
  return bcrypt.compare(senha, this.senhaHash);
};

module.exports = mongoose.model('Usuario', UsuarioSchema);
