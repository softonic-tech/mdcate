import StudyPlan from "../models/studyPlan.model.js";

/**
 * Drops the legacy unique index on userId (one plan per user).
 * Current schema allows multiple plans per user.
 */
export async function fixStudyPlanIndexes() {
  const collection = StudyPlan.collection;
  const indexes = await collection.indexes();

  for (const index of indexes) {
    const isLegacyUniqueUserIndex =
      index.unique &&
      index.key &&
      Object.keys(index.key).length === 1 &&
      index.key.userId === 1;

    if (isLegacyUniqueUserIndex) {
      await collection.dropIndex(index.name);
      console.log(`Dropped legacy StudyPlan index: ${index.name}`);
    }
  }

  await StudyPlan.syncIndexes();
}
