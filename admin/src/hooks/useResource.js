import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/lib/errors";

// ===== GENERIC HOOK FACTORY =====
// Produces useXList, useXById, useCreateX, useUpdateX, useDeleteX for any service
export function createResourceHooks(key, service) {
  const useList = (params, options = {}) =>
    useQuery({
      queryKey: [key, params],
      queryFn: () => service.getAll(params),
      ...options,
    });

  const useById = (id, options = {}) =>
    useQuery({
      queryKey: [key, id],
      queryFn: () => service.getById(id),
      enabled: !!id,
      ...options,
    });

  const useCreate = () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (data) => service.create(data),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [key] });
        toast.success("Created successfully");
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  };

  const useUpdate = () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: ({ id, data }) => service.update(id, data),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [key] });
        toast.success("Updated successfully");
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  };

  const useRemove = () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (id) => service.remove(id),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: [key] });
        toast.success("Deleted successfully");
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  };

  return { useList, useById, useCreate, useUpdate, useRemove };
}

// ===== RESOURCE HOOKS =====
import {
  subjectService, chapterService, questionService, testService,
  bookService, videoService, chapterVideoService, badgeService, challengeService,
  mnemonicService, highYieldFactService,
  examCountdownService, contactMessageService, performanceService,
  testAttemptService, userService, notificationService,
  leaderboardService, challengeAttemptService, pricingPlanService, paymentService,
} from "@/lib/services";

// Subjects
export const subjectHooks = createResourceHooks("subjects", subjectService);

// Questions
export const questionHooks = createResourceHooks("questions", questionService);

// Tests
export const testHooks = createResourceHooks("tests", testService);

// Books
export const bookHooks = createResourceHooks("books", bookService);

// Videos (AI summarizer)
export const videoHooks = createResourceHooks("videos", videoService);

// Chapter videos (S3 lectures)
export const chapterVideoHooks = createResourceHooks("chapterVideos", chapterVideoService);

// Badges
export const badgeHooks = createResourceHooks("badges", badgeService);

// Challenges
export const challengeHooks = createResourceHooks("challenges", challengeService);

// Mnemonics
export const mnemonicHooks = createResourceHooks("mnemonics", mnemonicService);

// High Yield Facts
export const highYieldFactHooks = createResourceHooks("highYieldFacts", highYieldFactService);

// Exam Countdowns
export const examCountdownHooks = createResourceHooks("examCountdowns", examCountdownService);

// Performance
export const performanceHooks = createResourceHooks("performance", performanceService);

// ===== SPECIAL HOOKS (non-standard CRUD) =====

// Chapters — keyed by subjectId
export function useChaptersBySubject(subjectId) {
  return useQuery({
    queryKey: ["chapters", subjectId],
    queryFn: () => chapterService.getBySubject(subjectId),
    enabled: !!subjectId,
  });
}

export function useCreateChapter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => chapterService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chapters"] });
      toast.success("Chapter created");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateChapter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => chapterService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chapters"] });
      toast.success("Chapter updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteChapter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => chapterService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chapters"] });
      toast.success("Chapter deleted");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// Users
export function useUsers(params) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => userService.getAll(params),
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }) => userService.updateRole(id, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("Role updated");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// Contact Messages
export function useContactMessages() {
  return useQuery({
    queryKey: ["contactMessages"],
    queryFn: () => contactMessageService.getAll(),
  });
}

export function useRespondToContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => contactMessageService.respond(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contactMessages"] });
      toast.success("Response sent");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => contactMessageService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contactMessages"] });
      toast.success("Message deleted");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// Notifications
export function useCreateNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => notificationService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification sent");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// Bulk Questions
export function useBulkCreateQuestions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (questions) => questionService.bulkCreate(questions),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["questions"] });
      toast.success("Questions imported");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function usePreviewMcqImport() {
  return useMutation({
    mutationFn: (formData) => questionService.previewFileImport(formData),
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useConfirmMcqImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => questionService.confirmFileImport(payload),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["questions"] });
      const created = res?.data?.created ?? res?.created ?? 0;
      const skipped = res?.data?.skipped ?? res?.skipped ?? 0;
      toast.success(`Imported ${created} questions (${skipped} skipped as duplicates)`);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// Test Attempts
export function useTestAttempts(params) {
  return useQuery({
    queryKey: ["testAttempts", params],
    queryFn: () => testAttemptService.getAll(params),
  });
}

export function useDeleteTestAttempt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => testAttemptService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["testAttempts"] });
      toast.success("Attempt deleted");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// Challenge Attempts
export function useChallengeAttempts() {
  return useQuery({
    queryKey: ["challengeAttempts"],
    queryFn: () => challengeAttemptService.getAll(),
  });
}

// Leaderboard
export function useLeaderboard(limit) {
  return useQuery({
    queryKey: ["leaderboard", limit],
    queryFn: () => leaderboardService.getTop(limit),
  });
}
// Notifications
export const notificationHooks = createResourceHooks(
  "notifications",
  notificationService
);

export const pricingPlanHooks = createResourceHooks("pricing-plans", pricingPlanService);

export const paymentHooks = {
  useList: () =>
    useQuery({
      queryKey: ["payments"],
      queryFn: () => paymentService.getAll(),
    }),
  useApprove: () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (id) => paymentService.approve(id),
      onSuccess: () => qc.invalidateQueries({ queryKey: ["payments"] }),
    });
  },
};