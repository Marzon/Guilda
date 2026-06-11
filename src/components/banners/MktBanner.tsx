import { useState } from "react";
import { useFilteredMktBanners, type MktBanner } from "@/hooks/useMktBanners";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Crown, Rocket, MessageCircle, Info, AlertTriangle,
  CheckCircle, Sparkles, Zap, Gift, Star, Bell, Heart,
  Trophy, Target, Users, Calendar, Clock, ArrowRight
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Crown,
  Rocket,
  MessageCircle,
  Info,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Zap,
  Gift,
  Star,
  Bell,
  Heart,
  Trophy,
  Target,
  Users,
  Calendar,
  Clock,
  ArrowRight,
};

const variantClasses: Record<string, string> = {
  default: "bg-primary text-primary-foreground",
  success: "bg-green-600 text-white",
  warning: "bg-amber-500 text-white",
  info: "bg-blue-600 text-white",
  gradient: "text-white",
  custom: "",
};

interface MktBannerProps {
  type?: "top_bar" | "modal" | "floating" | "inline";
  maxBanners?: number;
}

export function MktBannerDisplay({ type, maxBanners = 1 }: MktBannerProps) {
  const { banners, isLoading, dismissBanner, trackClick } = useFilteredMktBanners(type);
  const displayBanners = banners.slice(0, maxBanners);

  if (isLoading || displayBanners.length === 0) {
    return null;
  }

  const handleClick = (banner: MktBanner, link?: string | null) => {
    if (!link) return;
    
    trackClick(banner.id);
    
    if (link.startsWith('http')) {
      window.open(link, '_blank');
    } else {
      window.location.href = link;
    }
  };

  return (
    <>
      {displayBanners.map(banner => (
        <BannerRenderer
          key={banner.id}
          banner={banner}
          onDismiss={() => banner.slug && dismissBanner(banner.slug, banner.id)}
          onClick={(link) => handleClick(banner, link)}
        />
      ))}
    </>
  );
}

interface BannerRendererProps {
  banner: MktBanner;
  onDismiss: () => void;
  onClick: (link?: string | null) => void;
}

function BannerRenderer({ banner, onDismiss, onClick }: BannerRendererProps) {
  const Icon = banner.icon ? iconMap[banner.icon] : null;
  const [isVisible, setIsVisible] = useState(true);

  const getBackgroundStyle = () => {
    if (banner.variant === "gradient" && banner.custom_gradient) {
      return `bg-gradient-to-r ${banner.custom_gradient}`;
    }
    if (banner.variant === "custom" && banner.custom_bg_color && !banner.custom_bg_color.startsWith("#")) {
      return banner.custom_bg_color;
    }
    return variantClasses[banner.variant] || variantClasses.default;
  };

  const getInlineStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {};
    if (banner.variant === "custom") {
      if (banner.custom_bg_color?.startsWith("#")) {
        style.backgroundColor = banner.custom_bg_color;
      }
      if (banner.custom_text_color?.startsWith("#")) {
        style.color = banner.custom_text_color;
      }
    }
    return style;
  };

  const handleDismissClick = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  // Top Bar
  if (banner.type === "top_bar") {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`relative z-40 mt-[88px] sm:mt-20 py-3 px-4 sm:py-4 sm:px-6 ${getBackgroundStyle()}`}
            style={getInlineStyle()}
          >
            {banner.is_dismissible && (
              <button
                onClick={handleDismissClick}
                className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Fechar banner"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {Icon && (
                  <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white/10">
                    <Icon className="w-5 h-5" />
                  </div>
                )}
                <div className="text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    {Icon && <Icon className="w-5 h-5 text-yellow-300" />}
                    <span className="font-bold text-lg">{banner.title}</span>
                  </div>
                  {banner.description && (
                    <p className="text-sm opacity-90">{banner.description}</p>
                  )}
                </div>
              </div>

              {banner.cta_text && (
                <Button
                  onClick={() => onClick(banner.cta_link)}
                  className="bg-white text-purple-600 hover:bg-purple-50 font-semibold whitespace-nowrap"
                >
                  {Icon && <Sparkles className="w-4 h-4 mr-2" />}
                  {banner.cta_text}
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Modal
  if (banner.type === "modal") {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={banner.is_dismissible ? handleDismissClick : undefined}
          >
            <motion.div
              className={`relative rounded-2xl p-6 max-w-md w-full border shadow-2xl ${getBackgroundStyle()}`}
              style={getInlineStyle()}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {banner.is_dismissible && (
                <button
                  onClick={handleDismissClick}
                  className="absolute top-4 right-4 opacity-60 hover:opacity-100 transition-opacity"
                  aria-label="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>
              )}

              <div className="text-center">
                {Icon && (
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 mb-4">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                )}

                <h2 className="text-2xl font-bold mb-2">{banner.title}</h2>
                {banner.description && (
                  <p className="opacity-90 font-medium mb-4">{banner.description}</p>
                )}

                <div className="space-y-3 mt-6">
                  {banner.cta_text && (
                    <Button
                      onClick={() => onClick(banner.cta_link)}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                    >
                      {banner.cta_text}
                    </Button>
                  )}
                  {banner.secondary_cta_text && (
                    <Button
                      onClick={() => onClick(banner.secondary_cta_link)}
                      variant="outline"
                      className="w-full border-amber-500/50 hover:bg-amber-500/10"
                    >
                      {banner.secondary_cta_text}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Floating
  if (banner.type === "floating") {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`fixed bottom-4 right-4 z-50 rounded-xl p-4 max-w-xs shadow-lg ${getBackgroundStyle()}`}
            style={getInlineStyle()}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            {banner.is_dismissible && (
              <button
                onClick={handleDismissClick}
                className="absolute top-2 right-2 opacity-60 hover:opacity-100"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <div className="flex items-start gap-3 pr-4">
              {Icon && <Icon className="h-6 w-6 flex-shrink-0 mt-0.5" />}
              <div>
                <h3 className="font-semibold text-sm">{banner.title}</h3>
                {banner.description && (
                  <p className="text-xs opacity-80 mt-1">{banner.description}</p>
                )}
                {banner.cta_text && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="mt-2"
                    onClick={() => onClick(banner.cta_link)}
                  >
                    {banner.cta_text}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Inline
  if (banner.type === "inline") {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`rounded-lg p-4 ${getBackgroundStyle()}`}
            style={getInlineStyle()}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                <div className="min-w-0 flex-1">
                  <span className="font-medium">{banner.title}</span>
                  {banner.description && (
                    <span className="text-sm opacity-80 ml-2">{banner.description}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {banner.cta_text && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onClick(banner.cta_link)}
                  >
                    {banner.cta_text}
                  </Button>
                )}
                {banner.is_dismissible && (
                  <button
                    onClick={handleDismissClick}
                    className="p-1 opacity-60 hover:opacity-100"
                    aria-label="Fechar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return null;
}
