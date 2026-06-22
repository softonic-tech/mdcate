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

export const getExamsWithCountdown = async () => {
  const exams = await ExamCountdown.find().sort({ examDate: 1 }).lean();
  const now = Date.now();

  return exams.map((exam) => {
    const examDate = new Date(exam.examDate).getTime();
    const daysRemaining = Math.ceil((examDate - now) / (1000 * 60 * 60 * 24));
    return { ...exam, daysRemaining };
  });
};

export const updateExam = async (id, data) => {
  return ExamCountdown.findByIdAndUpdate(id, data, { new: true });
};

export const deleteExam = async (id) => {
  return ExamCountdown.findByIdAndDelete(id);
};