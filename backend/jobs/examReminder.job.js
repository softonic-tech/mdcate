import ExamCountdown from "../models/examCountdown.model.js";
import Notification from "../models/notification.model.js";

export const runExamReminders = async () => {
  const exams = await ExamCountdown.find({ isActive: true });

  for (const exam of exams) {
    const daysLeft = Math.ceil(
      (new Date(exam.examDate) - Date.now()) / (1000 * 60 * 60 * 24)
    );

    const validDays = [7, 3, 1, 0];
    if (!validDays.includes(daysLeft)) continue;

    const key = `${exam._id}-${daysLeft}`;

    const exists = await Notification.findOne({
      "metadata.reminderKey": key,
    });

    if (exists) continue;

    await Notification.create({
      type: "exam",
      sourceType: "exam",
      sourceId: exam._id,
      title: "Exam Reminder",
      message: `${daysLeft} days left for ${exam.title}`,
      metadata: { reminderKey: key },
    });
  }
};