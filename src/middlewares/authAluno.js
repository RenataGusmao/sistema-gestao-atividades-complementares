const jwt = require('jsonwebtoken');
const Aluno = require('../models/Aluno');

function cursoIdValor(curso) {
  return curso?._id || curso?.id || curso;
}

function agregarCursosPorEmail(alunos) {
  const cursosPorId = new Map();

  alunos.forEach((aluno) => {
    (aluno.cursos || []).forEach((item) => {
      const cursoId = cursoIdValor(item.cursoId);

      if (cursoId && !cursosPorId.has(String(cursoId))) {
        cursosPorId.set(String(cursoId), item);
      }
    });
  });

  return Array.from(cursosPorId.values());
}

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

    const aluno = await Aluno.findById(decoded.sub).populate('cursos.cursoId');

    if (!aluno || !aluno.ativo) {
      return res.status(401).json({
        message: 'Aluno não autorizado.'
      });
    }

    const alunosMesmoEmail = await Aluno.find({
      email: aluno.email,
      ativo: true
    }).populate('cursos.cursoId');

    aluno.cursos = agregarCursosPorEmail(alunosMesmoEmail);
    req.aluno = aluno;
    req.alunoIds = alunosMesmoEmail.map((item) => item._id);

    next();
  } catch (error) {
    console.error(error);

    return res.status(401).json({
      message: 'Token inválido.'
    });
  }
}

module.exports = authAluno;
