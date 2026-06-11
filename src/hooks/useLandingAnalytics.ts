import { useEffect, useRef } from "react";

export const trackLandingEvent = (
  eventName: string,
  params?: Record<string, string | number>
) => {
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  } else {
    console.log(`📊 [LandingEvent] ${eventName}`, params ?? "");
  }
};

export const useScrollDepthTracking = () => {
  const fired = useRef<Set<number>>(new Set());

  useEffect(() => {
    const thresholds = [25, 50, 75, 100];

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const percent = (scrollTop / docHeight) * 100;

      thresholds.forEach((t) => {
        if (percent >= t && !fired.current.has(t)) {
          fired.current.add(t);
          trackLandingEvent("scroll_depth", { depth: String(t) });
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
};
