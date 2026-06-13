import type { Countdown, TimeLeft } from "@/types/countdown";

export function calculateTimeLeft(countdown: Countdown, now: number = Date.now()): TimeLeft {
  const target = new Date(countdown.targetTime).getTime();
  let diff: number;

  if (countdown.mode === "countdown") {
    if (countdown.isPaused && countdown.pausedAt !== null) {
      diff = target - countdown.pausedAt;
    } else {
      diff = target - now;
    }
  } else {
    if (countdown.isPaused && countdown.pausedAt !== null) {
      diff = countdown.accumulatedOffset;
    } else {
      diff = now - target + countdown.accumulatedOffset;
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

export function formatNumber(num: number): string {
  return num.toString().padStart(2, "0");
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
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
