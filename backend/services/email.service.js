import sendEmail from "../utils/sendEmail.js";
import env from "../config/env.config.js";

export const sendResetPasswordEmail = async (email, token, name = "there") => {
  const resetUrl = `${env.FRONTEND_URL}/auth/reset-password?token=${token}`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0B1120;color:#E2E8F0;border-radius:12px;">
      <h2 style="color:#2DD4BF;margin-bottom:16px;">Password Reset</h2>
      <p>Hi ${name},</p>
      <p>You requested a password reset. Click the button below:</p>
      <a href="${resetUrl}"
         style="display:inline-block;margin:20px 0;padding:12px 32px;background:#0EA5A0;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
        Reset Password
      </a>
      <p style="font-size:13px;color:#64748B;">This link expires in 1 hour. If you did not request this, ignore this email.</p>
    </div>
  `;

  await sendEmail({ to: email, subject: "Reset your password - MedPrep Pro", html });
};

export const sendNotificationEmail = async (email, title, body) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0B1120;color:#E2E8F0;border-radius:12px;">
      <h2 style="color:#2DD4BF;margin-bottom:16px;">${title}</h2>
      <p>${body}</p>
    </div>
  `;

  await sendEmail({ to: email, subject: `${title} - MedPrep Pro`, html });
};
