import type { Countdown, TimeLeft, RepeatRule } from "@/types/countdown";

export function calculateTimeLeft(countdown: Countdown, now: number = Date.now()): TimeLeft {
  const target = new Date(countdown.targetTime).getTime();
  let diff: number;

  if (countdown.mode === "countdown") {
    if (countdown.isPaused && countdown.frozenRemainingMs !== null) {
      diff = countdown.frozenRemainingMs;
    } else {
      diff = target - now;
    }
  } else {
    if (countdown.isPaused && countdown.frozenElapsedMs !== null) {
      diff = countdown.frozenElapsedMs;
    } else {
      diff = now - target;
    }
  }

  const isExpired = countdown.mode === "countdown" && diff <= 0;
  const absMs = Math.abs(diff);
  const totalSeconds = Math.floor(absMs / 1000);

  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired,
    totalMs: diff,
  };
}

export function getFrozenRemainingMs(countdown: Countdown, now: number): number {
  const target = new Date(countdown.targetTime).getTime();
  return target - now;
}

export function getFrozenElapsedMs(countdown: Countdown, now: number): number {
  const target = new Date(countdown.targetTime).getTime();
  return now - target;
}

export function calculateNewTargetTimeOnResume(
  countdown: Countdown,
  now: number
): string {
  if (countdown.mode === "countdown") {
    const remaining = countdown.frozenRemainingMs ?? 0;
    const newTarget = now + remaining;
    return new Date(newTarget).toISOString();
  } else {
    const elapsed = countdown.frozenElapsedMs ?? 0;
    const newTarget = now - elapsed;
    return new Date(newTarget).toISOString();
  }
}

export function calculateNextRepeatTarget(currentTarget: string, rule: RepeatRule): string {
  const date = new Date(currentTarget);

  switch (rule) {
    case "daily":
      date.setDate(date.getDate() + 1);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      break;
  }

  return date.toISOString();
}

export function shouldTriggerAdvanceReminder(
  countdown: Countdown,
  advanceMinutes: number,
  now: number
): boolean {
  if (countdown.mode !== "countdown") return false;
  if (countdown.isPaused) return false;

  const target = new Date(countdown.targetTime).getTime();
  const advanceMs = advanceMinutes * 60 * 1000;
  const triggerTime = target - advanceMs;

  const alreadyTriggered = countdown.reminderHistory.some(
    (r) => r.type === "advance" && r.advanceMinutes === advanceMinutes
  );

  return !alreadyTriggered && now >= triggerTime && now < target;
}

export function shouldTriggerTargetReminder(
  countdown: Countdown,
  now: number
): boolean {
  if (countdown.mode !== "countdown") return false;
  if (countdown.isPaused) return false;

  const timeLeft = calculateTimeLeft(countdown, now);
  if (!timeLeft.isExpired) return false;

  const alreadyTriggered = countdown.reminderHistory.some(
    (r) => r.type === "target"
  );

  return !alreadyTriggered;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function generateImportId(countdown: {
  name: string;
  targetTime: string;
  createdAt?: string;
}): string {
  const str = `${countdown.name}-${countdown.targetTime}-${countdown.createdAt || ""}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function formatNumber(num: number): string {
  return num.toString().padStart(2, "0");
}

export function formatDateTimeLocal(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function getFutureDate(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export function getRelativeTimeLabel(targetTime: string): string {
  const now = Date.now();
  const target = new Date(targetTime).getTime();
  const diff = target - now;
  const absDays = Math.abs(Math.round(diff / (1000 * 60 * 60 * 24)));

  if (diff > 0) {
    if (absDays === 0) return "今天";
    if (absDays === 1) return "明天";
    if (absDays < 7) return `${absDays} 天后`;
    if (absDays < 30) return `${Math.round(absDays / 7)} 周后`;
    return `${Math.round(absDays / 30)} 个月后`;
  } else {
    if (absDays === 0) return "今天";
    if (absDays === 1) return "昨天";
    if (absDays < 7) return `${absDays} 天前`;
    if (absDays < 30) return `${Math.round(absDays / 7)} 周前`;
    return `${Math.round(absDays / 30)} 个月前`;
  }
}
