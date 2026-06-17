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

function cursoIdValor(curso) {
  return curso?._id || curso?.id || curso;
}

function agregarPerfis(usuarios) {
  return [...new Set(
    usuarios.flatMap((usuario) => usuario.perfis || [])
  )];
}

function agregarCursosCoordenados(usuarios) {
  const cursosPorId = new Map();

  usuarios.forEach((usuario) => {
    (usuario.cursosCoordenados || []).forEach((item) => {
      const cursoId = cursoIdValor(item.cursoId);

      if (cursoId && !cursosPorId.has(String(cursoId))) {
        cursosPorId.set(String(cursoId), item);
      }
    });
  });

  return Array.from(cursosPorId.values());
}

function aplicarAgregacaoPorEmail(usuario, usuariosMesmoEmail) {
  usuario.perfis = agregarPerfis(usuariosMesmoEmail);
  usuario.cursosCoordenados = agregarCursosCoordenados(usuariosMesmoEmail);
  return usuario;
}

function usuarioPublico(usuario) {
  const cursosCoordenados = Array.isArray(usuario.cursosCoordenados)
    ? usuario.cursosCoordenados.map((item) => ({
        cursoId: item.cursoId,
        dataVinculo: item.dataVinculo
      }))
    : [];

  return {
    id: usuario._id,
    codigoUsuario: usuario.codigoUsuario,
    nome: usuario.nome,
    email: usuario.email,
    perfis: usuario.perfis,
    cursosCoordenados,
    ativo: usuario.ativo
  };
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
    const { email, codigoUsuario, matricula, senha } = req.body;

    const login = codigoUsuario || matricula || email;
    const loginTexto = String(login || '').trim();
    const usaCodigo = Boolean(codigoUsuario || matricula) || !loginTexto.includes('@');
    const filtroLogin = usaCodigo
      ? { codigoUsuario: loginTexto.toUpperCase() }
      : { email: loginTexto.toLowerCase() };

    const usuarios = await Usuario.find(filtroLogin)
      .select('+senhaHash')
      .populate('cursosCoordenados.cursoId');

    let usuario = null;

    for (const item of usuarios) {
      if (item.ativo && await item.compararSenha(senha)) {
        usuario = item;
        break;
      }
    }

    if (!usuario) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const usuariosMesmoEmail = await Usuario.find({
      email: usuario.email,
      ativo: true
    })
      .select('+senhaHash')
      .populate('cursosCoordenados.cursoId');

    usuario = aplicarAgregacaoPorEmail(usuario, usuariosMesmoEmail);

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
      usuario: usuarioPublico(usuario)
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao realizar login.' });
  }
}

async function me(req, res) {
  try {
    const usuarioBase = await Usuario.findById(req.user._id)
      .select('+senhaHash')
      .populate('cursosCoordenados.cursoId');

    if (!usuarioBase || !usuarioBase.ativo) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const usuariosMesmoEmail = await Usuario.find({
      email: usuarioBase.email,
      ativo: true
    })
      .select('+senhaHash')
      .populate('cursosCoordenados.cursoId');

    const usuario = aplicarAgregacaoPorEmail(usuarioBase, usuariosMesmoEmail);

    return res.status(200).json({
      usuario: usuarioPublico(usuario)
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao buscar usuário autenticado.' });
  }
}

module.exports = {
  register,
  login,
  me
};
