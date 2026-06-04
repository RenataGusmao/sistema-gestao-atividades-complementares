const jwt = require('jsonwebtoken');
const Aluno = require('../models/Aluno');

async function authAluno(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: 'Token não informado.'
      });
    }

    const [, token] = authHeader.split(' ');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.perfil !== 'aluno') {
      return res.status(403).json({
        message: 'Acesso não autorizado.'
      });
    }

    const aluno = await Aluno.findById(decoded.sub);

    if (!aluno || !aluno.ativo) {
      return res.status(401).json({
        message: 'Aluno não autorizado.'
      });
    }

    req.aluno = aluno;

    next();

  } catch (error) {
    console.error(error);

    return res.status(401).json({
      message: 'Token inválido.'
    });
  }
}

module.exports = authAluno;
