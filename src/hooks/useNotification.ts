import { useCallback, useEffect, useState } from "react";

export function useNotification() {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === "granted";
  }, []);

  const sendNotification = useCallback(
    (title: string, body?: string) => {
      if (!("Notification" in window)) return;
      if (permission !== "granted") return;

      try {
        new Notification(title, {
          body,
          icon: "/favicon.svg",
          tag: "time-capsule-alert",
          requireInteraction: true,
        });
      } catch (e) {
        console.error("Notification failed:", e);
      }
    },
    [permission]
  );

  return { permission, requestPermission, sendNotification };
}
