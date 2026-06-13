import type { Countdown } from "@/types/countdown";

const STORAGE_KEY = "time-capsule-countdowns";

export function loadCountdowns(): Countdown[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Countdown[];
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
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      countdowns,
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

export async function importFromJSON(file: File): Promise<Countdown[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.countdowns && Array.isArray(parsed.countdowns)) {
          resolve(parsed.countdowns as Countdown[]);
        } else if (Array.isArray(parsed)) {
          resolve(parsed as Countdown[]);
        } else {
          reject(new Error("无效的JSON格式"));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsText(file);
  });
}
