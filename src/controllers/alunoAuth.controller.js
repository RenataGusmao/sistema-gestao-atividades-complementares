const jwt = require('jsonwebtoken');
const Aluno = require('../models/Aluno');

function gerarToken(aluno) {
  return jwt.sign(
    {
      sub: aluno._id,
      perfil: 'aluno',
      matricula: aluno.matricula
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

function montarFiltroAluno({ matricula, email }) {
  const matriculaLimpa = matricula ? String(matricula).trim().toUpperCase() : '';
  const emailLimpo = email ? String(email).trim().toLowerCase() : '';

  if (matriculaLimpa && !matriculaLimpa.includes('@')) {
    return {
      filtro: { matricula: matriculaLimpa },
      emailLimpo
    };
  }

  return {
    filtro: { email: emailLimpo },
    emailLimpo
  };
}

async function login(req, res) {
  try {
    const { matricula, email, senha } = req.body;
    const { filtro } = montarFiltroAluno({ matricula, email });

    const alunos = await Aluno.find(filtro).select('+senhaHash');
    const aluno = alunos.find((item) => item.ativo && senha === item.senhaHash);

    if (!aluno) {
      return res.status(401).json({
        message: 'Credenciais inválidas.'
      });
    }

    aluno.ultimoLogin = new Date();
    await aluno.save();

    const token = gerarToken(aluno);

    return res.status(200).json({
      token,
      aluno: {
        id: aluno._id,
        nome: aluno.nome,
        email: aluno.email,
        matricula: aluno.matricula
      },
      usuario: {
        id: aluno._id,
        nome: aluno.nome,
        email: aluno.email,
        matricula: aluno.matricula,
        perfil: 'aluno'
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Erro ao realizar login.'
    });
  }
}

async function primeiroAcesso(req, res) {
  try {
    const { matricula, email, senha, novaSenha } = req.body;
    const senhaPrimeiroAcesso = senha || novaSenha;

    const { filtro, emailLimpo } = montarFiltroAluno({ matricula, email });
    const aluno = await Aluno.findOne(filtro).select('+senhaHash');

    if (!aluno) {
      return res.status(404).json({
        message: 'Aluno não encontrado.'
      });
    }

    if (emailLimpo && aluno.email !== emailLimpo) {
      return res.status(404).json({
        message: 'Aluno não encontrado.'
      });
    }

    if (aluno.senhaHash) {
      return res.status(400).json({
        message: 'Senha já cadastrada para este aluno.'
      });
    }

    aluno.senhaHash = senhaPrimeiroAcesso;
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
