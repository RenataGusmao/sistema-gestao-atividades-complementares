const jwt = require('jsonwebtoken');
const Aluno = require('../models/Aluno');
const { registrarAuditoria } = require('../services/audit.service');

function gerarToken(aluno) {
    return jwt.sign(
        { sub: aluno._id, tipo: 'aluno', matricula: aluno.matricula },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );
}

async function login(req,res) {

    try{   
    const { email, senha } = req.body;

    const aluno = await Aluno.findOne({ email }).select('+senhaHash');

    if (!aluno || !aluno.ativo) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const senhaValida = senha === aluno.senhaHash;

    if (!senhaValida) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    aluno.ultimoLogin = new Date();

    await aluno.save();

    const token = gerarToken(aluno);

    await registrarAuditoria({
    usuarioId: aluno._id,
    acao: 'LOGIN',
    entidade: 'Aluno',
    registroId: aluno._id,
    descricao: 'Login realizado no portal do aluno.',
    ipOrigem: req.ip,
    userAgent: req.get('User-Agent') || null
});

     return res.status(200).json({
      token,
      aluno: {
        id: aluno._id,
        nome: aluno.nome,
        email: aluno.email,
        matricula: aluno.matricula,
        matriculaAtiva: aluno.matriculaAtiva
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao realizar login.' });
  }
}

async function primeiroAcesso(req, res) {
  try {
    const { matricula, senha } = req.body;

    const aluno = await Aluno.findOne({ matricula }).select('+senhaHash');

    if (!aluno) {
      return res.status(404).json({
        message: 'Aluno não encontrado.'
      });
    }

    if (aluno.senhaHash) {
      return res.status(400).json({
        message: 'Senha já cadastrada para este aluno.'
      });
    }

    aluno.senhaHash = senha;

    await aluno.save();

    return res.status(200).json({
      message: 'Primeiro acesso realizado com sucesso.'
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Erro ao realizar primeiro acesso.'
    });
  }
}


module.exports = {
  login,
  primeiroAcesso
};
