import nodemailer from "nodemailer";
import env from "./env.config.js";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: Number(env.SMTP_PORT) === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export default transporter;
