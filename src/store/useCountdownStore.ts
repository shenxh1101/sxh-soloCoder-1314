import { create } from "zustand";
import type {
  Countdown,
  CountdownMode,
  RepeatRule,
  SortField,
  SortOrder,
  ReminderRecord,
} from "@/types/countdown";
import { loadCountdowns, saveCountdowns, migrateOldData } from "@/utils/storage";
import {
  generateId,
  generateImportId,
  getFrozenRemainingMs,
  getFrozenElapsedMs,
  calculateNewTargetTimeOnResume,
  calculateNextRepeatTarget,
} from "@/utils/timeUtils";

interface CountdownState {
  countdowns: Countdown[];
  currentTime: number;
  selectedGroupId: string | null;
  sortField: SortField;
  sortOrder: SortOrder;
  addCountdown: (data: {
    name: string;
    targetTime: string;
    backgroundColor: string;
    mode: CountdownMode;
    groupId?: string | null;
    tags?: string[];
    advanceReminderMinutes?: number[];
    repeatRule?: RepeatRule;
  }) => void;
  updateCountdown: (id: string, updates: Partial<Countdown>) => void;
  deleteCountdown: (id: string) => void;
  togglePause: (id: string) => void;
  setCurrentTime: (time: number) => void;
  setSelectedGroup: (groupId: string | null) => void;
  setSort: (field: SortField, order?: SortOrder) => void;
  importCountdowns: (
    imported: Countdown[],
    replace?: boolean
  ) => { success: number; skipped: number; errors: string[] };
  addReminderRecord: (id: string, record: ReminderRecord) => void;
  handleRepeat: (id: string) => void;
  resetReminderHistory: (id: string) => void;
  getFilteredCountdowns: () => Countdown[];
}

export const useCountdownStore = create<CountdownState>((set, get) => ({
  countdowns: loadCountdowns().map(migrateOldData),
  currentTime: Date.now(),
  selectedGroupId: null,
  sortField: "targetTime",
  sortOrder: "asc",

  addCountdown: (data) => {
    const now = new Date().toISOString();
    const newCountdown: Countdown = {
      id: generateId(),
      name: data.name,
      targetTime: data.targetTime,
      backgroundColor: data.backgroundColor,
      mode: data.mode,
      groupId: data.groupId ?? null,
      tags: data.tags ?? [],
      isPaused: false,
      pausedAt: null,
      frozenRemainingMs: null,
      frozenElapsedMs: null,
      createdAt: now,
      advanceReminderMinutes: data.advanceReminderMinutes ?? [],
      repeatRule: data.repeatRule ?? "none",
      repeatCount: 0,
      reminderHistory: [],
      importId: generateImportId({
        name: data.name,
        targetTime: data.targetTime,
        createdAt: now,
      }),
    };
    const updated = [...get().countdowns, newCountdown];
    set({ countdowns: updated });
    saveCountdowns(updated);
  },

  updateCountdown: (id, updates) => {
    const updated = get().countdowns.map((c) => {
      if (c.id !== id) return c;
      const merged = { ...c, ...updates };
      if (updates.targetTime && updates.targetTime !== c.targetTime) {
        merged.importId = generateImportId({
          name: merged.name,
          targetTime: merged.targetTime,
          createdAt: merged.createdAt,
        });
      }
      return merged;
    });
    set({ countdowns: updated });
    saveCountdowns(updated);
  },

  deleteCountdown: (id) => {
    const updated = get().countdowns.filter((c) => c.id !== id);
    set({ countdowns: updated });
    saveCountdowns(updated);
  },

  togglePause: (id) => {
    const now = Date.now();
    const updated = get().countdowns.map((c) => {
      if (c.id !== id) return c;

      if (c.isPaused) {
        const newTargetTime = calculateNewTargetTimeOnResume(c, now);
        return {
          ...c,
          isPaused: false,
          pausedAt: null,
          frozenRemainingMs: null,
          frozenElapsedMs: null,
          targetTime: newTargetTime,
        };
      } else {
        return {
          ...c,
          isPaused: true,
          pausedAt: now,
          frozenRemainingMs:
            c.mode === "countdown"
              ? getFrozenRemainingMs(c, now)
              : c.frozenRemainingMs,
          frozenElapsedMs:
            c.mode === "stopwatch"
              ? getFrozenElapsedMs(c, now)
              : c.frozenElapsedMs,
        };
      }
    });
    set({ countdowns: updated });
    saveCountdowns(updated);
  },

  setCurrentTime: (time) => {
    set({ currentTime: time });
  },

  setSelectedGroup: (groupId) => {
    set({ selectedGroupId: groupId });
  },

  setSort: (field, order) => {
    set((state) => ({
      sortField: field,
      sortOrder: order ?? (state.sortField === field && state.sortOrder === "asc" ? "desc" : "asc"),
    }));
  },

  importCountdowns: (imported, replace = false) => {
    const state = get();
    const existingIds = new Set(state.countdowns.map((c) => c.importId));
    const success: Countdown[] = [];
    const errors: string[] = [];
    let skipped = 0;

    imported.forEach((item, index) => {
      try {
        if (!item || typeof item !== "object") {
          errors.push(`第 ${index + 1} 条：数据格式无效`);
          return;
        }
        if (!item.name || !item.targetTime) {
          errors.push(`第 ${index + 1} 条：缺少必要字段（名称或时间）`);
          return;
        }

        const migrated = migrateOldData(item);
        const importId = migrated.importId || generateImportId(migrated);

        if (!replace && existingIds.has(importId)) {
          skipped++;
          return;
        }

        const newCountdown: Countdown = {
          ...migrated,
          id: generateId(),
          importId,
          reminderHistory: [],
        };

        success.push(newCountdown);
        existingIds.add(importId);
      } catch (e) {
        errors.push(`第 ${index + 1} 条：${(e as Error).message}`);
      }
    });

    const existing = replace ? [] : state.countdowns;
    const merged = [...existing, ...success];
    set({ countdowns: merged });
    saveCountdowns(merged);

    return { success: success.length, skipped, errors };
  },

  addReminderRecord: (id, record) => {
    const updated = get().countdowns.map((c) =>
      c.id === id
        ? { ...c, reminderHistory: [...c.reminderHistory, record] }
        : c
    );
    set({ countdowns: updated });
    saveCountdowns(updated);
  },

  handleRepeat: (id) => {
    const countdown = get().countdowns.find((c) => c.id === id);
    if (!countdown || countdown.repeatRule === "none") return;

    const newTarget = calculateNextRepeatTarget(
      countdown.targetTime,
      countdown.repeatRule
    );

    const updated = get().countdowns.map((c) =>
      c.id === id
        ? {
            ...c,
            targetTime: newTarget,
            repeatCount: c.repeatCount + 1,
            reminderHistory: [],
            importId: generateImportId({
              name: c.name,
              targetTime: newTarget,
              createdAt: c.createdAt,
            }),
          }
        : c
    );
    set({ countdowns: updated });
    saveCountdowns(updated);
  },

  resetReminderHistory: (id) => {
    const updated = get().countdowns.map((c) =>
      c.id === id ? { ...c, reminderHistory: [] } : c
    );
    set({ countdowns: updated });
    saveCountdowns(updated);
  },

  getFilteredCountdowns: () => {
    const state = get();
    let filtered = [...state.countdowns];

    if (state.selectedGroupId) {
      filtered = filtered.filter((c) => c.groupId === state.selectedGroupId);
    }

    const sorted = filtered.sort((a, b) => {
      const modifier = state.sortOrder === "asc" ? 1 : -1;

      switch (state.sortField) {
        case "targetTime":
          return (
            (new Date(a.targetTime).getTime() - new Date(b.targetTime).getTime()) *
            modifier
          );
        case "createdAt":
          return (
            (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
            modifier
          );
        case "mode":
          return a.mode.localeCompare(b.mode) * modifier;
        case "name":
          return a.name.localeCompare(b.name, "zh-CN") * modifier;
        case "group": {
          const groupA = a.groupId ?? "";
          const groupB = b.groupId ?? "";
          return groupA.localeCompare(groupB) * modifier;
        }
        default:
          return 0;
      }
    });

    return sorted;
  },
}));
