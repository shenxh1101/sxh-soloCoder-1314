import type { Countdown } from "@/types/countdown";
import { generateImportId } from "@/utils/timeUtils";

const STORAGE_KEY = "time-capsule-countdowns";

export function migrateOldData(data: any): Countdown {
  const now = new Date().toISOString();
  return {
    id: data.id || "",
    name: data.name || "",
    targetTime: data.targetTime || now,
    backgroundColor: data.backgroundColor || data.bgColor || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    mode: data.mode || "countdown",
    groupId: data.groupId ?? null,
    tags: data.tags ?? [],
    isPaused: data.isPaused ?? false,
    pausedAt: data.pausedAt ?? null,
    frozenRemainingMs: data.frozenRemainingMs ?? null,
    frozenElapsedMs: data.frozenElapsedMs ?? null,
    createdAt: data.createdAt || now,
    advanceReminderMinutes: data.advanceReminderMinutes ?? [],
    repeatRule: data.repeatRule ?? "none",
    repeatCount: data.repeatCount ?? 0,
    reminderHistory: data.reminderHistory ?? [],
    importId: data.importId || generateImportId({
      name: data.name || "",
      targetTime: data.targetTime || now,
      createdAt: data.createdAt || now,
    }),
  };
}

export function loadCountdowns(): Countdown[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

export function saveCountdowns(countdowns: Countdown[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(countdowns));
  } catch {
    console.error("Failed to save countdowns");
  }
}

export function exportToJSON(countdowns: Countdown[]): string {
  const exportData = countdowns.map(({ id, ...rest }) => rest);
  return JSON.stringify(
    {
      version: 2,
      exportedAt: new Date().toISOString(),
      countdowns: exportData,
    },
    null,
    2
  );
}

export function downloadJSON(content: string, filename: string): void {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importFromJSON(file: File): Promise<{
  data: Countdown[];
  format: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);

        let countdowns: any[];
        let format = "unknown";

        if (parsed.countdowns && Array.isArray(parsed.countdowns)) {
          countdowns = parsed.countdowns;
          format = parsed.version ? `v${parsed.version}` : "v1";
        } else if (Array.isArray(parsed)) {
          countdowns = parsed;
          format = "raw";
        } else {
          reject(new Error("无效的JSON格式：未找到倒计时数据"));
          return;
        }

        resolve({ data: countdowns, format });
      } catch (err) {
        reject(new Error("JSON解析失败：文件格式不正确"));
      }
    };
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsText(file);
  });
}
