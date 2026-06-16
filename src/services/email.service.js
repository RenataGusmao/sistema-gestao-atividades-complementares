const nodemailer = require('nodemailer');
const AppError = require('../utils/AppError');

let transporter = null;

function assertMailConfig() {
  const missing = ['MAIL_HOST', 'MAIL_USER', 'MAIL_PASS']
    .filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new AppError(`Envio de e-mail nao configurado. Defina: ${missing.join(', ')}.`, 500);
  }
}

function getTransporter() {
  assertMailConfig();

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT) || 587,
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  return transporter;
}

async function enviarEmail({ to, subject, text }) {
  try {
    if (!to) {
      return null;
    }

    return await getTransporter().sendMail({
      from: process.env.MAIL_FROM || `Sistema Academico <${process.env.MAIL_USER}>`,
      to,
      subject,
      text
    });
  } catch (error) {
    console.error('[EMAIL] Erro ao enviar e-mail:', error.message);
    throw error;
  }
}

module.exports = { enviarEmail };
