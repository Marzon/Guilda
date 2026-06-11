const BEACON_URL = "https://wesmoijjctmtyrstoxsn.supabase.co/functions/v1/track-pageview";

function getVisitorId(): string {
  let id = localStorage.getItem("guilda_visitor_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("guilda_visitor_id", id);
  }
  return id;
}

export function trackPageview() {
  const payload = {
    visitor_id: getVisitorId(),
    page_path: window.location.pathname,
    referrer: document.referrer || null,
    source: "marketing",
  };

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      navigator.sendBeacon(BEACON_URL, blob);
    } else {
      fetch(BEACON_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Silently ignore - request may be blocked by ad blockers
  }
}
