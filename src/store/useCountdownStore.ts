import { create } from "zustand";
import type { Countdown, CountdownMode } from "@/types/countdown";
import { loadCountdowns, saveCountdowns } from "@/utils/storage";
import { generateId } from "@/utils/timeUtils";

interface CountdownState {
  countdowns: Countdown[];
  currentTime: number;
  addCountdown: (data: {
    name: string;
    targetTime: string;
    backgroundColor: string;
    mode: CountdownMode;
  }) => void;
  updateCountdown: (id: string, updates: Partial<Countdown>) => void;
  deleteCountdown: (id: string) => void;
  togglePause: (id: string) => void;
  setCurrentTime: (time: number) => void;
  importCountdowns: (countdowns: Countdown[], replace?: boolean) => void;
  setLastNotified: (id: string, time: number) => void;
}

export const useCountdownStore = create<CountdownState>((set, get) => ({
  countdowns: loadCountdowns(),
  currentTime: Date.now(),

  addCountdown: (data) => {
    const newCountdown: Countdown = {
      id: generateId(),
      name: data.name,
      targetTime: data.targetTime,
      backgroundColor: data.backgroundColor,
      mode: data.mode,
      isPaused: false,
      pausedAt: null,
      accumulatedOffset: 0,
      createdAt: new Date().toISOString(),
      lastNotified: null,
    };
    const updated = [...get().countdowns, newCountdown];
    set({ countdowns: updated });
    saveCountdowns(updated);
  },

  updateCountdown: (id, updates) => {
    const updated = get().countdowns.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    );
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
        const newOffset = c.pausedAt !== null ? now - c.pausedAt : 0;
        return {
          ...c,
          isPaused: false,
          pausedAt: null,
          accumulatedOffset: c.mode === "stopwatch" ? c.accumulatedOffset + newOffset : c.accumulatedOffset,
        };
      }
      return { ...c, isPaused: true, pausedAt: now };
    });
    set({ countdowns: updated });
    saveCountdowns(updated);
  },

  setCurrentTime: (time) => {
    set({ currentTime: time });
  },

  importCountdowns: (imported, replace = false) => {
    const existing = replace ? [] : get().countdowns;
    const merged = [...existing, ...imported];
    set({ countdowns: merged });
    saveCountdowns(merged);
  },

  setLastNotified: (id, time) => {
    const updated = get().countdowns.map((c) =>
      c.id === id ? { ...c, lastNotified: time } : c
    );
    set({ countdowns: updated });
    saveCountdowns(updated);
  },
}));
