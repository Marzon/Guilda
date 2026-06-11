import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  Axe, Calculator, Brain, Percent, DollarSign, TrendingDown, 
  PieChart, FileText, CreditCard, Target, BarChart3, ClipboardList,
  BookOpen, Users, Folder, Code, Scale, ArrowRight, Sparkles
} from "lucide-react";

interface ToolsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TOOLS_MAP: Record<string, { icon: React.ComponentType<{ className?: string }>, path: string, color: string, bg: string }> = {
  "markup-calculator": { icon: Calculator, path: "/tools/markup-calculator", color: "text-orange-600", bg: "bg-yellow-100" },
  "business-health-quiz": { icon: Brain, path: "/tools/business-health-quiz", color: "text-teal-600", bg: "bg-teal-100" },
  "equity-calculator": { icon: Percent, path: "/tools/equity-calculator", color: "text-purple-600", bg: "bg-purple-100" },
  "valuation-calculator": { icon: DollarSign, path: "/tools/valuation-calculator", color: "text-emerald-600", bg: "bg-emerald-100" },
  "runway-calculator": { icon: TrendingDown, path: "/tools/runway-calculator", color: "text-blue-600", bg: "bg-blue-100" },
  "unit-economics": { icon: Calculator, path: "/tools/unit-economics", color: "text-amber-600", bg: "bg-amber-100" },
  "cap-table": { icon: PieChart, path: "/tools/cap-table", color: "text-rose-600", bg: "bg-rose-100" },
  "contract-generator": { icon: FileText, path: "/tools/contract-generator", color: "text-indigo-600", bg: "bg-indigo-100" },
  "card-fee-simulator": { icon: CreditCard, path: "/tools/card-fee-simulator", color: "text-violet-600", bg: "bg-violet-100" },
  "breakeven-calculator": { icon: Target, path: "/tools/breakeven-calculator", color: "text-cyan-600", bg: "bg-cyan-100" },
  "roi-calculator": { icon: BarChart3, path: "/tools/roi-calculator", color: "text-green-600", bg: "bg-green-100" },
  "proposal-generator": { icon: FileText, path: "/tools/proposal-generator", color: "text-pink-600", bg: "bg-pink-100" },
  "company-opening-checklist": { icon: ClipboardList, path: "/tools/company-opening-checklist", color: "text-sky-600", bg: "bg-sky-100" },
  "lgpd-guide": { icon: BookOpen, path: "/tools/lgpd-guide", color: "text-red-600", bg: "bg-red-100" },
  "recruiting-guide": { icon: Users, path: "/tools/recruiting-guide", color: "text-lime-600", bg: "bg-lime-100" },
  "data-room-guide": { icon: Folder, path: "/tools/data-room-guide", color: "text-fuchsia-600", bg: "bg-fuchsia-100" },
  "mvp-vibecoding": { icon: Code, path: "/tools/mvp-vibecoding", color: "text-yellow-600", bg: "bg-yellow-100" },
  "burn-rate-optimizer": { icon: TrendingDown, path: "/tools/burn-rate-optimizer", color: "text-orange-500", bg: "bg-orange-100" },
  "archetype-quiz": { icon: Brain, path: "/tools/archetype-quiz", color: "text-purple-500", bg: "bg-purple-100" },
  "tam-sam-som": { icon: Target, path: "/tools/tam-sam-som", color: "text-blue-500", bg: "bg-blue-100" },
  "business-model-canvas": { icon: ClipboardList, path: "/tools/business-model-canvas", color: "text-indigo-500", bg: "bg-indigo-100" },
  "empathy-map": { icon: Users, path: "/tools/empathy-map", color: "text-pink-500", bg: "bg-pink-100" },
  "customer-development": { icon: Users, path: "/tools/customer-development", color: "text-teal-500", bg: "bg-teal-100" },
  "swot-analysis": { icon: Scale, path: "/tools/swot-analysis", color: "text-emerald-500", bg: "bg-emerald-100" },
  "knowledge-roadmap": { icon: BookOpen, path: "/tools/knowledge-roadmap", color: "text-amber-600", bg: "bg-amber-100" },
};

const DEFAULT_TOOLS = [
  "knowledge-roadmap", "markup-calculator", "business-health-quiz", "equity-calculator", 
  "valuation-calculator", "runway-calculator", "unit-economics", "cap-table", "contract-generator"
];

export const ToolsDrawer = ({ open, onOpenChange }: ToolsDrawerProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [recentTools, setRecentTools] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("recentTools");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRecentTools(parsed.slice(0, 3));
      } catch {
        setRecentTools([]);
      }
    }
  }, [open]);

  const handleToolClick = (toolId: string, path: string) => {
    // Update recent tools
    const updated = [toolId, ...recentTools.filter(t => t !== toolId)].slice(0, 5);
    localStorage.setItem("recentTools", JSON.stringify(updated));
    setRecentTools(updated.slice(0, 3));
    
    navigate(path);
    onOpenChange(false);
  };

  const handleViewAll = () => {
    navigate("/tools");
    onOpenChange(false);
  };

  const getToolData = (toolId: string) => {
    const tool = TOOLS_MAP[toolId];
    if (!tool) return null;
    
    return {
      id: toolId,
      icon: tool.icon,
      path: tool.path,
      color: tool.color,
      bg: tool.bg,
      title: t(`tools.${toolId}.title`, toolId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())),
      description: t(`tools.${toolId}.description`, "")
    };
  };

  const allTools = useMemo(() => {
    // Combine recent tools first, then other tools
    const recentSet = new Set(recentTools);
    const recentData = recentTools.map(getToolData).filter(Boolean);
    const otherData = DEFAULT_TOOLS
      .filter(id => !recentSet.has(id))
      .slice(0, 9 - recentData.length)
      .map(getToolData)
      .filter(Boolean);
    return [...recentData, ...otherData];
  }, [recentTools, t]);

  const renderToolItem = (tool: ReturnType<typeof getToolData>, index: number) => {
    if (!tool) return null;
    const Icon = tool.icon;
    return (
      <button
        key={tool.id}
        onClick={() => handleToolClick(tool.id, tool.path)}
        className="w-full flex items-center gap-4 py-3 px-2 rounded-xl transition-all group text-left animate-fade-in"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className={`w-16 h-16 rounded-3xl ${tool.bg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-7 h-7 ${tool.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
            {tool.title}
          </h4>
          <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1">
            {tool.description}
          </p>
        </div>
        <ArrowRight className="w-5 h-5 text-amber-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all shrink-0" />
      </button>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[400px] h-full p-0 bg-white dark:bg-gray-900 flex flex-col">
        <SheetHeader className="p-5 pb-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <SheetTitle className="flex items-center gap-2.5 text-lg font-bold text-gray-900 dark:text-white">
            <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center">
              <Axe className="w-6 h-6 text-white" />
            </div>
            {t("tools.arsenal", "Arsenal")}
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-white dark:bg-gray-900">
          {allTools.map((tool, index) => renderToolItem(tool, index))}
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
          <Button
            onClick={handleViewAll}
            variant="outline"
            className="w-full gap-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            {t("tools.viewAll", "Ver todas as ferramentas")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
