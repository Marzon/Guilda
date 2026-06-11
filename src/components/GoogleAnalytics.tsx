import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
    gaLoaded?: boolean;
  }
}

const GA_MEASUREMENT_ID = "G-FK83FT4XW9";

export const GoogleAnalytics = () => {
  const location = useLocation();
  const pendingPageView = useRef<string | null>(null);

  useEffect(() => {
    const pagePath = location.pathname + location.search;
    
    const sendPageView = () => {
      if (typeof window.gtag === "function") {
        window.gtag("config", GA_MEASUREMENT_ID, {
          page_path: pagePath,
          page_title: document.title,
        });
      }
    };

    // If GA is loaded, send immediately; otherwise queue for when it loads
    if (window.gaLoaded && typeof window.gtag === "function") {
      sendPageView();
    } else {
      pendingPageView.current = pagePath;
      // Check periodically if GA loaded (max 10s)
      const checkInterval = setInterval(() => {
        if (window.gaLoaded && typeof window.gtag === "function") {
          sendPageView();
          clearInterval(checkInterval);
        }
      }, 500);
      setTimeout(() => clearInterval(checkInterval), 10000);
    }
  }, [location]);

  return null;
};
