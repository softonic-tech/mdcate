import { OAuth2Client } from "google-auth-library";
import env from "../config/env.config.js";

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (idToken) => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
};
