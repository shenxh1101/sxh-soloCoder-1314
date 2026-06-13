import { useEffect, useState } from "react";
import type { Countdown } from "@/types/countdown";
import { PRESET_COLORS } from "@/types/countdown";
import { useCountdownStore } from "@/store/useCountdownStore";
import { calculateTimeLeft, formatNumber } from "@/utils/timeUtils";
import { Pause, Play, Pencil, Trash2 } from "lucide-react";

interface CountdownCardProps {
  countdown: Countdown;
  index: number;
  onEdit: (countdown: Countdown) => void;
  onDelete: (id: string) => void;
}

function getGlowColor(bg: string): string {
  const preset = PRESET_COLORS.find((p) => p.value === bg);
  return preset?.glow || "rgba(120, 119, 198, 0.3)";
}

export default function CountdownCard({ countdown, index, onEdit, onDelete }: CountdownCardProps) {
  const { currentTime, togglePause } = useCountdownStore();
  const [tickKey, setTickKey] = useState(0);
  const [prevSeconds, setPrevSeconds] = useState(-1);

  const timeLeft = calculateTimeLeft(countdown, currentTime);

  useEffect(() => {
    if (timeLeft.seconds !== prevSeconds) {
      setTickKey((k) => k + 1);
      setPrevSeconds(timeLeft.seconds);
    }
  }, [timeLeft.seconds, prevSeconds]);

  const glowColor = getGlowColor(countdown.backgroundColor);
  const isComplete = timeLeft.isExpired && countdown.mode === "countdown";

  const formatTargetDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`card-enter relative rounded-3xl p-6 overflow-hidden card-glow transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group ${
        isComplete ? "complete-pulse" : ""
      }`}
      style={{
        background: countdown.backgroundColor,
        "--card-glow": glowColor,
        animationDelay: `${index * 80}ms`,
      } as React.CSSProperties}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full min-h-[280px]">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold font-display text-white truncate drop-shadow-lg">
              {countdown.name}
            </h3>
            <p className="text-xs text-white/70 mt-1 font-mono">
              {countdown.mode === "countdown" ? "目标" : "开始"} · {formatTargetDate(countdown.targetTime)}
            </p>
          </div>
          <div
            className={`px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
              countdown.isPaused
                ? "bg-yellow-500/30 text-yellow-100"
                : isComplete
                ? "bg-green-500/30 text-green-100"
                : "bg-white/20 text-white/90"
            }`}
          >
            {isComplete ? "已到达" : countdown.isPaused ? "已暂停" : countdown.mode === "countdown" ? "倒计时" : "正计时"}
          </div>
        </div>

        <div key={tickKey} className="flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-4 gap-2 text-center">
            <TimeUnit label="天" value={timeLeft.days} animate />
            <TimeUnit label="时" value={timeLeft.hours} />
            <TimeUnit label="分" value={timeLeft.minutes} />
            <TimeUnit label="秒" value={timeLeft.seconds} />
          </div>
          {isComplete && (
            <div className="mt-4 text-center">
              <span className="text-white/90 text-sm font-medium drop-shadow-lg">
                🎉 时间已到达！
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/15">
          <button
            onClick={() => togglePause(countdown.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm transition-all text-white text-sm font-medium"
          >
            {countdown.isPaused ? <Play size={16} /> : <Pause size={16} />}
            {countdown.isPaused ? "继续" : "暂停"}
          </button>
          <button
            onClick={() => onEdit(countdown)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm transition-all text-white"
            title="编辑"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(countdown.id)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/15 hover:bg-red-500/50 backdrop-blur-sm transition-all text-white"
            title="删除"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

interface TimeUnitProps {
  label: string;
  value: number;
  animate?: boolean;
}

function TimeUnit({ label, value }: TimeUnitProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="font-mono text-4xl sm:text-5xl font-bold text-white time-digit drop-shadow-lg leading-none">
          {formatNumber(value)}
        </div>
      </div>
      <div className="text-xs text-white/70 mt-2 font-medium uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}
