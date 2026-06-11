const nodemailer = require('nodemailer');

function boolEnv(value) {
  return String(value || '').trim().toLowerCase() === 'true';
}

function getEmailConfig() {
  return {
    host: process.env.SMTP_HOST || process.env.MAIL_HOST || process.env.EMAIL_HOST,
    port: Number(process.env.SMTP_PORT || process.env.MAIL_PORT || process.env.EMAIL_PORT || 587),
    secure: boolEnv(process.env.SMTP_SECURE || process.env.MAIL_SECURE || process.env.EMAIL_SECURE),
    user: process.env.SMTP_USER || process.env.MAIL_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.MAIL_PASS || process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || process.env.MAIL_FROM || process.env.SMTP_FROM || process.env.SMTP_USER || process.env.MAIL_USER || process.env.EMAIL_USER
  };
}

function isEmailConfigured(config = getEmailConfig()) {
  return Boolean(config.host && config.port && config.user && config.pass && config.from);
}

let transporterCache = null;
let transporterKey = '';

function getTransporter() {
  const config = getEmailConfig();

  if (!isEmailConfigured(config)) {
    return null;
  }

  const key = JSON.stringify({
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.user,
    from: config.from
  });

  if (!transporterCache || transporterKey !== key) {
    transporterCache = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass
      }
    });
    transporterKey = key;
  }

  return transporterCache;
}

async function enviarEmail({ to, subject, text, html, replyTo }) {
  const config = getEmailConfig();
  const transporter = getTransporter();

  if (!transporter) {
    console.warn('[email] SMTP nao configurado. E-mail nao enviado:', { to, subject });
    return { skipped: true, reason: 'SMTP_NOT_CONFIGURED' };
  }

  const destinatarios = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);

  if (destinatarios.length === 0) {
    return { skipped: true, reason: 'EMPTY_RECIPIENTS' };
  }

  return transporter.sendMail({
    from: config.from,
    to: destinatarios.join(', '),
    subject,
    text,
    html,
    replyTo
  });
}

module.exports = {
  enviarEmail,
  isEmailConfigured
};