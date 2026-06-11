import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Archetype } from "@/types/archetype";

interface GuildaAvatarProps {
  name: string;
  oderId?: string;
  archetype?: Archetype;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  showBorder?: boolean;
}

// RPG-themed color palettes - Updated with new brand colors
const builderPalettes = [
  { bg: "#0A0B24", accent: "#7610DC", glow: "#A728EB" }, // New primary palette
  { bg: "#1e293b", accent: "#3b82f6", glow: "#60a5fa" }, // Blue forge
  { bg: "#1f2937", accent: "#4308B0", glow: "#7610DC" }, // Deep purple
  { bg: "#0f172a", accent: "#10b981", glow: "#34d399" }, // Green matrix
];

const sellerPalettes = [
  { bg: "#451a03", accent: "#F97316", glow: "#fbbf24" }, // New accent orange
  { bg: "#4c1d95", accent: "#A728EB", glow: "#c084fc" }, // Light purple
  { bg: "#7c2d12", accent: "#ef4444", glow: "#f87171" }, // Red bard
  { bg: "#0A0B24", accent: "#ec4899", glow: "#f472b6" }, // Pink on navy
];

const investorPalettes = [
  { bg: "#064e3b", accent: "#10b981", glow: "#34d399" }, // Green wealth
  { bg: "#0A0B24", accent: "#7610DC", glow: "#A728EB" }, // Primary purple
  { bg: "#1c1917", accent: "#fbbf24", glow: "#fcd34d" }, // Gold luxury
  { bg: "#0c4a6e", accent: "#0ea5e9", glow: "#38bdf8" }, // Sky finance
];

const starterPalettes = [
  { bg: "#4308B0", accent: "#A728EB", glow: "#c084fc" }, // Deep to light purple
  { bg: "#0A0B24", accent: "#7610DC", glow: "#A728EB" }, // Navy with primary
  { bg: "#3f3f46", accent: "#d946ef", glow: "#f0abfc" }, // Fuchsia spark
  { bg: "#27272a", accent: "#F97316", glow: "#fbbf24" }, // Orange ambition
];

// RPG symbols for each archetype
const builderSymbols = [
  "⚒️", "🔧", "⚙️", "🛠️", "💻", "🔨", "⚡", "🧪",
];

const sellerSymbols = [
  "📣", "💎", "🎯", "🏆", "👑", "⚔️", "🎪", "🗡️",
];

const investorSymbols = [
  "💵", "📊", "💎", "🏦", "💰", "📈", "🎩", "🔑",
];

const starterSymbols = [
  "🌱", "✨", "🚀", "💫", "🌟", "🔮", "🎯", "💡",
];

// Generate consistent hash from string
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

// Generate RPG-style pattern SVG
const generateRPGPattern = (seed: string, palette: { bg: string; accent: string; glow: string }) => {
  const hash = hashString(seed);
  const patternType = hash % 4;
  
  const patterns: Record<number, string> = {
    // Shield pattern
    0: `
      <defs>
        <linearGradient id="grad-${seed}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${palette.bg};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${palette.accent};stop-opacity:0.3" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#grad-${seed})"/>
      <path d="M50 10 L90 30 L90 60 L50 90 L10 60 L10 30 Z" fill="none" stroke="${palette.accent}" stroke-width="2" opacity="0.4"/>
      <path d="M50 20 L80 35 L80 55 L50 80 L20 55 L20 35 Z" fill="none" stroke="${palette.glow}" stroke-width="1" opacity="0.3"/>
    `,
    // Rune circle
    1: `
      <defs>
        <radialGradient id="grad-${seed}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:${palette.accent};stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:${palette.bg};stop-opacity:1" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill="url(#grad-${seed})"/>
      <circle cx="50" cy="50" r="35" fill="none" stroke="${palette.accent}" stroke-width="2" opacity="0.4"/>
      <circle cx="50" cy="50" r="25" fill="none" stroke="${palette.glow}" stroke-width="1" opacity="0.3"/>
      <circle cx="50" cy="50" r="15" fill="none" stroke="${palette.accent}" stroke-width="0.5" opacity="0.2"/>
    `,
    // Diamond grid
    2: `
      <rect width="100" height="100" fill="${palette.bg}"/>
      <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="none" stroke="${palette.accent}" stroke-width="2" opacity="0.3"/>
      <path d="M50 15 L85 50 L50 85 L15 50 Z" fill="none" stroke="${palette.glow}" stroke-width="1" opacity="0.25"/>
      <line x1="0" y1="50" x2="100" y2="50" stroke="${palette.accent}" stroke-width="0.5" opacity="0.2"/>
      <line x1="50" y1="0" x2="50" y2="100" stroke="${palette.accent}" stroke-width="0.5" opacity="0.2"/>
    `,
    // Tribal marks
    3: `
      <rect width="100" height="100" fill="${palette.bg}"/>
      <path d="M20 20 L50 10 L80 20" fill="none" stroke="${palette.accent}" stroke-width="2" opacity="0.4"/>
      <path d="M20 80 L50 90 L80 80" fill="none" stroke="${palette.accent}" stroke-width="2" opacity="0.4"/>
      <path d="M30 40 L50 30 L70 40" fill="none" stroke="${palette.glow}" stroke-width="1" opacity="0.3"/>
      <path d="M30 60 L50 70 L70 60" fill="none" stroke="${palette.glow}" stroke-width="1" opacity="0.3"/>
    `,
  };
  
  return patterns[patternType];
};

const sizeConfig = {
  xs: { container: "w-6 h-6", text: "text-[8px]", symbol: "text-xs" },
  sm: { container: "w-8 h-8", text: "text-[10px]", symbol: "text-sm" },
  md: { container: "w-10 h-10", text: "text-xs", symbol: "text-base" },
  lg: { container: "w-12 h-12", text: "text-sm", symbol: "text-lg" },
  xl: { container: "w-20 h-20", text: "text-xl", symbol: "text-2xl" },
  "2xl": { container: "w-28 h-28", text: "text-2xl", symbol: "text-3xl" },
};

export const GuildaAvatar = ({ 
  name, 
  oderId,
  archetype = "BUILDER",
  size = "md", 
  className,
  showBorder = true,
}: GuildaAvatarProps) => {
  const seed = oderId || name;
  const hash = useMemo(() => hashString(seed), [seed]);
  
  const { palette, symbol, initials, svgPattern } = useMemo(() => {
    const getPalettes = () => {
      if (archetype === "BUILDER") return builderPalettes;
      if (archetype === "INVESTOR") return investorPalettes;
      if (archetype === "STARTER") return starterPalettes;
      return sellerPalettes;
    };
    const getSymbols = () => {
      if (archetype === "BUILDER") return builderSymbols;
      if (archetype === "INVESTOR") return investorSymbols;
      if (archetype === "STARTER") return starterSymbols;
      return sellerSymbols;
    };
    const palettes = getPalettes();
    const symbols = getSymbols();
    const selectedPalette = palettes[hash % palettes.length];
    const selectedSymbol = symbols[hash % symbols.length];
    
    // Get initials
    const parts = name.trim().split(/\s+/);
    const initials = parts.length >= 2 
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
    
    return {
      palette: selectedPalette,
      symbol: selectedSymbol,
      initials,
      svgPattern: generateRPGPattern(seed, selectedPalette),
    };
  }, [seed, hash, name, archetype]);

  const svgDataUrl = useMemo(() => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        ${svgPattern}
      </svg>
    `;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }, [svgPattern]);

  const sizeClasses = sizeConfig[size];
  const borderColor = archetype === "BUILDER" ? "ring-blue-400/50" : "ring-amber-400/50";

  return (
    <div 
      className={cn(
        "relative rounded-2xl overflow-hidden flex items-center justify-center font-bold shadow-lg",
        sizeClasses.container,
        showBorder && `ring-2 ${borderColor}`,
        className
      )}
    >
      <img 
        src={svgDataUrl} 
        alt="" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="relative z-10 flex flex-col items-center justify-center">
        <span className={cn(sizeClasses.symbol, "drop-shadow-lg")}>
          {symbol}
        </span>
        {size === "xl" && (
          <span 
            className={cn(
              "text-[10px] font-bold tracking-wider mt-0.5 drop-shadow-sm",
              "text-white/90"
            )}
          >
            {initials}
          </span>
        )}
      </div>
      {/* Glow effect */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ 
          background: `radial-gradient(circle at 30% 30%, ${palette.glow}, transparent 60%)` 
        }}
      />
    </div>
  );
};

// Helper component for using with existing avatar_url logic
interface SmartAvatarProps {
  avatarUrl?: string | null;
  name: string;
  oderId?: string;
  archetype?: Archetype;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  isOnline?: boolean;
}

const imageSizeMap = {
  xs: "w-6 h-6",
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
  xl: "w-20 h-20",
  "2xl": "w-28 h-28",
};

export const SmartAvatar = ({
  avatarUrl,
  name,
  oderId,
  archetype = "BUILDER",
  size = "md",
  className,
  isOnline,
}: SmartAvatarProps) => {
  const borderColor = archetype === "BUILDER" ? "ring-blue-400/50" : "ring-amber-400/50";
  const onlineRing = isOnline ? "ring-2 ring-green-400 ring-offset-2" : "";

  if (avatarUrl) {
    return (
      <div className="relative">
        <img
          src={avatarUrl}
          alt={name}
          className={cn(
            "rounded-2xl object-cover shadow-lg",
            imageSizeMap[size],
            `ring-2 ${borderColor}`,
            onlineRing,
            className
          )}
        />
        {isOnline && (
          <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <GuildaAvatar 
        name={name}
        oderId={oderId}
        archetype={archetype}
        size={size}
        className={cn(onlineRing, className)}
      />
      {isOnline && (
        <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
      )}
    </div>
  );
};
