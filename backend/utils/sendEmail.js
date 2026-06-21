import transporter from "../config/mail.config.js";
import env from "../config/env.config.js";

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `${env.FROM_NAME} <${env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};

export default sendEmail;
