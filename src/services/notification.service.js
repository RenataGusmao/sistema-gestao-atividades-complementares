const Aluno = require('../models/Aluno');
const Curso = require('../models/Curso');
const CategoriaAtividade = require('../models/CategoriaAtividade');
const Usuario = require('../models/Usuario');
const { enviarEmail } = require('./email.service');

function texto(valor, fallback = '-') {
  return valor === undefined || valor === null || valor === '' ? fallback : String(valor);
}

function formatarHoras(valor) {
  return valor === undefined || valor === null || valor === '' ? '-' : `${valor}h`;
}

function montarHtml({ titulo, linhas = [], mensagem }) {
  const rows = linhas.map(([label, value]) => `
    <tr>
      <td style="padding:6px 12px 6px 0;color:#475569;font-weight:600;vertical-align:top;">${label}</td>
      <td style="padding:6px 0;color:#0f172a;">${texto(value)}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a;">
      <h2 style="margin:0 0 12px;">${titulo}</h2>
      ${mensagem ? `<p style="margin:0 0 16px;">${mensagem}</p>` : ''}
      <table style="border-collapse:collapse;">${rows}</table>
      <p style="margin-top:18px;color:#64748b;font-size:13px;">Mensagem enviada automaticamente pelo KORE.</p>
    </div>
  `;
}

async function buscarContextoAtividade(atividade) {
  const [aluno, curso, categoria] = await Promise.all([
    Aluno.findById(atividade.alunoId).lean(),
    Curso.findById(atividade.cursoId).lean(),
    CategoriaAtividade.findById(atividade.categoriaId).lean()
  ]);

  return { aluno, curso, categoria };
}

async function notificarAlunoStatusAtividade(atividade) {
  try {
    const { aluno, curso, categoria } = await buscarContextoAtividade(atividade);

    if (!aluno?.email) return;

    const status = texto(atividade.status);
    const assunto = `KORE - Atividade ${status.toLowerCase()}`;
    const linhas = [
      ['Aluno', aluno.nome],
      ['Atividade', atividade.titulo],
      ['Curso', curso?.nome],
      ['Categoria', categoria?.nome],
      ['Status', status],
      ['Horas informadas', formatarHoras(atividade.cargaHorariaInformada)],
      ['Horas validadas', formatarHoras(atividade.cargaHorariaValidada)],
      ['Observacao', atividade.observacaoCoordenador],
      ['Justificativa', atividade.justificativaReprovacao]
    ];

    await enviarEmail({
      to: aluno.email,
      subject: assunto,
      text: linhas.map(([label, value]) => `${label}: ${texto(value)}`).join('\n'),
      html: montarHtml({
        titulo: assunto,
        mensagem: 'Houve uma atualizacao na sua atividade complementar.',
        linhas
      })
    });
  } catch (error) {
    console.warn('[email] Falha ao notificar aluno sobre status da atividade:', error.message);
  }
}

async function notificarCoordenadoresNovaAtividade(atividade) {
  try {
    const { aluno, curso, categoria } = await buscarContextoAtividade(atividade);

    const coordenadores = await Usuario.find({
      ativo: true,
      perfis: 'coordenador',
      'cursosCoordenados.cursoId': atividade.cursoId
    }).select('nome email').lean();

    const emails = coordenadores.map((coordenador) => coordenador.email).filter(Boolean);
    if (emails.length === 0) return;

    const assunto = 'KORE - Nova atividade enviada para analise';
    const linhas = [
      ['Aluno', aluno?.nome],
      ['E-mail do aluno', aluno?.email],
      ['Atividade', atividade.titulo],
      ['Curso', curso?.nome],
      ['Categoria', categoria?.nome],
      ['Horas informadas', formatarHoras(atividade.cargaHorariaInformada)],
      ['Status', atividade.status]
    ];

    await enviarEmail({
      to: emails,
      subject: assunto,
      text: linhas.map(([label, value]) => `${label}: ${texto(value)}`).join('\n'),
      html: montarHtml({
        titulo: assunto,
        mensagem: 'Um aluno enviou uma nova atividade complementar para validacao.',
        linhas
      })
    });
  } catch (error) {
    console.warn('[email] Falha ao notificar coordenadores sobre nova atividade:', error.message);
  }
}

module.exports = {
  notificarAlunoStatusAtividade,
  notificarCoordenadoresNovaAtividade
};