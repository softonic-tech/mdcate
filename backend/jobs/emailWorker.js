import { consumeFromQueue, QUEUES } from "../config/rabbitmq.config.js";
import { sendNotificationEmail } from "../services/email.service.js";
import User from "../models/user.model.js";

export const startEmailWorker = async () => {
  await consumeFromQueue(QUEUES.EMAIL, async (data) => {
    const { userId, email, title, body } = data;

    let targetEmail = email;
    if (!targetEmail && userId) {
      const user = await User.findById(userId).select("email");
      if (user) targetEmail = user.email;
    }

    if (targetEmail) {
      await sendNotificationEmail(targetEmail, title, body);
    }
  });

  console.log("Email worker started");
};
