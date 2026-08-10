import nodemailer from "nodemailer";

export type SmtpMail = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

function smtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const from =
    process.env.SMTP_FROM?.trim() ||
    process.env.CONTACT_TO?.trim() ||
    user ||
    "";

  if (!host || !user || !pass || !from) {
    return null;
  }

  return {
    host,
    port: Number.isFinite(port) ? port : 587,
    user,
    pass,
    from,
    secure: port === 465,
  };
}

export function isSmtpConfigured() {
  return smtpConfig() !== null;
}

export async function sendSmtpMail(mail: SmtpMail) {
  const cfg = smtpConfig();
  if (!cfg) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM in .env.local.",
    );
  }

  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: {
      user: cfg.user,
      pass: cfg.pass,
    },
  });

  const info = await transporter.sendMail({
    from: cfg.from,
    to: mail.to,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
    replyTo: mail.replyTo,
  });

  return info;
}
