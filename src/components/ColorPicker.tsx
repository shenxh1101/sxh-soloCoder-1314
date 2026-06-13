import { PRESET_COLORS } from "@/types/countdown";
import { Check } from "lucide-react";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-white/80">背景颜色</label>
      <div className="grid grid-cols-4 gap-3">
        {PRESET_COLORS.map((color) => {
          const isSelected = color.value === value;
          return (
            <button
              key={color.id}
              type="button"
              onClick={() => onChange(color.value)}
              className={`relative h-14 rounded-xl transition-all hover:scale-105 ${
                isSelected
                  ? "ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0f]"
                  : "ring-1 ring-white/10"
              }`}
              style={{ background: color.value }}
              title={color.name}
            >
              {isSelected && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Check size={20} className="text-white drop-shadow-lg" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
