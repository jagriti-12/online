import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || 'no-reply@example.com';

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  // In dev, we won't crash; routes can handle missing SMTP
  console.warn('SMTP configuration is incomplete. Forgot password emails will not be sent.');
}

export function getTransport() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const transport = getTransport();
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Reset your password</h2>
      <p>We received a request to reset your password. Click the link below to set a new password. This link will expire in 60 minutes.</p>
      <p><a href="${resetUrl}" style="background:#ec4899;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;">Reset Password</a></p>
      <p>If the button doesn't work, copy and paste this URL into your browser:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you didn't request this, you can ignore this email.</p>
    </div>
  `;

  const text = `Reset your password:\n${resetUrl}\nThis link expires in 60 minutes.`;

  await transport.sendMail({
    from: SMTP_FROM,
    to,
    subject: 'Reset your password',
    text,
    html,
  });
}