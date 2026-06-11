import { Quote, Rocket, Skull } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SmartAvatar } from "@/components/GuildaAvatar";
import { Skeleton } from "@/components/ui/skeleton";

interface Testimonial {
  id: string;
  user_id: string;
  quote: string;
  username: string;
  avatar_url: string | null;
  archetype: "BUILDER" | "SELLER" | "INVESTOR";
}

// Fallback testimonials while we don't have real ones
const fallbackTestimonials = [
  {
    id: "1",
    quote: "Eu achava que precisava de 3 meses para lançar. Lancei em 4 dias e vendi no quinto.",
    author: "Founder Ciclo 1",
    result: "DO" as const,
  },
  {
    id: "2",
    quote: "Matei minha ideia no dia 10. Foi a melhor coisa que me aconteceu. Economizei R$ 50k que iria gastar em desenvolvimento inútil.",
    author: "Founder Ciclo 1",
    result: "DIE" as const,
  },
];

const extractBestQuote = (rawQuote: string): string => {
  const lines = rawQuote.split(/\n|(?<=[.!?])\s+(?=[A-Z])/);
  const impactKeywords = ['encontrei', 'menos de', 'semana', 'meses', 'economiz', 'validei', 'perfeito', 'match', 'incrível', 'recomendo'];
  
  for (const line of lines) {
    const cleanLine = line.trim();
    if (cleanLine.length > 30 && cleanLine.length < 200) {
      const hasImpact = impactKeywords.some(kw => cleanLine.toLowerCase().includes(kw));
      if (hasImpact) return cleanLine;
    }
  }
  
  const firstGood = lines.find(l => l.trim().length > 30 && l.trim().length < 200);
  return firstGood?.trim() || rawQuote.slice(0, 150) + '...';
};

const DoOrDieTestimonials = () => {
  // Fetch real testimonials using the same RPC as AuthTestimonial
  const { data: testimonials, isLoading } = useQuery({
    queryKey: ["do-or-die-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_auth_page_testimonials');
      
      if (error || !data) {
        console.error("Error fetching testimonials:", error);
        return null;
      }
      
      return (data as any[]).map((t) => ({
        id: t.id,
        user_id: t.user_id,
        quote: extractBestQuote(t.quote),
        username: t.username || "Founder",
        avatar_url: t.avatar_url,
        archetype: (t.archetype || "BUILDER") as "BUILDER" | "SELLER" | "INVESTOR",
      }));
    },
    staleTime: 5 * 60_000,
  });

  const hasRealTestimonials = testimonials && testimonials.length > 0;

  return (
    <section className="px-4 py-12 sm:py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <Badge variant="outline" className="mb-4 text-emerald-500 border-emerald-500/30">
            Social Proof
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            O Que Acontece de Verdade
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground px-2">
            Depoimentos reais de founders que passaram pelo protocolo.
          </p>
        </div>
        
        {/* Testimonials grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-8">
            {[1, 2].map((i) => (
              <Card key={i} className="glass-card">
                <CardContent className="p-4 sm:p-8">
                  <Skeleton className="h-6 w-16 mb-4" />
                  <Skeleton className="h-24 w-full mb-6" />
                  <Skeleton className="h-10 w-40" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : hasRealTestimonials ? (
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-8">
            {testimonials.map((testimonial) => (
              <Card 
                key={testimonial.id}
                className="glass-card border-primary/30 hover:scale-[1.02] transition-all duration-300"
              >
                <CardContent className="p-4 sm:p-8">
                  {/* Quote icon */}
                  <Quote className="w-8 h-8 sm:w-10 sm:h-10 mb-3 sm:mb-4 text-primary/50" />
                  
                  {/* Quote text */}
                  <blockquote className="text-base sm:text-lg text-foreground leading-relaxed mb-4 sm:mb-6">
                    "{testimonial.quote}"
                  </blockquote>
                  
                  {/* Author */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <SmartAvatar
                      avatarUrl={testimonial.avatar_url}
                      name={testimonial.username}
                      archetype={testimonial.archetype}
                      size="sm"
                    />
                    <div>
                      <p className="font-medium text-sm sm:text-base text-foreground">
                        @{testimonial.username}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Participante BuildUP
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Fallback to hardcoded testimonials
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-8">
            {fallbackTestimonials.map((testimonial) => (
              <Card 
                key={testimonial.id}
                className={`glass-card hover:scale-[1.02] transition-all duration-300 ${
                  testimonial.result === "DO" 
                    ? "border-emerald-500/30" 
                    : "border-destructive/30"
                }`}
              >
                <CardContent className="relative p-4 sm:p-8 pt-6 sm:pt-8">
                  {/* Result badge */}
                  <Badge 
                    className={`absolute -top-3 right-4 sm:right-6 ${
                      testimonial.result === "DO"
                        ? "bg-emerald-500 hover:bg-emerald-600"
                        : "bg-destructive hover:bg-destructive/90"
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      {testimonial.result === "DO" ? (
                        <Rocket className="w-3 h-3" />
                      ) : (
                        <Skull className="w-3 h-3" />
                      )}
                      {testimonial.result}
                    </span>
                  </Badge>
                  
                  {/* Quote icon */}
                  <Quote className={`w-8 h-8 sm:w-10 sm:h-10 mb-3 sm:mb-4 ${
                    testimonial.result === "DO" ? "text-emerald-500/50" : "text-destructive/50"
                  }`} />
                  
                  {/* Quote text */}
                  <blockquote className="text-base sm:text-lg text-foreground leading-relaxed mb-4 sm:mb-6">
                    "{testimonial.quote}"
                  </blockquote>
                  
                  {/* Author */}
                  <p className="text-muted-foreground text-xs sm:text-sm font-medium">
                    — {testimonial.author}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default DoOrDieTestimonials;
