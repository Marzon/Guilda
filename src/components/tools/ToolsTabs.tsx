import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Compass } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { motion } from "framer-motion";

interface ToolsTabsProps {
  activeTab: "novidades" | "recommendations";
  onTabChange: (tab: "novidades" | "recommendations") => void;
  children: React.ReactNode;
}

export const ToolsTabs = ({
  activeTab,
  onTabChange,
  children,
}: ToolsTabsProps) => {
  const { t } = useLanguage();

  const tabs = [
    { value: "novidades" as const, icon: Sparkles, label: t("tools.tabs.news", "Novidades") },
    { value: "recommendations" as const, icon: Compass, label: t("tools.tabs.recommendations", "Recomendações") },
  ];

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={(value) => onTabChange(value as "novidades" | "recommendations")}
      className="w-full"
    >
      {/* Page-style navigation */}
      <div className="border-b border-border mb-6">
        <TabsList className="w-full max-w-md mx-auto flex bg-transparent h-auto p-0 gap-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            
            return (
              <TabsTrigger 
                key={tab.value}
                value={tab.value} 
                className="relative flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-transparent border-0 shadow-none rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all group"
              >
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                <span className={`font-semibold transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    layoutId="activeToolTab"
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
