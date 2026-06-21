// ==================================
// services/examCountdown.service.js
// ==================================
import ExamCountdown from "../models/examCountdown.model.js";
import Notification from "../models/notification.model.js";

export const createExamService = async (data) => {
  const exam = await ExamCountdown.create(data);

  const examDate = new Date(exam.examDate);

  const reminders = [
    { days: 7, text: "7 days left" },
    { days: 1, text: "Tomorrow is your exam" },
  ];

  for (const item of reminders) {
    const sendAt = new Date(examDate);
    sendAt.setDate(sendAt.getDate() - item.days);

    await Notification.create({
      title: exam.title,
      message: item.text,
      type: "exam",
      sendAt,
    });
  }

  return exam;
};

export const getAllExamsService = async () => {
  return await ExamCountdown.find().sort({ examDate: 1 });
};