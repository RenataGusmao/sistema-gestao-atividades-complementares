const { enviarEmail } = require('./email.service');
const Usuario = require('../models/Usuario');

function formatarHoras(valor) {
  const numero = Number(valor || 0);
  return Number.isInteger(numero) ? String(numero) : numero.toFixed(1).replace('.', ',');
}

function assuntoStatus(status) {
  return `Atualizacao da atividade - ${status}`;
}

function montarTextoAluno({ aluno, atividade, status, justificativaReprovacao }) {
  const nomeAluno = aluno?.nome || 'aluno(a)';
  const titulo = atividade?.titulo || 'Atividade complementar';

  if (status === 'Aprovada') {
    return `Ola ${nomeAluno},

Sua atividade "${titulo}" foi aprovada.

Carga horaria validada: ${formatarHoras(atividade.cargaHorariaValidada)} horas.

Atenciosamente,
Sistema Academico`;
  }

  if (status === 'Reprovada') {
    return `Ola ${nomeAluno},

Sua atividade "${titulo}" foi reprovada.

Justificativa:
${justificativaReprovacao || 'Nao informada.'}

Atenciosamente,
Sistema Academico`;
  }

  return `Ola ${nomeAluno},

Sua atividade "${titulo}" esta em analise.

Atenciosamente,
Sistema Academico`;
}

async function notificarAlunoStatusAtividade({ aluno, atividade, status, justificativaReprovacao }) {
  if (!aluno?.email) {
    console.warn('[EMAIL] Aluno sem e-mail cadastrado. Notificacao de status nao enviada.');
    return false;
  }

  await enviarEmail({
    to: aluno.email,
    subject: assuntoStatus(status),
    text: montarTextoAluno({ aluno, atividade, status, justificativaReprovacao })
  });

  return true;
}

async function buscarEmailsResponsaveisCurso(cursoId) {
  const usuarios = await Usuario.find({
    ativo: true,
    $or: [
      { perfis: 'administrador' },
      { perfis: 'coordenador', 'cursosCoordenados.cursoId': cursoId }
    ]
  }).select('email');

  return [...new Set(usuarios.map((usuario) => usuario.email).filter(Boolean))];
}

function montarTextoNovaAtividade({ aluno, curso, atividade }) {
  return `Uma nova atividade complementar foi submetida e aguarda analise.

Aluno: ${aluno?.nome || 'N/A'}
Curso: ${curso?.nome || 'N/A'}
Titulo: ${atividade?.titulo || 'N/A'}
Carga horaria informada: ${formatarHoras(atividade?.cargaHorariaInformada)} horas

Acesse o sistema para aprovar ou reprovar a atividade.

Atenciosamente,
Sistema Academico`;
}

async function notificarResponsaveisNovaAtividade({ aluno, curso, atividade }) {
  const emails = await buscarEmailsResponsaveisCurso(atividade?.cursoId || curso?._id || curso?.id);

  if (emails.length === 0) {
    console.warn('[EMAIL] Nenhum responsavel encontrado para notificar nova atividade.');
    return false;
  }

  await enviarEmail({
    to: emails,
    subject: `Nova atividade submetida - ${curso?.nome || 'Curso'}`,
    text: montarTextoNovaAtividade({ aluno, curso, atividade })
  });

  return true;
}

module.exports = {
  notificarAlunoStatusAtividade,
  notificarResponsaveisNovaAtividade
};
