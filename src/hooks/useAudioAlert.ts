import { useCallback, useRef } from "react";

export function useAudioAlert() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);

  const getContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback(
    (frequency: number, duration: number, startTime: number, ctx: AudioContext) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, startTime);

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration - 0.05);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    },
    []
  );

  const playAlert = useCallback(() => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;

    try {
      const ctx = getContext();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;
      playTone(880, 0.2, now, ctx);
      playTone(880, 0.2, now + 0.3, ctx);
      playTone(1100, 0.4, now + 0.6, ctx);
    } catch (e) {
      console.error("Audio playback failed:", e);
    }

    setTimeout(() => {
      isPlayingRef.current = false;
    }, 1500);
  }, [getContext, playTone]);

  return { playAlert };
}
