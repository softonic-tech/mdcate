import cron from "node-cron";
import { generateAutoHighYield } from "./services/highYield.auto.service.js";
import User from "./models/user.model.js";
import { expireUserSubscription } from "./services/subscription.service.js";

cron.schedule("0 2 * * *", async () => {
  console.log("🔥 Auto generating high yield facts...");
  await generateAutoHighYield();
});

cron.schedule("0 * * * *", async () => {
  const now = new Date();
  const users = await User.find({
    role: { $ne: "admin" },
    "subscription.status": "active",
    "subscription.currentPeriodEndsAt": { $lte: now },
  });

  for (const user of users) {
    expireUserSubscription(user);
    await user.save({ validateBeforeSave: false });
  }

  if (users.length) {
    console.log(`⏱ Expired ${users.length} subscription(s)`);
  }
});