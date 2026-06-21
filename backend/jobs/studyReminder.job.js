import StudyPlan from "../models/studyPlan.model.js";
import Notification from "../models/notification.model.js";

export const runStudyReminders = async () => {
  const plans = await StudyPlan.find();

  for (const plan of plans) {
    const key = `study-${plan._id}-${new Date().toDateString()}`;

    const exists = await Notification.findOne({
      "metadata.reminderKey": key,
    });

    if (exists) continue;

    await Notification.create({
      type: "reminder",
      sourceType: "study",
      sourceId: plan._id,
      title: "Study Plan Reminder",
      message: `Don't forget your daily goal: ${plan.dailyGoal} minutes`,
      metadata: { reminderKey: key },
    });
  }
};