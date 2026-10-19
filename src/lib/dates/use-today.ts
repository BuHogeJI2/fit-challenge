import { useEffect, useState } from "react";
import { getDateKey } from "./dates";

const REFRESH_INTERVAL_MS = 60_000;

export const useToday = () => {
  const [todayKey, setTodayKey] = useState(() => getDateKey(new Date()));

  useEffect(() => {
    const refresh = () => setTodayKey(getDateKey(new Date()));
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };

    const intervalId = window.setInterval(refresh, REFRESH_INTERVAL_MS);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return todayKey;
};
