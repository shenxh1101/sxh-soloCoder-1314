import { useState, useEffect } from "react";
import type { Countdown, CountdownMode } from "@/types/countdown";
import { PRESET_COLORS } from "@/types/countdown";
import { formatDateTimeLocal, getFutureDate } from "@/utils/timeUtils";
import ColorPicker from "./ColorPicker";
import { Timer, Play } from "lucide-react";

interface CountdownFormProps {
  editing?: Countdown | null;
  onSubmit: (data: {
    name: string;
    targetTime: string;
    backgroundColor: string;
    mode: CountdownMode;
  }) => void;
  onCancel: () => void;
}

export default function CountdownForm({ editing, onSubmit, onCancel }: CountdownFormProps) {
  const [name, setName] = useState("");
  const [targetTime, setTargetTime] = useState("");
  const [backgroundColor, setBackgroundColor] = useState(PRESET_COLORS[0].value);
  const [mode, setMode] = useState<CountdownMode>("countdown");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setTargetTime(formatDateTimeLocal(new Date(editing.targetTime)));
      setBackgroundColor(editing.backgroundColor);
      setMode(editing.mode);
    } else {
      setName("");
      setTargetTime(formatDateTimeLocal(getFutureDate(1)));
      setBackgroundColor(PRESET_COLORS[0].value);
      setMode("countdown");
    }
    setErrors({});
  }, [editing]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "请输入名称";
    if (!targetTime) newErrors.targetTime = "请选择时间";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const targetDate = new Date(targetTime);
    onSubmit({
      name: name.trim(),
      targetTime: targetDate.toISOString(),
      backgroundColor,
      mode,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white/80">名称</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例如：新年倒计时、项目截止日"
          className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-white/30 focus:outline-none focus:border-white/40 transition-all ${
            errors.name ? "border-red-500/50" : "border-white/10"
          }`}
        />
        {errors.name && <p className="text-sm text-red-400">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-white/80">
          {mode === "countdown" ? "目标日期时间" : "起始日期时间"}
        </label>
        <input
          type="datetime-local"
          value={targetTime}
          onChange={(e) => setTargetTime(e.target.value)}
          className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white focus:outline-none focus:border-white/40 transition-all [color-scheme:dark] ${
            errors.targetTime ? "border-red-500/50" : "border-white/10"
          }`}
        />
        {errors.targetTime && <p className="text-sm text-red-400">{errors.targetTime}</p>}
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-white/80">计时模式</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMode("countdown")}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
              mode === "countdown"
                ? "bg-white/15 border-white/30"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            } border`}
          >
            <Timer size={18} />
            <span className="font-medium">倒计时</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("stopwatch")}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
              mode === "stopwatch"
                ? "bg-white/15 border-white/30"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            } border`}
          >
            <Play size={18} />
            <span className="font-medium">正计时</span>
          </button>
        </div>
      </div>

      <ColorPicker value={backgroundColor} onChange={setBackgroundColor} />

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-medium"
        >
          取消
        </button>
        <button
          type="submit"
          className="flex-1 px-6 py-3 rounded-xl bg-white text-black hover:bg-white/90 transition-all font-semibold"
        >
          {editing ? "保存修改" : "创建倒计时"}
        </button>
      </div>
    </form>
  );
}
