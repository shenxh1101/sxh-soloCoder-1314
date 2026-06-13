import type { Countdown } from "@/types/countdown";
import CountdownCard from "./CountdownCard";
import { Clock } from "lucide-react";

interface CountdownGridProps {
  countdowns: Countdown[];
  onEdit: (countdown: Countdown) => void;
  onDelete: (id: string) => void;
}

export default function CountdownGrid({ countdowns, onEdit, onDelete }: CountdownGridProps) {
  if (countdowns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
        <div className="w-24 h-24 rounded-full glass flex items-center justify-center mb-6">
          <Clock size={40} className="text-white/50" />
        </div>
        <h3 className="text-xl font-semibold font-display text-white/90 mb-2">
          还没有倒计时
        </h3>
        <p className="text-white/50 max-w-md">
          点击右上角的"添加"按钮，创建你的第一个倒计时，开始追踪重要的时间节点。
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {countdowns.map((countdown, index) => (
        <CountdownCard
          key={countdown.id}
          countdown={countdown}
          index={index}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
