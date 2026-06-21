import { startNotificationWorker } from "./notificationWorker.js";
import { startEmailWorker } from "./emailWorker.js";
import { startBadgeWorker } from "./badgeWorker.js";
import { startVideoWorker } from "./videoWorker.js";

export const startWorkers = async () => {
  await startNotificationWorker();
  await startEmailWorker();
  await startBadgeWorker();
  await startVideoWorker();
  console.log("All queue workers started");
};
