const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const { registrarAuditoria } = require('../services/audit.service');

function gerarToken(usuario) {
  return jwt.sign(
    { sub: usuario._id, perfis: usuario.perfis },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

async function register(req, res) {
  try {
    const { codigoUsuario, nome, email, senha, perfis, cursosCoordenados, ativo } = req.body;

    const usuario = new Usuario({
      codigoUsuario,
      nome,
      email,
      senhaHash: senha,
      perfis,
      cursosCoordenados: Array.isArray(cursosCoordenados) ? cursosCoordenados : [],
      ativo: ativo ?? true
    });

    await usuario.save();

    await registrarAuditoria({
      usuarioId: usuario._id,
      acao: 'CRIACAO',
      entidade: 'Usuario',
      registroId: usuario._id,
      descricao: 'Usuário cadastrado no sistema.',
      dadosNovos: {
        codigoUsuario: usuario.codigoUsuario,
        nome: usuario.nome,
        email: usuario.email,
        perfis: usuario.perfis,
        ativo: usuario.ativo
      },
      ipOrigem: req.ip,
      userAgent: req.get('User-Agent') || null
    });

    return res.status(201).json({
      id: usuario._id,
      codigoUsuario: usuario.codigoUsuario,
      nome: usuario.nome,
      email: usuario.email,
      perfis: usuario.perfis,
      ativo: usuario.ativo
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Registro duplicado.',
        fields: error.keyValue || {}
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(422).json({
        message: 'Erro de validação.',
        errors
      });
    }

    console.error(error);
    return res.status(500).json({ message: 'Erro ao cadastrar usuário.' });
  }
}

async function login(req, res) {
  try {
    const { email, senha } = req.body;

    const usuario = await Usuario.findOne({ email }).select('+senhaHash');

    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const senhaValida = await usuario.compararSenha(senha);

    if (!senhaValida) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const token = gerarToken(usuario);

    await registrarAuditoria({
      usuarioId: usuario._id,
      acao: 'LOGIN',
      entidade: 'Usuario',
      registroId: usuario._id,
      descricao: 'Login realizado no sistema.',
      ipOrigem: req.ip,
      userAgent: req.get('User-Agent') || null
    });

    return res.status(200).json({
      token,
      usuario: {
        id: usuario._id,
        codigoUsuario: usuario.codigoUsuario,
        nome: usuario.nome,
        email: usuario.email,
        perfis: usuario.perfis,
        ativo: usuario.ativo
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao realizar login.' });
  }
}

module.exports = {
  register,
  login
};