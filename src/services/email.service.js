const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.MAIL_HOST,
  port:   Number(process.env.MAIL_PORT) || 587,
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function enviarEmail({ to, subject, text }) {
  await transporter.sendMail({
    from: `Sistema Acadêmico <${process.env.MAIL_USER}>`,
    to,
    subject,
    text
  });
}

module.exports = { enviarEmail };