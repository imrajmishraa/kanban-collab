import { useEffect, useState } from "react";

/**
 * A clock that ticks, for text that ages: "Saved 30s ago", "due in 2 days".
 *
 * The interval is the call site's choice because the cost is real — a one-second clock on a
 * page with twenty tooltips is twenty timers. It pauses while the tab is hidden, because
 * nobody is reading.
 */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timer = 0;

    const start = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => setNow(new Date()), intervalMs);
    };

    const onVisibility = () => {
      if (document.hidden) window.clearInterval(timer);
      else {
        setNow(new Date());
        start();
      }
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [intervalMs]);

  return now;
}
