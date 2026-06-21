import cron from "node-cron";
import { generateAutoHighYield } from "./services/highYield.auto.service.js";

cron.schedule("0 2 * * *", async () => {
  console.log("🔥 Auto generating high yield facts...");

  await generateAutoHighYield();
});