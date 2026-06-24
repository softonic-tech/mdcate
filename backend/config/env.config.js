import dotenv from "dotenv";
dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const ADMINPANEL_URL = process.env.ADMINPANEL_URL || "http://localhost:3001";

/** Origins allowed for REST + Socket.IO (comma-separated override via CORS_ORIGINS). */
function buildCorsOrigins() {
  if (process.env.CORS_ORIGINS) {
    return process.env.CORS_ORIGINS.split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  const base = [FRONTEND_URL, ADMINPANEL_URL];
  if ((process.env.NODE_ENV || "development") !== "production") {
    const ports = [3000, 3001, 3002, 3003, 3004, 3005, 5173, 8080, 4000, 4001, 4002, 4003];
    const local = ports.flatMap((p) => [`http://localhost:${p}`, `http://127.0.0.1:${p}`]);
    return [...new Set([...base, ...local])];
  }
  return base;
}

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,
  FRONTEND_URL,
  ADMINPANEL_URL,
  CORS_ORIGINS: buildCorsOrigins(),

  MONGODB_URI: process.env.MONGODB_URI,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || "7d",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || "30d",

  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  FROM_NAME: process.env.FROM_NAME || "medprep.study",

  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_BUCKET: process.env.AWS_BUCKET,

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  OAUTH_REDIRECT_URI: process.env.OAUTH_REDIRECT_URI,

  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET,
  FACEBOOK_REDIRECT_URI: process.env.FACEBOOK_REDIRECT_URI,

  RABBITMQ_URL: process.env.RABBITMQ_URL || "amqp://localhost:5672",

  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-4o-mini",
  OPENAI_WHISPER_MODEL: process.env.OPENAI_WHISPER_MODEL || "whisper-1",

  ADMIN_EMAIL: process.env.ADMIN_EMAIL,

  BACKEND_URL: process.env.BACKEND_URL,

  JAZZCASH_MERCHANT_ID: process.env.JAZZCASH_MERCHANT_ID,
  JAZZCASH_PASSWORD: process.env.JAZZCASH_PASSWORD,
  JAZZCASH_INTEGRITY_SALT: process.env.JAZZCASH_INTEGRITY_SALT,
  JAZZCASH_SUB_MERCHANT_ID: process.env.JAZZCASH_SUB_MERCHANT_ID,
  JAZZCASH_CHECKOUT_URL: process.env.JAZZCASH_CHECKOUT_URL,

  EASYPAISA_STORE_ID: process.env.EASYPAISA_STORE_ID,
  EASYPAISA_HASH_KEY: process.env.EASYPAISA_HASH_KEY,
  EASYPAISA_CHECKOUT_URL: process.env.EASYPAISA_CHECKOUT_URL,
};

const REQUIRED = ["MONGODB_URI", "JWT_SECRET"];
for (const key of REQUIRED) {
  if (!env[key]) {
    console.error(`Missing required env variable: ${key}`);
    process.exit(1);
  }
}

export default env;
