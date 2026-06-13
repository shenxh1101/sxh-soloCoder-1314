import { useEffect, useRef } from "react";
import { useCountdownStore } from "@/store/useCountdownStore";
import { calculateTimeLeft } from "@/utils/timeUtils";
import type { Countdown } from "@/types/countdown";

export function useCountdownTimer() {
  const { countdowns, setCurrentTime, setLastNotified } = useCountdownStore();
  const expiredRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      setCurrentTime(now);

      countdowns.forEach((c: Countdown) => {
        if (c.mode !== "countdown" || c.isPaused) return;
        const timeLeft = calculateTimeLeft(c, now);
        if (timeLeft.isExpired && !expiredRef.current.has(c.id)) {
          expiredRef.current.add(c.id);
          if (!c.lastNotified) {
            setLastNotified(c.id, now);
          }
        }
      });
    };

    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [countdowns, setCurrentTime, setLastNotified]);

  return expiredRef;
}
