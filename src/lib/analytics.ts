declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

const isDev = import.meta.env.DEV;

const logAnalytics = (message: string, data?: any) => {
  if (isDev) {
    console.log(`📊 [Analytics] ${message}`, data || '');
  }
};

export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  logAnalytics(`Event: ${action}`, { category, label, value });

  if (typeof window.gtag === "function") {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
    logAnalytics(`✅ Event sent to GA: ${action}`);
  } else {
    console.warn("⚠️ [Analytics] gtag not available - GA may be blocked or not loaded");
  }
};

// Eventos de conversão
export const trackSignup = (method: string = "email") => {
  logAnalytics("Tracking signup", { method });
  trackEvent("sign_up", "conversion", method);
};

export const trackLogin = (method: string = "email") => {
  logAnalytics("Tracking login", { method });
  trackEvent("login", "engagement", method);
};

// Eventos de engajamento
export const trackMatchSent = () => {
  logAnalytics("Tracking match_sent");
  trackEvent("match_sent", "engagement");
};

export const trackMatchAccepted = () => {
  logAnalytics("Tracking match_accepted");
  trackEvent("match_accepted", "engagement");
};

export const trackMessageSent = () => {
  logAnalytics("Tracking message_sent");
  trackEvent("message_sent", "engagement");
};

export const trackProjectCreated = () => {
  logAnalytics("Tracking project_created");
  trackEvent("project_created", "engagement");
};

export const trackProjectApplication = () => {
  logAnalytics("Tracking project_application");
  trackEvent("project_application", "engagement");
};

// Eventos de monetização
export const trackPurchaseInitiated = (product: string, value: number) => {
  logAnalytics("Tracking purchase_initiated", { product, value });
  trackEvent("begin_checkout", "monetization", product, value);
};

export const trackPurchaseCompleted = (product: string, value: number) => {
  logAnalytics("Tracking purchase_completed", { product, value });
  trackEvent("purchase", "monetization", product, value);
};

// Eventos de referral
export const trackReferralShare = (platform: string) => {
  logAnalytics("Tracking referral_share", { platform });
  trackEvent("share", "referral", platform);
};

// Eventos de PWA
export const trackPWAInstall = () => {
  logAnalytics("Tracking pwa_install");
  trackEvent("pwa_install", "conversion");
};
