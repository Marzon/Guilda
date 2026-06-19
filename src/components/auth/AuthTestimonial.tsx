import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SmartAvatar } from "@/components/GuildaAvatar";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { useTranslation } from "react-i18next";
import { Sparkles, Quote } from "lucide-react";
import { AuthAccelerationBanner } from "./AuthAccelerationBanner";

interface Testimonial {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  archetype: "BUILDER" | "SELLER" | "INVESTOR";
  quote: string;
  offering: string | null;
}

const extractBestQuote = (rawQuote: string): string => {
  // Split by common separators
  const lines = rawQuote.split(/\n|(?<=[.!?])\s+(?=[A-Z])/);
  
  // Find the most impactful line (usually mentions results, time saved, or emotional impact)
  const impactKeywords = ['encontrei', 'menos de', 'semana', 'meses', 'economiz', 'validei', 'perfeito', 'match', 'incrível', 'recomendo'];
  
  for (const line of lines) {
    const cleanLine = line.trim();
    if (cleanLine.length > 30 && cleanLine.length < 200) {
      const hasImpact = impactKeywords.some(kw => cleanLine.toLowerCase().includes(kw));
      if (hasImpact) {
        return cleanLine;
      }
    }
  }
  
  // Fallback: return first substantial line
  const firstGood = lines.find(l => l.trim().length > 30 && l.trim().length < 200);
  return firstGood?.trim() || rawQuote.slice(0, 150) + '...';
};

export const AuthTestimonial = () => {
  const { t } = useTranslation();
  const { data: stats } = usePlatformStats();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  const { data: testimonials } = useQuery({
    queryKey: ["auth-testimonials-featured"],
    queryFn: async (): Promise<Testimonial[]> => {
      const { data, error } = await supabase.rpc('get_auth_page_testimonials');

      if (error || !data) return [];

      return (data as any[]).map((t) => ({
        id: t.id,
        user_id: t.user_id,
        username: t.username || "Fundador",
        avatar_url: t.avatar_url,
        archetype: (t.archetype || "BUILDER") as "BUILDER" | "SELLER" | "INVESTOR",
        quote: extractBestQuote(t.quote),
        offering: t.offering || null,
      }));
    },
    staleTime: 5 * 60_000,
  });

  // Auto-rotate testimonials every 4 seconds
  useEffect(() => {
    if (!testimonials || testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        setIsTransitioning(false);
        // Trigger pulse effect after content changes
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 600);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [testimonials]);

  const fallbackTestimonial: Testimonial = {
    id: "fallback",
    user_id: "fallback",
    username: "Fundador Guilda",
    avatar_url: null,
    archetype: "BUILDER",
    quote: "Encontrei meu sócio técnico em menos de uma semana. O match de skills foi perfeito para nosso estágio.",
    offering: null,
  };

  const displayTestimonial = testimonials?.[currentIndex] || fallbackTestimonial;
  const founderCount = stats?.total_profiles ? Math.floor(stats.total_profiles / 10) * 10 : 600;

  const archetypeLabel = {
    BUILDER: "Builder",
    SELLER: "Seller", 
    INVESTOR: "Investor",
  }[displayTestimonial.archetype];

  const archetypeColor = {
    BUILDER: "text-builder",
    SELLER: "text-seller",
    INVESTOR: "text-emerald-500",
  }[displayTestimonial.archetype];

  return (
    <div className="space-y-8 text-white">
      {/* Testimonial Card */}
      <div className={`relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl transition-all duration-500 ${isPulsing ? 'scale-[1.02] shadow-purple-500/30 shadow-2xl border-purple-400/40' : ''}`}>
        {/* Badge */}
        <div className="absolute -top-3 left-6 inline-flex items-center gap-1.5 bg-purple-600 px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span className="text-xs font-semibold text-white">
            Depoimento Real
          </span>
        </div>

        <div className={`pt-4 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {/* User Info */}
          <div className="flex items-center gap-3 mb-4">
            <SmartAvatar
              avatarUrl={displayTestimonial.avatar_url}
              name={displayTestimonial.username}
              archetype={displayTestimonial.archetype}
              size="md"
            />
            <div>
              <p className="font-bold text-white">
                @{displayTestimonial.username}
              </p>
              {displayTestimonial.offering && (
                <p className="text-xs text-slate-400">
                  {displayTestimonial.offering}
                </p>
              )}
              <p className={`text-sm font-medium ${archetypeColor}`}>
                {archetypeLabel}
              </p>
            </div>
          </div>

          {/* Quote */}
          <div className="relative">
            <Quote className="absolute -top-1 -left-1 w-6 h-6 text-purple-400/50" />
            <p className="text-slate-300 leading-relaxed pl-6 italic">
              "{displayTestimonial.quote}"
            </p>
          </div>
        </div>

        {/* Dots indicator */}
        {testimonials && testimonials.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-4 pt-4 border-t border-white/10">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setCurrentIndex(idx);
                    setIsTransitioning(false);
                  }, 300);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex 
                    ? 'bg-purple-500 w-4' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Ver depoimento ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Headline */}
      <div className="space-y-4">
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
          {t('auth.brandTitle', 'Construa o futuro.')}<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            {t('auth.brandSubtitle2', 'Não faça isso sozinho.')}
          </span>
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed">
          Junte-se a {founderCount}+ fundadores, builders e sellers que estão construindo startups de forma colaborativa.
        </p>
      </div>

      {/* Acceleration Program Banner - Only on larger screens */}
      <div className="hidden lg:block">
        <AuthAccelerationBanner />
      </div>
    </div>
  );

};
