import { ComponentType } from "react";
import {
  Calculator, Brain, Percent, DollarSign, TrendingDown,
  PieChart, FileText, CreditCard, Target, BarChart3, ClipboardList,
  BookOpen, Users, Folder, Code, Scale, Sparkles, Shield, UserPlus,
  LayoutGrid, Grid3X3, Scissors, HelpCircle, TrendingUp, ClipboardCheck,
  FolderOpen, Activity, Send
} from "lucide-react";

export interface ToolDefinition {
  id: string;
  icon: ComponentType<{ className?: string }>;
  path: string;
  category: "sales" | "financial" | "legal" | "team" | "growth";
  color: string;
  bg: string;
  isNew: boolean;
  featured: boolean;
  /** ISO date string when the tool was added - used for sorting */
  addedAt: string;
}

/**
 * Single source of truth for all tools in the platform.
 * 
 * IMPORTANT: When adding a new tool, add it to the TOP of this array with:
 * - isNew: true
 * - addedAt: current date in ISO format (e.g., "2025-01-11")
 * 
 * The tools will automatically be sorted by addedAt date (newest first)
 * in the Quick Access page.
 */
export const TOOLS_REGISTRY: ToolDefinition[] = [
  // === NEWEST TOOLS GO HERE (at the top) ===
  {
    id: "cold-outreach",
    icon: Send,
    path: "/tools/cold-outreach",
    category: "sales",
    color: "text-sky-600",
    bg: "bg-sky-100",
    isNew: true,
    featured: true,
    addedAt: "2025-01-18",
  },
  {
    id: "guilda-ia-mvp",
    icon: Sparkles,
    path: "/tools/guilda-ia-mvp",
    category: "growth",
    color: "text-violet-600",
    bg: "bg-violet-100",
    isNew: true,
    featured: true,
    addedAt: "2025-01-11",
  },
  {
    id: "knowledge-roadmap",
    icon: BookOpen,
    path: "/tools/knowledge-roadmap",
    category: "growth",
    color: "text-amber-600",
    bg: "bg-amber-100",
    isNew: true,
    featured: true,
    addedAt: "2025-01-10",
  },
  {
    id: "mvp-vibecoding",
    icon: Code,
    path: "/tools/mvp-vibecoding",
    category: "growth",
    color: "text-yellow-600",
    bg: "bg-yellow-100",
    isNew: true,
    featured: false,
    addedAt: "2025-01-09",
  },
  // === RECENTLY ADDED ===
  {
    id: "markup-calculator",
    icon: Calculator,
    path: "/tools/markup-calculator",
    category: "sales",
    color: "text-orange-600",
    bg: "bg-yellow-100",
    isNew: true,
    featured: true,
    addedAt: "2025-01-05",
  },
  {
    id: "card-fee-simulator",
    icon: CreditCard,
    path: "/tools/card-fee-simulator",
    category: "sales",
    color: "text-violet-600",
    bg: "bg-violet-100",
    isNew: true,
    featured: false,
    addedAt: "2025-01-05",
  },
  {
    id: "business-health-quiz",
    icon: Brain,
    path: "/tools/business-health-quiz",
    category: "sales",
    color: "text-teal-600",
    bg: "bg-teal-100",
    isNew: true,
    featured: true,
    addedAt: "2025-01-04",
  },
  {
    id: "breakeven-calculator",
    icon: Target,
    path: "/tools/breakeven-calculator",
    category: "financial",
    color: "text-cyan-600",
    bg: "bg-cyan-100",
    isNew: true,
    featured: false,
    addedAt: "2025-01-04",
  },
  {
    id: "roi-calculator",
    icon: BarChart3,
    path: "/tools/roi-calculator",
    category: "financial",
    color: "text-green-600",
    bg: "bg-green-100",
    isNew: true,
    featured: false,
    addedAt: "2025-01-03",
  },
  {
    id: "proposal-generator",
    icon: FileText,
    path: "/tools/proposal-generator",
    category: "sales",
    color: "text-pink-600",
    bg: "bg-pink-100",
    isNew: true,
    featured: false,
    addedAt: "2025-01-02",
  },
  {
    id: "company-opening-checklist",
    icon: ClipboardList,
    path: "/tools/company-opening-checklist",
    category: "legal",
    color: "text-sky-600",
    bg: "bg-sky-100",
    isNew: true,
    featured: false,
    addedAt: "2025-01-01",
  },
  // === EXISTING TOOLS ===
  {
    id: "equity-calculator",
    icon: Percent,
    path: "/tools/equity-calculator",
    category: "team",
    color: "text-purple-600",
    bg: "bg-purple-100",
    isNew: false,
    featured: true,
    addedAt: "2024-12-01",
  },
  {
    id: "valuation-calculator",
    icon: DollarSign,
    path: "/tools/valuation-calculator",
    category: "financial",
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    isNew: false,
    featured: true,
    addedAt: "2024-12-01",
  },
  {
    id: "contract-generator",
    icon: FileText,
    path: "/tools/contract-generator",
    category: "legal",
    color: "text-indigo-600",
    bg: "bg-indigo-100",
    isNew: false,
    featured: false,
    addedAt: "2024-12-01",
  },
  {
    id: "runway-calculator",
    icon: TrendingDown,
    path: "/tools/runway-calculator",
    category: "financial",
    color: "text-blue-600",
    bg: "bg-blue-100",
    isNew: false,
    featured: false,
    addedAt: "2024-12-01",
  },
  {
    id: "unit-economics",
    icon: Calculator,
    path: "/tools/unit-economics",
    category: "financial",
    color: "text-amber-600",
    bg: "bg-amber-100",
    isNew: false,
    featured: false,
    addedAt: "2024-12-01",
  },
  {
    id: "cap-table",
    icon: PieChart,
    path: "/tools/cap-table",
    category: "team",
    color: "text-rose-600",
    bg: "bg-rose-100",
    isNew: false,
    featured: false,
    addedAt: "2024-12-01",
  },
  {
    id: "burn-rate-optimizer",
    icon: TrendingDown,
    path: "/tools/burn-rate-optimizer",
    category: "financial",
    color: "text-orange-500",
    bg: "bg-orange-100",
    isNew: false,
    featured: false,
    addedAt: "2024-12-01",
  },
  {
    id: "archetype-quiz",
    icon: Brain,
    path: "/tools/archetype-quiz",
    category: "team",
    color: "text-purple-500",
    bg: "bg-purple-100",
    isNew: false,
    featured: false,
    addedAt: "2024-12-01",
  },
  {
    id: "business-model",
    icon: ClipboardList,
    path: "/tools/business-model",
    category: "growth",
    color: "text-indigo-500",
    bg: "bg-indigo-100",
    isNew: false,
    featured: false,
    addedAt: "2024-12-01",
  },
  {
    id: "tam-sam-som",
    icon: Target,
    path: "/tools/tam-sam-som",
    category: "growth",
    color: "text-blue-500",
    bg: "bg-blue-100",
    isNew: false,
    featured: false,
    addedAt: "2024-12-01",
  },
  {
    id: "empathy-map",
    icon: Users,
    path: "/tools/empathy-map",
    category: "growth",
    color: "text-pink-500",
    bg: "bg-pink-100",
    isNew: false,
    featured: false,
    addedAt: "2024-12-01",
  },
  {
    id: "swot",
    icon: Scale,
    path: "/tools/swot",
    category: "growth",
    color: "text-emerald-500",
    bg: "bg-emerald-100",
    isNew: false,
    featured: false,
    addedAt: "2024-12-01",
  },
  {
    id: "customer-dev",
    icon: Users,
    path: "/tools/customer-dev",
    category: "growth",
    color: "text-teal-500",
    bg: "bg-teal-100",
    isNew: false,
    featured: false,
    addedAt: "2024-12-01",
  },
  {
    id: "lgpd-guide",
    icon: BookOpen,
    path: "/tools/lgpd-guide",
    category: "legal",
    color: "text-red-600",
    bg: "bg-red-100",
    isNew: false,
    featured: false,
    addedAt: "2024-12-01",
  },
  {
    id: "recruiting-guide",
    icon: Users,
    path: "/tools/recruiting-guide",
    category: "team",
    color: "text-lime-600",
    bg: "bg-lime-100",
    isNew: false,
    featured: false,
    addedAt: "2024-12-01",
  },
  {
    id: "dataroom-guide",
    icon: Folder,
    path: "/tools/dataroom-guide",
    category: "legal",
    color: "text-fuchsia-600",
    bg: "bg-fuchsia-100",
    isNew: false,
    featured: false,
    addedAt: "2024-12-01",
  },
];

/**
 * Get all tools sorted by date (newest first)
 */
export const getToolsSortedByDate = () => {
  return [...TOOLS_REGISTRY].sort((a, b) => 
    new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
  );
};

/**
 * Get tool by ID
 */
export const getToolById = (id: string) => {
  return TOOLS_REGISTRY.find(tool => tool.id === id);
};

/**
 * Get all tool IDs
 */
export const getAllToolIds = () => {
  return TOOLS_REGISTRY.map(tool => tool.id);
};
