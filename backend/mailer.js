// backend/mailer.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function enviarEmail({ para, assunto, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"EcoGestão 🌿" <${process.env.EMAIL_USER}>`,
      to: para,
      subject: assunto,
      html
    });
    console.log('📧 E-mail enviado:', info.messageId);
    return { sucesso: true, messageId: info.messageId };
  } catch (erro) {
    console.error('❌ Erro ao enviar e-mail:', erro.message);
    return { sucesso: false, erro: erro.message };
  }
}

async function enviarAlertaVencimento(destinatario, licenca) {
  const diasRestantes = Math.ceil(
    (new Date(licenca.vencimento) - new Date()) / (1000 * 60 * 60 * 24)
  );

  let corDestaque = '#16a34a';
  let emoji = '🟢';
  let statusTexto = 'No prazo';

  if (diasRestantes < 0) {
    corDestaque = '#dc2626'; emoji = '🔴';
    statusTexto = `VENCIDA há ${Math.abs(diasRestantes)} dias`;
  } else if (diasRestantes <= 7) {
    corDestaque = '#dc2626'; emoji = '🔴';
    statusTexto = `URGENTE — vence em ${diasRestantes} dias`;
  } else if (diasRestantes <= 15) {
    corDestaque = '#f59e0b'; emoji = '🟡';
    statusTexto = `ATENÇÃO — vence em ${diasRestantes} dias`;
  } else {
    corDestaque = '#f97316'; emoji = '🟠';
    statusTexto = `Próxima — vence em ${diasRestantes} dias`;
  }

  const assunto = `${emoji} Alerta: Licença ${licenca.numero} — ${statusTexto}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f7f9fa; padding: 20px;">
      <div style="background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <div style="background: #1e5631; color: #fff; padding: 25px 30px;">
          <h1 style="margin: 0; font-size: 1.4rem;">🌿 EcoGestão</h1>
          <p style="margin: 5px 0 0; opacity: 0.85; font-size: 0.9rem;">Alerta de vencimento</p>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: ${corDestaque}; margin-top: 0;">${emoji} ${statusTexto}</h2>
          <p style="color: #4a5568;">A seguinte licença precisa da sua atenção:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #fafbfc; border-radius: 8px;">
            <tr><td style="padding: 12px 15px; font-weight: 600; color: #4a5568; width: 40%;">Número:</td><td style="padding: 12px 15px;">${licenca.numero}</td></tr>
            <tr><td style="padding: 12px 15px; font-weight: 600; color: #4a5568; border-top: 1px solid #eee;">Cliente:</td><td style="padding: 12px 15px; border-top: 1px solid #eee;">${licenca.cliente || '-'}</td></tr>
            <tr><td style="padding: 12px 15px; font-weight: 600; color: #4a5568; border-top: 1px solid #eee;">Órgão:</td><td style="padding: 12px 15px; border-top: 1px solid #eee;">${licenca.orgao || '-'}</td></tr>
            <tr><td style="padding: 12px 15px; font-weight: 600; color: #4a5568; border-top: 1px solid #eee;">Vencimento:</td><td style="padding: 12px 15px; border-top: 1px solid #eee; font-weight: 700; color: ${corDestaque};">${new Date(licenca.vencimento).toLocaleDateString('pt-BR')}</td></tr>
            <tr><td style="padding: 12px 15px; font-weight: 600; color: #4a5568; border-top: 1px solid #eee;">Dias restantes:</td><td style="padding: 12px 15px; border-top: 1px solid #eee; font-weight: 700; color: ${corDestaque};">${diasRestantes < 0 ? Math.abs(diasRestantes) + ' atrás' : diasRestantes + ' dias'}</td></tr>
          </table>
          <p style="color: #718096; font-size: 0.9rem;">Providencie a renovação antes do prazo para evitar multas.</p>
          <a href="http://localhost:5173/licencas" style="display: inline-block; background: #1e5631; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-top: 10px;">Ver no sistema →</a>
        </div>
        <div style="background: #fafbfc; padding: 15px 30px; text-align: center; color: #94a3b8; font-size: 0.75rem; border-top: 1px solid #eee;">
          E-mail automático do sistema EcoGestão. Não responda.
        </div>
      </div>
    </div>
  `;

  return enviarEmail({ para: destinatario, assunto, html });
}

module.exports = { enviarEmail, enviarAlertaVencimento };