const AppError = require('../utils/AppError');

const BREVO_EMAIL_URL = 'https://api.brevo.com/v3/smtp/email';

function assertBrevoConfig() {
  const missing = ['BREVO_API_KEY', 'MAIL_FROM_EMAIL']
    .filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new AppError(`Envio de e-mail nao configurado. Defina: ${missing.join(', ')}.`, 500);
  }
}

function normalizarDestinatarios(to) {
  if (Array.isArray(to)) {
    return to
      .filter(Boolean)
      .map((email) => ({ email: String(email).trim() }))
      .filter((destinatario) => destinatario.email);
  }

  return String(to || '')
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean)
    .map((email) => ({ email }));
}

async function lerRespostaBrevo(res) {
  const texto = await res.text().catch(() => '');

  if (!texto) return {};

  try {
    return JSON.parse(texto);
  } catch {
    return { message: texto };
  }
}

async function enviarEmail({ to, subject, text }) {
  try {
    if (!to) {
      return null;
    }

    assertBrevoConfig();

    const destinatarios = normalizarDestinatarios(to);

    if (destinatarios.length === 0) {
      return null;
    }

    const res = await fetch(BREVO_EMAIL_URL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          email: process.env.MAIL_FROM_EMAIL,
          name: process.env.MAIL_FROM_NAME || 'Sistema Academico'
        },
        to: destinatarios,
        subject,
        textContent: text
      })
    });

    const data = await lerRespostaBrevo(res);

    if (!res.ok) {
      const erro = new Error(data.message || `Brevo retornou status ${res.status}.`);
      erro.statusCode = res.status;
      erro.response = data;
      throw erro;
    }

    console.info('[EMAIL] E-mail enviado pela Brevo:', data.messageId || 'sem messageId');
    return data;
  } catch (error) {
    console.error('[EMAIL] Erro ao enviar e-mail:', error.message, error.response || '');
    throw error;
  }
}

module.exports = { enviarEmail };
