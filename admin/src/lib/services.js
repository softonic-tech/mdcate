import api from "./api";

// ===== GENERIC CRUD FACTORY =====
// Creates { getAll, getById, create, update, remove } for any resource
function createCrudService(basePath) {
  return {
    getAll: (params) => api.get(basePath, { params }).then((r) => r.data),
    getById: (id) => api.get(`${basePath}/${id}`).then((r) => r.data),
    create: (data) => api.post(basePath, data).then((r) => r.data),
    update: (id, data) => api.put(`${basePath}/${id}`, data).then((r) => r.data),
    remove: (id) => api.delete(`${basePath}/${id}`).then((r) => r.data),
  };
}

// ===== AUTH =====
export const authService = {
  login: (data) => api.post("/auth/login", data).then((r) => r.data),
  getMe: () => api.get("/auth/me").then((r) => r.data),
  logout: () => api.post("/auth/logout").then((r) => r.data),
};

// ===== USERS =====
export const userService = {
  getAll: (params) => api.get("/users/all", { params }).then((r) => r.data),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }).then((r) => r.data),
};

// ===== SUBJECTS =====
export const subjectService = createCrudService("/subjects");

// ===== CHAPTERS =====
export const chapterService = {
  getBySubject: (subjectId) => api.get(`/chapters/subject/${subjectId}`).then((r) => r.data),
  create: (data) => api.post("/chapters", data).then((r) => r.data),
  update: (id, data) => api.put(`/chapters/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/chapters/${id}`).then((r) => r.data),
};

// ===== QUESTIONS =====
export const questionService = {
  ...createCrudService("/questions"),
  bulkCreate: (questions) => api.post("/questions/bulk", { questions }).then((r) => r.data),
};

// ===== TESTS =====
export const testService = createCrudService("/tests");

// ===== BOOKS =====
const formDataConfig = {
  transformRequest: [
    (data, headers) => {
      if (data instanceof FormData) {
        delete headers["Content-Type"];
      }
      return data;
    },
  ],
};

export const bookService = {
  getAll: (params) => api.get("/books", { params }).then((r) => r.data),
  getById: (id) => api.get(`/books/${id}`).then((r) => r.data),
  create: (data) =>
    data instanceof FormData
      ? api.post("/books", data, formDataConfig).then((r) => r.data)
      : api.post("/books", data).then((r) => r.data),
  update: (id, data) =>
    data instanceof FormData
      ? api.put(`/books/${id}`, data, formDataConfig).then((r) => r.data)
      : api.put(`/books/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/books/${id}`).then((r) => r.data),
};

// ===== VIDEOS =====
export const videoService = createCrudService("/videos");

// ===== BADGES =====
export const badgeService = createCrudService("/badges");

// ===== CHALLENGES =====
export const challengeService = createCrudService("/challenges");

// ===== CHALLENGE ATTEMPTS =====
export const challengeAttemptService = {
  getAll: () => api.get("/challenge-attempts/all").then((r) => r.data),
};

// ===== COUNSELING SESSIONS =====
export const counselingService = createCrudService("/counseling-sessions");

// ===== MNEMONICS =====
export const mnemonicService = createCrudService("/mnemonics");

// ===== HIGH YIELD FACTS =====
export const highYieldFactService = createCrudService("/high-yield-facts");

// ===== EXAM COUNTDOWNS =====
export const examCountdownService = {
  getAll: () => api.get("/exam-countdowns").then((r) => r.data),
  create: (data) => api.post("/exam-countdowns", data).then((r) => r.data),
  update: (id, data) => api.put(`/exam-countdowns/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/exam-countdowns/${id}`).then((r) => r.data),
};

// ===== CONTACT MESSAGES =====
export const contactMessageService = {
  getAll: () => api.get("/contact/messages").then((r) => r.data),
  respond: (id, data) => api.put(`/contact/${id}/respond`, data).then((r) => r.data),
  remove: (id) => api.delete(`/contact/${id}`).then((r) => r.data),
};

// ===== NOTIFICATIONS =====
export const notificationService = {
  getAll: (params) =>
    api.get("/notifications", { params }).then(r => r.data),

  getById: (id) =>
    api.get(`/notifications/${id}`).then(r => r.data),

  create: (data) =>
    api.post("/notifications", data).then(r => r.data),

  update: (id, data) =>
    api.put(`/notifications/${id}`, data).then(r => r.data),

  remove: (id) =>
    api.delete(`/notifications/${id}`).then(r => r.data),

  markAsRead: (id) =>
    api.patch(`/notifications/${id}/read`).then(r => r.data),

  markAllRead: () =>
    api.patch("/notifications/read-all").then(r => r.data),
};

// ===== PERFORMANCE =====
export const performanceService = {
  getAll: () => api.get("/performance").then((r) => r.data),
  remove: (id) => api.delete(`/performance/${id}`).then((r) => r.data),
};

// ===== TEST ATTEMPTS =====
export const testAttemptService = {
  getAll: (params) => api.get("/test-attempts", { params }).then((r) => r.data),
  remove: (id) => api.delete(`/test-attempts/${id}`).then((r) => r.data),
};

// ===== LEADERBOARD =====
export const leaderboardService = {
  getTop: (limit = 10) => api.get("/leaderboard/top", { params: { limit } }).then((r) => r.data),
};
