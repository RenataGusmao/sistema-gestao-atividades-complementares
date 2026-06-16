const { enviarEmail } = require('./email.service');

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

module.exports = {
  notificarAlunoStatusAtividade
};
