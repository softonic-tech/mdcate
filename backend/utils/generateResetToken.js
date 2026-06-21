import crypto from "crypto";

const generateResetToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  return {
    token,
    hashedToken,
    expire: Date.now() + 60 * 60 * 1000, // 1 hour
  };
};

export default generateResetToken;
