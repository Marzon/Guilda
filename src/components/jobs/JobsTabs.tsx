import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Megaphone, LayoutGrid } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { motion } from "framer-motion";

interface JobsTabsProps {
  activeTab: "board" | "applications" | "posted";
  onTabChange: (tab: "board" | "applications" | "posted") => void;
  children: React.ReactNode;
}

export const JobsTabs = ({
  activeTab,
  onTabChange,
  children,
}: JobsTabsProps) => {
  const { t } = useLanguage();

  const tabs = [
    { value: "board" as const, icon: LayoutGrid, label: t("jobs.tabs.board", "Mural") },
    { value: "applications" as const, icon: ClipboardList, label: t("jobs.tabs.applications", "Candidaturas") },
    { value: "posted" as const, icon: Megaphone, label: t("jobs.tabs.posted", "Postadas") },
  ];

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={(value) => onTabChange(value as "board" | "applications" | "posted")}
      className="w-full"
    >
      {/* Page-style navigation */}
      <div className="border-b border-border mb-6">
        <TabsList className="w-full max-w-lg mx-auto flex bg-transparent h-auto p-0 gap-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            
            return (
              <TabsTrigger 
                key={tab.value}
                value={tab.value} 
                className="relative flex-1 flex items-center justify-center gap-2 py-4 px-4 bg-transparent border-0 shadow-none rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all group"
              >
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                <span className={`font-semibold transition-colors text-sm ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    layoutId="activeJobTab"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>
      {children}
    </Tabs>
  );
};
