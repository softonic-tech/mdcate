import StudyPlan from "../models/studyPlan.model.js";
import Notification from "../models/notification.model.js";

// CREATE
export const createStudyPlanService = async (userId, data) => {
  const plan = await StudyPlan.create({
    title: data.title,
    deadline: data.deadline,
    userId,
    status: "pending",
  });

  const deadline = new Date(plan.deadline);

  const reminders = [
    { hours: 24, text: "1 day left for your task" },
    { hours: 2, text: "2 hours left for your task" },
    { hours: 1, text: "1 hour left for your task" },
  ];

  for (const item of reminders) {
    const sendAt = new Date(deadline);
    sendAt.setHours(sendAt.getHours() - item.hours);

    await Notification.create({
      userId,
      title: plan.title,
      message: item.text,
      type: "study",
      sendAt,
    });
  }

  return plan;
};

// GET
export const getMyStudyPlansService = async (userId) => {
  return await StudyPlan.find({ userId }).sort({ createdAt: -1 });
};

// UPDATE
export const updateStudyPlan = async (userId, id, data) => {
  return await StudyPlan.findOneAndUpdate(
    { _id: id, userId },
    data,
    { new: true }
  );
};

// DELETE
export const deleteStudyPlan = async (userId, id) => {
  return await StudyPlan.findOneAndDelete({
    _id: id,
    userId,
  });
};