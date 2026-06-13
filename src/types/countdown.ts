export type CountdownMode = "countdown" | "stopwatch";

export type RepeatRule = "none" | "daily" | "weekly" | "monthly" | "yearly";

export type SortField = "targetTime" | "createdAt" | "mode" | "name" | "group";
export type SortOrder = "asc" | "desc";

export interface Group {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface ReminderRecord {
  type: "target" | "advance";
  triggeredAt: number;
  advanceMinutes?: number;
}

export interface Countdown {
  id: string;
  name: string;
  targetTime: string;
  backgroundColor: string;
  mode: CountdownMode;
  groupId: string | null;
  tags: string[];
  isPaused: boolean;
  pausedAt: number | null;
  frozenRemainingMs: number | null;
  frozenElapsedMs: number | null;
  createdAt: string;
  advanceReminderMinutes: number[];
  repeatRule: RepeatRule;
  repeatCount: number;
  reminderHistory: ReminderRecord[];
  importId: string;
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  totalMs: number;
}

export const PRESET_GROUPS: Group[] = [
  { id: "work", name: "工作", color: "#3b82f6", icon: "💼" },
  { id: "life", name: "生活", color: "#10b981", icon: "🏠" },
  { id: "anniversary", name: "纪念日", color: "#ef4444", icon: "❤️" },
  { id: "study", name: "学习", color: "#8b5cf6", icon: "📚" },
  { id: "health", name: "健康", color: "#f59e0b", icon: "💪" },
  { id: "other", name: "其他", color: "#6b7280", icon: "📌" },
];

export const PRESET_COLORS = [
  { id: "aurora", name: "极光紫", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", glow: "rgba(102, 126, 234, 0.5)" },
  { id: "sunset", name: "日落橙", value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", glow: "rgba(245, 87, 108, 0.5)" },
  { id: "ocean", name: "深海蓝", value: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", glow: "rgba(79, 172, 254, 0.5)" },
  { id: "forest", name: "森林绿", value: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", glow: "rgba(67, 233, 123, 0.5)" },
  { id: "midnight", name: "午夜蓝", value: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)", glow: "rgba(48, 43, 99, 0.6)" },
  { id: "fire", name: "烈焰红", value: "linear-gradient(135deg, #f12711 0%, #f5af19 100%)", glow: "rgba(241, 39, 17, 0.5)" },
  { id: "lavender", name: "薰衣草", value: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", glow: "rgba(168, 237, 234, 0.5)" },
  { id: "dark", name: "暗夜黑", value: "linear-gradient(135deg, #232526 0%, #414345 100%)", glow: "rgba(65, 67, 69, 0.5)" },
];

export const ADVANCE_REMINDER_OPTIONS = [
  { value: 0, label: "不提前提醒" },
  { value: 5, label: "提前 5 分钟" },
  { value: 10, label: "提前 10 分钟" },
  { value: 30, label: "提前 30 分钟" },
  { value: 60, label: "提前 1 小时" },
  { value: 120, label: "提前 2 小时" },
  { value: 1440, label: "提前 1 天" },
  { value: 10080, label: "提前 1 周" },
];

export const REPEAT_OPTIONS = [
  { value: "none", label: "只提醒一次" },
  { value: "daily", label: "每天重复" },
  { value: "weekly", label: "每周重复" },
  { value: "monthly", label: "每月重复" },
  { value: "yearly", label: "每年重复" },
];
