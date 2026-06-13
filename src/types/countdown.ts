export type CountdownMode = "countdown" | "stopwatch";

export interface Countdown {
  id: string;
  name: string;
  targetTime: string;
  backgroundColor: string;
  mode: CountdownMode;
  isPaused: boolean;
  pausedAt: number | null;
  accumulatedOffset: number;
  createdAt: string;
  lastNotified?: number | null;
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  totalMs: number;
}

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
