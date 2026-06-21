import {
  LayoutDashboard, Users, BookOpen, Layers, HelpCircle, ClipboardList,
  Library, Video, Award, Swords, CalendarHeart, Brain, Zap, CalendarClock,
  MessageSquare, Bell, BarChart3,
} from "lucide-react";

export const SIDEBAR_LINKS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Subjects", href: "/admin/subjects", icon: BookOpen },
  { label: "Chapters", href: "/admin/chapters", icon: Layers },
  { label: "Questions", href: "/admin/questions", icon: HelpCircle },
  { label: "Tests", href: "/admin/tests", icon: ClipboardList },
  { label: "Books", href: "/admin/books", icon: Library },
  { label: "Videos", href: "/admin/videos", icon: Video },
  { label: "Badges", href: "/admin/badges", icon: Award },
  { label: "Challenges", href: "/admin/challenges", icon: Swords },
  { label: "Counseling", href: "/admin/counseling", icon: CalendarHeart },
  { label: "Mnemonics", href: "/admin/mnemonics", icon: Brain },
  { label: "High-Yield Facts", href: "/admin/high-yield-facts", icon: Zap },
  { label: "Exam Countdowns", href: "/admin/exam-countdowns", icon: CalendarClock },
  { label: "Contact Messages", href: "/admin/contact-messages", icon: MessageSquare },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Performance", href: "/admin/performance", icon: BarChart3 },
];

export const BOARDS = ["KPK", "Punjab", "Federal"];

export const DIFFICULTIES = ["easy", "medium", "hard"];

export const TEST_TYPES = ["mock", "quiz", "adaptive", "pastPaper"];

export const QUESTION_COUNTS = [1, 5, 10, 30, 50, 100];

export const CHALLENGE_TYPES = ["daily", "weekly"];

export const CHALLENGE_CONTENT_TYPES = ["quiz", "miniTest"];

export const BADGE_CRITERIA_TYPES = ["login_streak", "quiz_completion", "high_score", "points_threshold", "custom"];

export const NOTIFICATION_TYPES = ["reminder", "exam", "achievement", "system", "challenge"];

export const CONTACT_STATUSES = ["pending", "resolved"];
