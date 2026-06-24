import client from "./client";

export const getLearnSubjectsApi = () => client.get("/learning/subjects");

export const getLearnChaptersApi = (subjectId) =>
  client.get(`/learning/subjects/${subjectId}/chapters`);

export const getLearnSectionsApi = (chapterId) =>
  client.get(`/learning/chapters/${chapterId}/sections`);

export const saveLearnSectionProgressApi = (chapterId, sectionIndex, payload) =>
  client.put(
    `/learning/chapters/${chapterId}/sections/${sectionIndex}/progress`,
    payload
  );

export const completeLearnSectionApi = (chapterId, sectionIndex, payload) =>
  client.post(
    `/learning/chapters/${chapterId}/sections/${sectionIndex}/complete`,
    payload
  );
