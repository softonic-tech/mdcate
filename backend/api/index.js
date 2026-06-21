import app from "../app.js";
import { connectDB } from "../config/db.config.js";

let connected = false;

export default async function handler(req, res) {
  if (!connected) {
    await connectDB();
    connected = true;
  }
  return app(req, res);
}
