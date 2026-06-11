import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageview } from "@/lib/pageviewBeacon";

export const PageviewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageview();
  }, [location.pathname]);

  return null;
};
