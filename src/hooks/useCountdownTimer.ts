import { useEffect, useCallback } from "react";
import { useCountdownStore } from "@/store/useCountdownStore";
import { calculateTimeLeft, shouldTriggerAdvanceReminder, shouldTriggerTargetReminder } from "@/utils/timeUtils";
import type { Countdown } from "@/types/countdown";

interface ReminderCallbacks {
  onTargetReminder: (countdown: Countdown) => void;
  onAdvanceReminder: (countdown: Countdown, advanceMinutes: number) => void;
}

export function useCountdownTimer(callbacks: ReminderCallbacks) {
  const { countdowns, setCurrentTime, addReminderRecord, handleRepeat } = useCountdownStore();

  const processReminders = useCallback((now: number) => {
    countdowns.forEach((c: Countdown) => {
      if (c.mode !== "countdown" || c.isPaused) return;

      c.advanceReminderMinutes.forEach((minutes) => {
        if (shouldTriggerAdvanceReminder(c, minutes, now)) {
          callbacks.onAdvanceReminder(c, minutes);
          addReminderRecord(c.id, {
            type: "advance",
            triggeredAt: now,
            advanceMinutes: minutes,
          });
        }
      });

      if (shouldTriggerTargetReminder(c, now)) {
        callbacks.onTargetReminder(c);
        addReminderRecord(c.id, {
          type: "target",
          triggeredAt: now,
        });

        if (c.repeatRule !== "none") {
          setTimeout(() => {
            handleRepeat(c.id);
          }, 1000);
        }
      }
    });
  }, [countdowns, callbacks, addReminderRecord, handleRepeat]);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      setCurrentTime(now);
      processReminders(now);
    };

    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [setCurrentTime, processReminders]);

  const getExpiredCountdowns = useCallback(() => {
    const now = Date.now();
    return countdowns.filter((c) => {
      if (c.mode !== "countdown") return false;
      const timeLeft = calculateTimeLeft(c, now);
      return timeLeft.isExpired;
    });
  }, [countdowns]);

  return { getExpiredCountdowns };
}
