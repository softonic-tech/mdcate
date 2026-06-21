import Challenge from "../models/challenge.model.js";
import ApiError from "../utils/ApiError.js";

export const createChallenge = (data) => Challenge.create(data);

// export const getChallenges = (filters = {}) => {
//   const query = {};

//   if (filters.type) {
//     query.type = filters.type;
//   }

//   // FIXED SAFE FILTER
//   if (filters.active === "true") {
//     query.isActive = true;

//     // only apply date filter if endDate exists
//     query.$or = [
//       { endDate: { $gte: new Date() } },
//       { endDate: null },
//     ];
//   }

//   return Challenge.find(query).sort({ createdAt: -1 });
// };

export const getChallenges = (filters = {}) => {
  const query = {};

  if (filters.type) query.type = filters.type;

  if (filters.active === "true") {
    query.isActive = true;
  }

  return Challenge.find(query)
    
    .sort({ createdAt: -1 });
    // service

};
export const getChallengeById = async (id) => {
  const challenge = await Challenge.findById(id);
  if (!challenge) throw ApiError.notFound("Challenge not found");
  return challenge;
};

export const updateChallenge = async (id, data) => {
  const challenge = await Challenge.findByIdAndUpdate(id, data, { new: true });
  if (!challenge) throw ApiError.notFound("Challenge not found");
  return challenge;
};

export const deleteChallenge = async (id) => {
  const challenge = await Challenge.findByIdAndDelete(id);
  if (!challenge) throw ApiError.notFound("Challenge not found");
};
