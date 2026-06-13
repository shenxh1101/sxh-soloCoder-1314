import { useState, useEffect } from "react";
import type { Countdown, CountdownMode, RepeatRule } from "@/types/countdown";
import {
  PRESET_COLORS,
  PRESET_GROUPS,
  ADVANCE_REMINDER_OPTIONS,
  REPEAT_OPTIONS,
} from "@/types/countdown";
import { formatDateTimeLocal, getFutureDate } from "@/utils/timeUtils";
import ColorPicker from "./ColorPicker";
import { Timer, Play, Tag, X, ChevronDown, ChevronUp } from "lucide-react";

interface CountdownFormProps {
  editing?: Countdown | null;
  onSubmit: (data: {
    name: string;
    targetTime: string;
    backgroundColor: string;
    mode: CountdownMode;
    groupId: string | null;
    tags: string[];
    advanceReminderMinutes: number[];
    repeatRule: RepeatRule;
  }) => void;
  onCancel: () => void;
}

export default function CountdownForm({ editing, onSubmit, onCancel }: CountdownFormProps) {
  const [name, setName] = useState("");
  const [targetTime, setTargetTime] = useState("");
  const [backgroundColor, setBackgroundColor] = useState(PRESET_COLORS[0].value);
  const [mode, setMode] = useState<CountdownMode>("countdown");
  const [groupId, setGroupId] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [advanceReminders, setAdvanceReminders] = useState<number[]>([]);
  const [repeatRule, setRepeatRule] = useState<RepeatRule>("none");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setTargetTime(formatDateTimeLocal(new Date(editing.targetTime)));
      setBackgroundColor(editing.backgroundColor);
      setMode(editing.mode);
      setGroupId(editing.groupId);
      setTags(editing.tags || []);
      setAdvanceReminders(editing.advanceReminderMinutes || []);
      setRepeatRule(editing.repeatRule || "none");
      if (editing.tags?.length || editing.advanceReminderMinutes?.length || editing.repeatRule !== "none") {
        setShowAdvanced(true);
      }
    } else {
      setName("");
      setTargetTime(formatDateTimeLocal(getFutureDate(1)));
      setBackgroundColor(PRESET_COLORS[0].value);
      setMode("countdown");
      setGroupId(null);
      setTags([]);
      setAdvanceReminders([]);
      setRepeatRule("none");
      setShowAdvanced(false);
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

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const toggleAdvanceReminder = (minutes: number) => {
    if (advanceReminders.includes(minutes)) {
      setAdvanceReminders(advanceReminders.filter((m) => m !== minutes));
    } else {
      setAdvanceReminders([...advanceReminders, minutes].sort((a, b) => b - a));
    }
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
      groupId,
      tags,
      advanceReminderMinutes: advanceReminders,
      repeatRule,
    });
  };

  const selectedGroup = PRESET_GROUPS.find((g) => g.id === groupId);

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-h-[75vh] overflow-y-auto pr-2">
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

      <div className="space-y-3">
        <label className="block text-sm font-medium text-white/80">分组</label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          <button
            type="button"
            onClick={() => setGroupId(null)}
            className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl transition-all text-xs ${
              groupId === null
                ? "bg-white/15 border-white/30"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            } border`}
          >
            <span className="text-lg">📋</span>
            <span>全部</span>
          </button>
          {PRESET_GROUPS.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => setGroupId(group.id)}
              className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl transition-all text-xs ${
                groupId === group.id
                  ? "bg-white/15 border-white/30"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              } border`}
              title={group.name}
            >
              <span className="text-lg">{group.icon}</span>
              <span className="truncate w-full text-center">{group.name}</span>
            </button>
          ))}
        </div>
        {selectedGroup && (
          <p className="text-xs text-white/50">
            已选择分组：{selectedGroup.icon} {selectedGroup.name}
          </p>
        )}
      </div>

      <ColorPicker value={backgroundColor} onChange={setBackgroundColor} />

      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm"
        >
          <span className="flex items-center gap-2">
            <Tag size={16} />
            高级设置（标签、提醒、重复）
          </span>
          {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-5 animate-fade-in">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">
                标签（最多5个，回车添加）
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="输入标签后回车"
                  maxLength={20}
                  disabled={tags.length >= 5}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/40 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || tags.length >= 5}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                >
                  添加
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-sm"
                    >
                      <span className="text-white/80">#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-white/50 hover:text-white transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {mode === "countdown" && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">提前提醒</label>
                  <div className="flex flex-wrap gap-2">
                    {ADVANCE_REMINDER_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggleAdvanceReminder(opt.value)}
                        disabled={opt.value === 0}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                          opt.value === 0
                            ? "opacity-30 cursor-not-allowed bg-white/5 border border-white/10"
                            : advanceReminders.includes(opt.value)
                            ? "bg-white/20 border-white/30 text-white"
                            : "bg-white/5 border border-white/10 hover:bg-white/10 text-white/70"
                        } border`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {advanceReminders.length > 0 && (
                    <p className="text-xs text-white/50">
                      将在 {advanceReminders.sort((a, b) => b - a).map((m) => {
                        if (m >= 1440) return `${m / 1440} 天`;
                        if (m >= 60) return `${m / 60} 小时`;
                        return `${m} 分钟`;
                      }).join("、")} 前分别提醒
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">重复规则</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {REPEAT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setRepeatRule(opt.value as RepeatRule)}
                        className={`px-3 py-2 rounded-lg text-sm transition-all ${
                          repeatRule === opt.value
                            ? "bg-white/20 border-white/30 text-white"
                            : "bg-white/5 border border-white/10 hover:bg-white/10 text-white/70"
                        } border`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {repeatRule !== "none" && (
                    <p className="text-xs text-white/50">
                      到期后将自动重置为下一个{repeatRule === "daily" ? "天" : repeatRule === "weekly" ? "周" : repeatRule === "monthly" ? "月" : "年"}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
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
