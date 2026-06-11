import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Rocket, Axe, Bell, Briefcase } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useNotifications } from "@/hooks/useNotifications";
import { useProjectApplications } from "@/hooks/useProjectApplications";
import { NotificationBadge } from "@/components/NotificationBadge";

interface BottomTabBarProps {
  userId?: string;
}

const TABS = [
  { icon: Rocket, path: "/projects", labelKey: "nav.startups", badgeType: "projects" as const, tourId: "nav-startups" },
  { icon: Axe, path: "/ferramentas", labelKey: "nav.arsenal", tourId: "nav-tools" },
  { icon: Bell, path: "/notifications", labelKey: "nav.notifications", badgeType: "notifications" as const, tourId: "nav-notifications" },
  { icon: Briefcase, path: "/vagas", labelKey: "nav.jobs", tourId: "nav-jobs" },
];

export const BottomTabBar = ({ userId }: BottomTabBarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const { unreadCount: notificationsCount } = useNotifications(userId);
  const { receivedApplications } = useProjectApplications();
  
  // Count pending received applications for projects badge (applications to your projects)
  const projectsBadgeCount = useMemo(() => {
    const pendingReceived = receivedApplications?.filter(app => app.status === "PENDING").length || 0;
    return pendingReceived;
  }, [receivedApplications]);

  const getBadgeCount = (badgeType?: "notifications" | "projects") => {
    if (badgeType === "notifications") return notificationsCount;
    if (badgeType === "projects") return projectsBadgeCount;
    return 0;
  };

  const isActive = (path: string) => {
    if (path === "/capital") {
      return location.pathname === "/capital" || location.pathname.startsWith("/investidores") || location.pathname.startsWith("/investors");
    }
    if (path === "/ferramentas") {
      return location.pathname === "/ferramentas" || location.pathname.startsWith("/tools") || location.pathname.startsWith("/ferramentas-empreendedores");
    }
    return location.pathname.startsWith(path);
  };

  const handleTabClick = (path: string) => {
    navigate(path);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)] border-t border-slate-200"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex justify-around items-center h-[76px]">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          const badgeCount = getBadgeCount(tab.badgeType);
          
          return (
            <button
              key={tab.path}
              onClick={() => handleTabClick(tab.path)}
              data-tour={tab.tourId}
              className={`relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
                active 
                  ? "text-primary" 
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              <div className={`relative p-2.5 rounded-2xl transition-all duration-200 ${
                active ? "bg-primary/15 shadow-md" : "hover:bg-slate-100"
              }`}>
                <Icon className={`w-6 h-6 transition-transform ${active ? "scale-110" : ""}`} strokeWidth={active ? 2.5 : 2.2} />
                {badgeCount > 0 && (
                  <NotificationBadge 
                    count={badgeCount} 
                    className="absolute -top-0.5 -right-0.5 animate-pulse" 
                  />
                )}
              </div>
              <span className={`text-[11px] mt-0.5 font-bold tracking-tight ${
                active ? "text-primary" : "text-slate-600"
              }`}>
                {t(tab.labelKey, tab.path.replace("/", "").charAt(0).toUpperCase() + tab.path.slice(2))}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};