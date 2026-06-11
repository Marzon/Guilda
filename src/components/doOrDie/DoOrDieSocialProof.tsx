import { useState, useRef, useEffect, useCallback } from "react";
import { Quote, Heart, Clock, Crown, Target, Rocket, Skull } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SmartAvatar } from "@/components/GuildaAvatar";
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Static testimonials for marketing site
const staticTestimonials = [
  {
    id: "1",
    quote: "Eu achava que precisava de 3 meses para lançar. Lancei em 4 dias e vendi no quinto. O protocolo mudou minha forma de pensar produto.",
    username: "lucas_builder",
    avatar_url: null,
    archetype: "BUILDER" as const,
  },
  {
    id: "2",
    quote: "Encontrei meu co-fundador técnico no programa. Em 15 dias fizemos mais do que em 6 meses sozinho tentando aprender a programar.",
    username: "marina_seller",
    avatar_url: null,
    archetype: "SELLER" as const,
  },
  {
    id: "3",
    quote: "O match foi perfeito: eu com a visão de vendas, ele com a expertise técnica. Em 3 meses, já tínhamos nosso primeiro cliente pagante.",
    username: "pedro_ceo",
    avatar_url: null,
    archetype: "SELLER" as const,
  },
];

// Fallback testimonials with DO/DIE results
const fallbackTestimonials = [
  {
    id: "1",
    quote: "Eu achava que precisava de 3 meses para lançar. Lancei em 4 dias e vendi no quinto. O protocolo mudou minha forma de pensar produto.",
    author: "Founder Ciclo 1",
    result: "DO" as const,
  },
  {
    id: "2",
    quote: "Matei minha ideia no dia 10. Foi a melhor coisa que me aconteceu. Economizei R$ 50k que iria gastar em desenvolvimento inútil.",
    author: "Founder Ciclo 1",
    result: "DIE" as const,
  },
  {
    id: "3",
    quote: "Encontrei meu co-fundador técnico no programa. Em 15 dias fizemos mais do que em 6 meses sozinho tentando aprender a programar.",
    author: "Founder Ciclo 2",
    result: "DO" as const,
  },
];

const stats = [
  { icon: Heart, value: "94%", label: "Taxa de Match", titleShort: "de Match", descShort: "Co-founders compatíveis" },
  { icon: Clock, value: "3 meses", label: "Economia de tempo", titleShort: "de Economia", descShort: "vs networking tradicional" },
  { icon: Crown, value: "6 meses", label: "Acesso Founder incluso", titleShort: "de Acesso", descShort: "Plano Founder gratuito" },
];

const DoOrDieSocialProof = () => {
  const hasRealTestimonials = staticTestimonials.length > 0;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const cardWidth = el.scrollWidth / staticTestimonials.length;
    setActiveIndex(Math.round(scrollLeft / cardWidth));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-emerald-500/5 to-background" />
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <Target className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-semibold text-emerald-500 uppercase tracking-wider">
              Resultados Reais
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Founders que <span className="text-emerald-500">Passaram</span> pelo Protocolo
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Histórias reais de quem enfrentou o BuildUP.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-3 gap-2.5 sm:gap-4 md:gap-8 mb-16 items-stretch"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center px-2.5 py-3.5 sm:p-4 md:p-6 rounded-2xl bg-card/50 border border-border flex flex-col items-center justify-center">
              <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl sm:text-2xl md:text-4xl font-bold text-foreground sm:text-foreground text-[#0A0B24]">{stat.value}</p>
              {/* Desktop label */}
              <p className="hidden sm:block text-xs md:text-sm text-muted-foreground">{stat.label}</p>
              {/* Mobile: title + description */}
              <p className="sm:hidden text-xs font-bold text-[#0A0B24] mt-0.5">{stat.titleShort}</p>
              <p className="sm:hidden text-[10px] text-[#6B7280] mt-1">{stat.descShort}</p>
            </div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {hasRealTestimonials ? (
            <>
              {/* Mobile: native scroll-snap carousel */}
              <div className="sm:hidden">
                <div
                  ref={scrollRef}
                  className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {staticTestimonials.map((testimonial) => (
                    <div
                      key={testimonial.id}
                      className="snap-center flex-shrink-0"
                      style={{ minWidth: "85vw", maxWidth: "85vw" }}
                    >
                      <Card className="glass-card border-primary/30 h-full">
                        <CardContent className="p-5">
                          <Quote className="w-6 h-6 mb-3 text-primary/50" />
                          <blockquote className="text-sm leading-relaxed text-foreground mb-4">
                            "{testimonial.quote}"
                          </blockquote>
                          <div className="flex items-center gap-3">
                            <SmartAvatar
                              avatarUrl={testimonial.avatar_url}
                              name={testimonial.username}
                              archetype={testimonial.archetype}
                              size="sm"
                            />
                            <div>
                              <p className="text-[13px] font-medium text-foreground">
                                @{testimonial.username}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                Participante Aceleração
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
                {/* Dot indicators */}
                <div className="flex justify-center gap-2 mt-4">
                  {staticTestimonials.map((_, i) => (
                    <button
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i === activeIndex ? "bg-primary" : "bg-muted-foreground/30"
                      }`}
                      onClick={() => {
                        const el = scrollRef.current;
                        if (!el) return;
                        const cardWidth = el.scrollWidth / staticTestimonials.length;
                        el.scrollTo({ left: cardWidth * i, behavior: "smooth" });
                      }}
                      aria-label={`Depoimento ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Desktop: Embla carousel */}
              <div className="hidden sm:block">
                <Carousel opts={{ align: "start", loop: true }} className="w-full">
                  <CarouselContent className="-ml-4">
                    {staticTestimonials.map((testimonial) => (
                      <CarouselItem key={testimonial.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                        <Card className="glass-card border-primary/30 h-full">
                          <CardContent className="p-6">
                            <Quote className="w-8 h-8 mb-4 text-primary/50" />
                            <blockquote className="text-foreground leading-relaxed mb-6">
                              "{testimonial.quote}"
                            </blockquote>
                            <div className="flex items-center gap-3">
                              <SmartAvatar
                                avatarUrl={testimonial.avatar_url}
                                name={testimonial.username}
                                archetype={testimonial.archetype}
                                size="sm"
                              />
                              <div>
                                <p className="font-medium text-foreground">
                                  @{testimonial.username}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Participante Aceleração
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="hidden md:flex -left-4" />
                  <CarouselNext className="hidden md:flex -right-4" />
                </Carousel>
              </div>
            </>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {fallbackTestimonials.map((testimonial) => (
                <Card
                  key={testimonial.id}
                  className={`glass-card hover:scale-[1.02] transition-all duration-300 ${
                    testimonial.result === "DO"
                      ? "border-emerald-500/30"
                      : "border-destructive/30"
                  }`}
                >
                  <CardContent className="relative p-6 pt-8">
                    <Badge
                      className={`absolute -top-3 right-4 ${
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
                    <Quote className={`w-8 h-8 mb-4 ${
                      testimonial.result === "DO" ? "text-emerald-500/50" : "text-destructive/50"
                    }`} />
                    <blockquote className="text-foreground leading-relaxed mb-6">
                      "{testimonial.quote}"
                    </blockquote>
                    <p className="text-muted-foreground text-sm font-medium">
                      — {testimonial.author}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default DoOrDieSocialProof;
