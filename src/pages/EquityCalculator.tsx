import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { PlusCircle, Lock, ArrowRight, RotateCcw, X, Calculator, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import { useToolTracking } from "@/hooks/useToolTracking";
import { supabase } from "@/integrations/supabase/client";
import { LandingDarkNavbar } from "@/components/landing/LandingDarkNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import heroIllustration from "@/assets/equity-hero-illustration.png";

/* ─── Types ─── */
interface Founder {
  name: string;
  role: string;
  timePercentage: number;
  capital: number;
  hasIdea: boolean;
  hasNetwork: boolean;
}

/* ─── Constants ─── */
const FOUNDER_COLORS = ["#7610DC", "#F97316", "#22C55E", "#06B6D4"];

const FONT_INTER_MEDIUM: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontWeight: 500,
  letterSpacing: "-0.4px",
};

const FONT_MONTSERRAT: React.CSSProperties = {
  fontFamily: "'Montserrat', 'Inter', sans-serif",
};

/* ─── Animation helpers ─── */
const fadeUp = (y = 30, delay = 0) => ({
  initial: { opacity: 0, y },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

const fadeUpImmediate = (y = 30, delay = 0) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

/* ─── Main Component ─── */
const EquityCalculator = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as "pt" | "en" | "es";
  const { trackCalculation } = useToolTracking("equity-calculator");
  const calcRef = useRef<HTMLDivElement>(null);

  const [isUnlocked, setIsUnlocked] = useState(() => {
    return localStorage.getItem("equity_unlocked") === "true";
  });
  const [email, setEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleEmailUnlock = async () => {
    if (!isValidEmail(email)) {
      toast.error(lang === "pt" ? "Digite um email válido" : lang === "es" ? "Ingrese un email válido" : "Enter a valid email");
      return;
    }
    setEmailLoading(true);
    try {
      const params = new URLSearchParams(window.location.search);
      await supabase.from("tool_leads").insert({
        email,
        tool_id: "equity-calculator",
        utm_source: params.get("utm_source"),
        utm_medium: params.get("utm_medium"),
        utm_campaign: params.get("utm_campaign"),
        utm_term: params.get("utm_term"),
        utm_content: params.get("utm_content"),
      });
      trackEvent("email_gate_unlocked", "tools", "equity-calculator");
      localStorage.setItem("equity_unlocked", "true");
      setIsUnlocked(true);
      setShowEmailModal(false);
      toast.success(lang === "pt" ? "🎉 Resultado desbloqueado!" : lang === "es" ? "🎉 ¡Resultado desbloqueado!" : "🎉 Result unlocked!");
    } catch {
      toast.error(lang === "pt" ? "Erro ao salvar. Tente novamente." : "Error. Try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  const [founders, setFounders] = useState<Founder[]>([
    {
      name: lang === "pt" ? "Você (Founder A)" : lang === "es" ? "Tú (Founder A)" : "You (Founder A)",
      role: "Builder / Técnico",
      timePercentage: 100,
      capital: 10000,
      hasIdea: true,
      hasNetwork: false,
    },
    {
      name: lang === "pt" ? "Sócio (Founder B)" : lang === "es" ? "Socio (Founder B)" : "Partner (Founder B)",
      role: "Seller / Negócios",
      timePercentage: 50,
      capital: 5000,
      hasIdea: false,
      hasNetwork: true,
    },
  ]);

  /* ─── Calculation Logic (unchanged) ─── */
  const calculateEquity = () => {
    const weights = { time: 40, capital: 30, idea: 5, network: 5 };
    const totalTime = founders.reduce((sum, f) => sum + f.timePercentage, 0) || 1;
    const totalCapital = founders.reduce((sum, f) => sum + f.capital, 0) || 1;

    const scores = founders.map((f) => {
      let score = 0;
      score += (f.timePercentage / totalTime) * weights.time;
      score += (f.capital / totalCapital) * weights.capital;
      if (f.hasIdea) score += weights.idea;
      if (f.hasNetwork) score += weights.network;
      return score;
    });

    const totalScore = scores.reduce((sum, s) => sum + s, 0);
    return founders.map((f, i) => ({
      name: f.name.split(" ")[0],
      percentage: Math.round((scores[i] / totalScore) * 100),
      color: FOUNDER_COLORS[i],
    }));
  };

  const results = calculateEquity();

  const updateFounder = (index: number, field: keyof Founder, value: any) => {
    const newFounders = [...founders];
    newFounders[index] = { ...newFounders[index], [field]: value };
    setFounders(newFounders);
    trackCalculation({ foundersCount: newFounders.length, field, value });
  };

  const addFounder = () => {
    if (founders.length >= 4) return;
    const letters = ["A", "B", "C", "D"];
    const index = founders.length;
    setFounders([
      ...founders,
      {
        name: `Founder ${letters[index]}`,
        role: "Role",
        timePercentage: 50,
        capital: 0,
        hasIdea: false,
        hasNetwork: false,
      },
    ]);
  };

  const getTimeLabel = (percentage: number) => {
    if (percentage >= 80) return "Full-time";
    if (percentage >= 50) return "Part-time (20h)";
    if (percentage >= 25) return "Part-time (10h)";
    return lang === "pt" ? "Consultivo" : lang === "es" ? "Consultivo" : "Advisory";
  };

  const scrollToCalc = () => {
    calcRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const generateConicGradient = () => {
    let gradient = "";
    let currentPercentage = 0;
    results.forEach((r, i) => {
      const start = currentPercentage;
      const end = currentPercentage + r.percentage;
      gradient += `${r.color} ${start}% ${end}%${i < results.length - 1 ? ", " : ""}`;
      currentPercentage = end;
    });
    return `conic-gradient(${gradient})`;
  };

  const resetSimulation = () => {
    // Keep unlocked — user already provided email, no need to ask again
    setFounders([
      {
        name: lang === "pt" ? "Você (Founder A)" : lang === "es" ? "Tú (Founder A)" : "You (Founder A)",
        role: "Builder / Técnico",
        timePercentage: 100,
        capital: 10000,
        hasIdea: true,
        hasNetwork: false,
      },
      {
        name: lang === "pt" ? "Sócio (Founder B)" : lang === "es" ? "Socio (Founder B)" : "Partner (Founder B)",
        role: "Seller / Negócios",
        timePercentage: 50,
        capital: 5000,
        hasIdea: false,
        hasNetwork: true,
      },
    ]);
  };

  const handleCalculateClick = () => {
    if (isUnlocked) return; // already unlocked
    setShowEmailModal(true);
  };

  // Close modal on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowEmailModal(false);
    };
    if (showEmailModal) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [showEmailModal]);

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Calculadora de Equity para Sócios - Guilda",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
    description: "Calculadora gratuita para dividir participação societária entre co-founders de startup de forma justa",
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Helmet>
        <title>{t("equityCalculator.meta.title")}</title>
        <meta name="description" content={t("equityCalculator.meta.description")} />
        <link rel="canonical" href="https://www.guilda.app.br/calculadora-de-equity" />
        <script type="application/ld+json">{JSON.stringify(schemaMarkup)}</script>
      </Helmet>

      <LandingDarkNavbar />

      {/* ════════ HERO ════════ */}
      <section className="relative overflow-hidden" style={{ background: "#FFFBF7" }}>
        <div
          className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(118,16,220,0.04) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(118,16,220,0.03) 0%, transparent 70%)" }}
        />

        <div className="max-w-7xl mx-auto px-5 md:px-12 pt-[100px] md:pt-[120px] pb-16 md:pb-[80px]">
          <div className="flex flex-col md:flex-row items-center md:items-center gap-10 md:gap-8">
            {/* Left — Text (55%) */}
            <div className="w-full md:w-[55%] flex flex-col">
              <motion.span
                {...fadeUpImmediate(15, 0)}
                className="inline-block self-start px-5 py-2 rounded-[20px] text-[12px] font-semibold uppercase tracking-[2px]"
                style={{
                  color: "#7610DC",
                  background: "rgba(118, 16, 220, 0.08)",
                  ...FONT_MONTSERRAT,
                }}
              >
                {lang === "pt" ? "Ferramenta Gratuita" : lang === "es" ? "Herramienta Gratuita" : "Free Tool"}
              </motion.span>

              <motion.h1
                {...fadeUpImmediate(30, 0.1)}
                className="mt-6 text-[32px] md:text-[48px] leading-[1.08]"
                style={{ ...FONT_INTER_MEDIUM, color: "#0A0B24" }}
              >
                {lang === "pt" ? (
                  <>Divida Equity de Forma <span style={{ color: "#7610DC" }}>Justa.</span></>
                ) : lang === "es" ? (
                  <>Divida Equity de Forma <span style={{ color: "#7610DC" }}>Justa.</span></>
                ) : (
                  <>Divide Equity <span style={{ color: "#7610DC" }}>Fairly.</span></>
                )}
              </motion.h1>

              <motion.p
                {...fadeUpImmediate(20, 0.25)}
                className="mt-4 text-[16px] md:text-[18px] leading-[1.6] max-w-[500px]"
                style={{ ...FONT_MONTSERRAT, color: "#4A4A68" }}
              >
                {lang === "pt"
                  ? "Simule a divisão de participação societária entre cofundadores. Gratuito, sem cadastro."
                  : lang === "es"
                  ? "Simula la división de participación societaria entre cofundadores. Gratis, sin registro."
                  : "Simulate equity split between co-founders. Free, no signup required."}
              </motion.p>

              <motion.div {...fadeUpImmediate(15, 0.4)} className="mt-6">
                <button
                  onClick={scrollToCalc}
                  className="bg-[#7610DC] hover:bg-[#5A0BB0] text-white font-semibold text-[15px] px-7 py-[14px] rounded-xl transition-colors duration-200"
                  style={FONT_MONTSERRAT}
                >
                  {lang === "pt" ? "Simular Agora ↓" : lang === "es" ? "Simular Ahora ↓" : "Simulate Now ↓"}
                </button>
              </motion.div>
            </div>

            {/* Right — Illustration (45%) */}
            <motion.div
              className="w-[70%] md:w-[40%] flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <img
                src={heroIllustration}
                alt="Ilustração de founder calculando equity com gráficos e planilhas"
                className="w-full h-auto max-w-[400px] md:max-w-[440px]"
                loading="eager"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════ CALCULATOR SECTION ════════ */}
      <section ref={calcRef} className="py-6 md:py-[28px] bg-white">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <motion.span
              {...fadeUp(15, 0)}
              className="inline-block px-5 py-2 rounded-[20px] text-[12px] font-semibold uppercase tracking-[2px]"
              style={{
                color: "#7610DC",
                background: "rgba(118, 16, 220, 0.08)",
                ...FONT_MONTSERRAT,
              }}
            >
              {lang === "pt" ? "Simulador" : lang === "es" ? "Simulador" : "Simulator"}
            </motion.span>

            <motion.h2
              {...fadeUp(25, 0.1)}
              className="mt-5 text-[28px] md:text-[36px] leading-[1.15]"
              style={{ ...FONT_INTER_MEDIUM, color: "#0A0B24" }}
            >
              {lang === "pt" ? (
                <>Configure os <span style={{ color: "#7610DC" }}>Cofundadores</span></>
              ) : lang === "es" ? (
                <>Configure los <span style={{ color: "#7610DC" }}>Cofundadores</span></>
              ) : (
                <>Configure the <span style={{ color: "#7610DC" }}>Co-founders</span></>
              )}
            </motion.h2>

            <motion.p
              {...fadeUp(20, 0.2)}
              className="mt-3 text-[15px] md:text-[16px]"
              style={{ ...FONT_MONTSERRAT, color: "#4A4A68" }}
            >
              {lang === "pt"
                ? "Ajuste dedicação, investimento e contribuições de cada sócio."
                : lang === "es"
                ? "Ajuste dedicación, inversión y contribuciones de cada socio."
                : "Adjust dedication, investment and contributions of each partner."}
            </motion.p>
          </div>

          {/* ── Single Card with Two Columns ── */}
          <motion.div
            {...fadeUp(25, 0.1)}
            className="rounded-[20px] overflow-hidden"
            style={{
              background: "#FFFFFF",
              border: "1px solid #F0F0F0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <div className="flex flex-col lg:flex-row">
              {/* ── LEFT COLUMN — Configuration (60%) ── */}
              <div className="flex-[3] p-7 md:p-12">
                {founders.map((founder, index) => (
                  <div key={index}>
                    {index > 0 && (
                      <div className="my-8" style={{ borderTop: "1px solid #F0F0F0" }} />
                    )}
                    <FounderConfigSection
                      founder={founder}
                      index={index}
                      lang={lang}
                      getTimeLabel={getTimeLabel}
                      updateFounder={updateFounder}
                      onRemove={founders.length > 2 ? () => setFounders(founders.filter((_, i) => i !== index)) : null}
                    />
                  </div>
                ))}

                {/* Add Founder Button */}
                {founders.length < 4 && (
                  <button
                    onClick={addFounder}
                    className="w-full flex items-center justify-center gap-2 py-[14px] rounded-[10px] border border-dashed transition-colors duration-200 text-[14px] font-medium mt-6"
                    style={{
                      ...FONT_MONTSERRAT,
                      borderColor: "#E0E0E8",
                      color: "#4A4A68",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#7610DC";
                      e.currentTarget.style.color = "#7610DC";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#E0E0E8";
                      e.currentTarget.style.color = "#4A4A68";
                    }}
                  >
                    <PlusCircle className="w-4 h-4" />
                    {lang === "pt"
                      ? `Adicionar Founder ${String.fromCharCode(65 + founders.length)}`
                      : lang === "es"
                      ? `Agregar Founder ${String.fromCharCode(65 + founders.length)}`
                      : `Add Founder ${String.fromCharCode(65 + founders.length)}`}
                  </button>
                )}
              </div>

              {/* ── Vertical Divider (desktop only) ── */}
              <div className="hidden lg:block w-px self-stretch" style={{ background: "#F0F0F0" }} />

              {/* ── Horizontal Divider (mobile only) ── */}
              <div className="lg:hidden mx-7" style={{ borderTop: "1px solid #F0F0F0" }} />

              {/* ── RIGHT COLUMN — Preview / Result (40%) ── */}
              <div className="flex-[2] p-7 md:p-12 lg:sticky lg:top-24 self-start">
                <PreviewResultCard
                  isUnlocked={isUnlocked}
                  results={results}
                  generateConicGradient={generateConicGradient}
                  resetSimulation={resetSimulation}
                  lang={lang}
                />

                {/* Calculate Button */}
                {!isUnlocked && (
                  <button
                    onClick={handleCalculateClick}
                    className="w-full mt-7 flex items-center justify-center gap-2 text-white font-semibold text-[15px] py-[14px] rounded-xl transition-colors duration-200"
                    style={{
                      ...FONT_MONTSERRAT,
                      fontWeight: 600,
                      background: "#7610DC",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#5A0BB0")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#7610DC")}
                  >
                    <Calculator className="w-5 h-5" />
                    {lang === "pt" ? "Calcular Equity →" : lang === "es" ? "Calcular Equity →" : "Calculate Equity →"}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════ EMAIL MODAL ════════ */}
      <AnimatePresence>
        {showEmailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-5"
            style={{ background: "rgba(10, 11, 36, 0.7)", backdropFilter: "blur(4px)" }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowEmailModal(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-[440px] rounded-[20px] p-10 sm:p-10"
              style={{ background: "#FFFFFF" }}
            >
              {/* Close button */}
              <button
                onClick={() => setShowEmailModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-150"
                style={{ color: "#9999AA" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#0A0B24")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#9999AA")}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-5">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(118, 16, 220, 0.1)" }}
                >
                  <Mail className="w-6 h-6" style={{ color: "#7610DC" }} />
                </div>
              </div>

              {/* Headline */}
              <h3
                className="text-[22px] text-center mb-2"
                style={{ ...FONT_INTER_MEDIUM, color: "#0A0B24" }}
              >
                {lang === "pt"
                  ? "Quase lá! Informe seu email para ver o resultado."
                  : lang === "es"
                  ? "¡Casi listo! Ingresa tu email para ver el resultado."
                  : "Almost there! Enter your email to see the result."}
              </h3>

              {/* Subtitle */}
              <p
                className="text-[14px] text-center mb-6"
                style={{ ...FONT_MONTSERRAT, color: "#4A4A68" }}
              >
                {lang === "pt"
                  ? "Enviamos dicas sobre equity e cofundação. Sem spam."
                  : lang === "es"
                  ? "Enviamos consejos sobre equity y cofundación. Sin spam."
                  : "We send tips about equity and co-founding. No spam."}
              </p>

              {/* Email input */}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEmailUnlock()}
                placeholder="seu@email.com"
                autoFocus
                className="w-full rounded-xl px-4 py-[14px] text-[16px] outline-none transition-all duration-200 mb-4"
                style={{
                  ...FONT_MONTSERRAT,
                  background: "#F5F5FA",
                  border: "1px solid #E0E0E8",
                  color: "#0A0B24",
                  fontSize: "16px",
                }}
                onFocus={(e) => (e.currentTarget.style.border = "2px solid #7610DC")}
                onBlur={(e) => (e.currentTarget.style.border = "1px solid #E0E0E8")}
              />

              {/* Submit button */}
              <button
                onClick={handleEmailUnlock}
                disabled={!email.trim() || emailLoading}
                className="w-full bg-[#7610DC] hover:bg-[#5A0BB0] text-white font-semibold text-[15px] py-[14px] rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ ...FONT_MONTSERRAT, fontWeight: 600 }}
              >
                {emailLoading
                  ? lang === "pt" ? "Desbloqueando..." : "Unlocking..."
                  : lang === "pt" ? "Ver Resultado →" : lang === "es" ? "Ver Resultado →" : "See Result →"}
              </button>

              {/* Micro-copy */}
              <p className="mt-3 text-[12px] text-center" style={{ ...FONT_MONTSERRAT, color: "#9999AA" }}>
                🔒 {lang === "pt" ? "Seus dados estão seguros." : lang === "es" ? "Tus datos están seguros." : "Your data is safe."}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════ CTA FINAL ════════ */}
      <section className="py-16 md:py-[80px]" style={{ background: "#7610DC" }}>
        <div className="max-w-[600px] mx-auto px-5 text-center">
          <motion.h2
            {...fadeUp(25, 0)}
            className="text-[28px] md:text-[36px] leading-[1.15]"
            style={{ ...FONT_INTER_MEDIUM, color: "#FFFFFF" }}
          >
            {lang === "pt" ? (
              <>Já sabe como dividir?{" "}<span style={{ color: "#F97316" }}>Agora encontre seu sócio.</span></>
            ) : lang === "es" ? (
              <>¿Ya sabes cómo dividir?{" "}<span style={{ color: "#F97316" }}>Ahora encuentra tu socio.</span></>
            ) : (
              <>Know how to split?{" "}<span style={{ color: "#F97316" }}>Now find your co-founder.</span></>
            )}
          </motion.h2>

          <motion.p
            {...fadeUp(20, 0.15)}
            className="mt-5 text-[15px] md:text-[16px] leading-[1.6]"
            style={{ ...FONT_MONTSERRAT, color: "rgba(255,255,255,0.8)" }}
          >
            {lang === "pt"
              ? "A Guilda conecta Builders e Sellers para formar startups de alta performance."
              : lang === "es"
              ? "La Guilda conecta Builders y Sellers para formar startups de alto rendimiento."
              : "Guilda connects Builders and Sellers to form high-performance startups."}
          </motion.p>

          <motion.div {...fadeUp(15, 0.3)}>
            <a
              href="https://www.guilda.app.br"
              className="inline-flex items-center gap-2 mt-8 bg-[#F97316] hover:bg-[#E5670F] text-white font-semibold text-[16px] px-8 py-4 rounded-xl transition-colors duration-200"
              style={FONT_MONTSERRAT}
            >
              {lang === "pt" ? "Encontrar meu Sócio" : lang === "es" ? "Encontrar mi Socio" : "Find my Co-founder"}
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

/* ─── Founder Config Section (inside single card) ─── */
interface FounderConfigSectionProps {
  founder: Founder;
  index: number;
  lang: "pt" | "en" | "es";
  getTimeLabel: (p: number) => string;
  updateFounder: (i: number, f: keyof Founder, v: any) => void;
  onRemove: (() => void) | null;
}

const FounderConfigSection = ({ founder, index, lang, getTimeLabel, updateFounder, onRemove }: FounderConfigSectionProps) => {
  const founderLabels = [
    { pt: "Builder / Técnico", es: "Builder / Técnico", en: "Builder / Technical" },
    { pt: "Seller / Negócios", es: "Seller / Negocios", en: "Seller / Business" },
  ];

  return (
    <div className="relative">
      {/* Remove button */}
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-0 right-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-150 hover:bg-red-50"
          style={{ color: "#C0C0C8" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#C0C0C8")}
          title={lang === "pt" ? "Remover founder" : "Remove founder"}
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Header: avatar + name */}
      <div className="flex items-center gap-3 mb-1">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-[13px] flex-shrink-0"
          style={{ background: FOUNDER_COLORS[index] }}
        >
          {String.fromCharCode(65 + index)}
        </div>
        <input
          value={founder.name}
          onChange={(e) => updateFounder(index, "name", e.target.value)}
          className="font-medium text-[18px] bg-transparent border-none outline-none w-full"
          style={{ ...FONT_INTER_MEDIUM, color: "#0A0B24" }}
        />
      </div>

      {/* Select: Builder / Seller */}
      <div className="mb-5 mt-2">
        <select
          value={founder.role}
          onChange={(e) => updateFounder(index, "role", e.target.value)}
          className="rounded-[10px] px-[14px] py-[10px] text-[14px] outline-none cursor-pointer w-[220px] max-w-full"
          style={{
            ...FONT_MONTSERRAT,
            background: "#F5F5FA",
            border: "1px solid #E0E0E8",
            color: "#0A0B24",
          }}
        >
          <option value="Builder / Técnico">{founderLabels[0][lang]}</option>
          <option value="Seller / Negócios">{founderLabels[1][lang]}</option>
        </select>
      </div>

      {/* Slider — Tempo Dedicado */}
      <div className="mb-5">
        <div className="flex justify-between text-[14px] mb-3">
          <span style={{ ...FONT_MONTSERRAT, fontWeight: 500, color: "#0A0B24" }}>
            {lang === "pt" ? "Tempo Dedicado" : lang === "es" ? "Tiempo Dedicado" : "Time Dedicated"}
          </span>
          <span style={{ ...FONT_MONTSERRAT, fontWeight: 600, color: "#7610DC" }}>
            {getTimeLabel(founder.timePercentage)}
          </span>
        </div>
        <Slider
          value={[founder.timePercentage]}
          onValueChange={(v) => updateFounder(index, "timePercentage", v[0])}
          min={0}
          max={100}
          step={10}
          className="w-full"
        />
      </div>

      {/* Slider — Investimento */}
      <div className="mb-5">
        <div className="flex justify-between text-[14px] mb-3">
          <span style={{ ...FONT_MONTSERRAT, fontWeight: 500, color: "#0A0B24" }}>
            {lang === "pt" ? "Investimento em Dinheiro (R$)" : lang === "es" ? "Inversión en Dinero (R$)" : "Cash Investment (R$)"}
          </span>
          <span style={{ ...FONT_MONTSERRAT, fontWeight: 600, color: "#F97316" }}>
            R$ {founder.capital.toLocaleString("pt-BR")}
          </span>
        </div>
        <Slider
          value={[founder.capital]}
          onValueChange={(v) => updateFounder(index, "capital", v[0])}
          min={0}
          max={100000}
          step={1000}
          className="w-full"
        />
      </div>

      {/* Checkboxes — side by side on desktop, stacked on mobile */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
        <div className="flex items-center gap-2">
          <Checkbox
            id={`idea-${index}`}
            checked={founder.hasIdea}
            onCheckedChange={(checked) => updateFounder(index, "hasIdea", checked)}
          />
          <label htmlFor={`idea-${index}`} className="text-[13px]" style={{ ...FONT_MONTSERRAT, color: "#0A0B24" }}>
            {lang === "pt" ? "Dono da Ideia Original" : lang === "es" ? "Dueño de la Idea Original" : "Original Idea Owner"}{" "}
            <span style={{ color: "#4A4A68" }}>(+5%)</span>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id={`network-${index}`}
            checked={founder.hasNetwork}
            onCheckedChange={(checked) => updateFounder(index, "hasNetwork", checked)}
          />
          <label htmlFor={`network-${index}`} className="text-[13px]" style={{ ...FONT_MONTSERRAT, color: "#0A0B24" }}>
            {lang === "pt" ? "Traz Network de Investidores" : lang === "es" ? "Trae Network de Inversores" : "Brings Investor Network"}{" "}
            <span style={{ color: "#4A4A68" }}>(+5%)</span>
          </label>
        </div>
      </div>
    </div>
  );
};
/* ─── Preview / Result Card Sub-component ─── */
interface PreviewResultCardProps {
  isUnlocked: boolean;
  results: { name: string; percentage: number; color: string }[];
  generateConicGradient: () => string;
  resetSimulation: () => void;
  lang: "pt" | "en" | "es";
}

const PreviewResultCard = ({
  isUnlocked,
  results,
  generateConicGradient,
  resetSimulation,
  lang,
}: PreviewResultCardProps) => {
  return (
    <div>

      <AnimatePresence mode="wait">
        {!isUnlocked ? (
          /* ─── Preview (blurred) ─── */
          <motion.div
            key="preview"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3
              className="text-[20px] text-center mb-6"
              style={{ ...FONT_INTER_MEDIUM, color: "#0A0B24" }}
            >
              {lang === "pt" ? "Prévia da Divisão" : lang === "es" ? "Vista Previa" : "Split Preview"}
            </h3>

            {/* Donut Chart */}
            <div className="relative w-36 h-36 mx-auto mb-6">
              <div className="w-full h-full rounded-full" style={{ background: generateConicGradient() }} />
              <div
                className="absolute inset-4 rounded-full flex flex-col items-center justify-center"
                style={{ background: "#FFFFFF" }}
              >
                <span className="text-[10px] uppercase tracking-[2px]" style={{ color: "#9999AA" }}>
                  Total
                </span>
                <span className="text-[22px]" style={{ ...FONT_INTER_MEDIUM, color: "#0A0B24" }}>
                  100%
                </span>
              </div>
            </div>

            {/* Legend — blurred */}
            <div style={{ filter: "blur(6px)", userSelect: "none", pointerEvents: "none" }}>
              <div className="space-y-3">
                {results.map((r, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 rounded-lg"
                    style={{ background: "#F5F5FA", border: "1px solid #F0F0F0" }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
                      <span className="text-[14px]" style={{ ...FONT_MONTSERRAT, color: "#0A0B24" }}>{r.name}</span>
                    </div>
                    <span className="text-[14px] font-bold font-mono" style={{ color: "#0A0B24" }}>{r.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructional text below blurred content */}
            <p
              className="text-[13px] text-center mt-5"
              style={{ ...FONT_MONTSERRAT, color: "#9999AA" }}
            >
              {lang === "pt"
                ? "Configure e calcule para ver o resultado completo"
                : lang === "es"
                ? "Configure y calcule para ver el resultado completo"
                : "Configure and calculate to see the full result"}
            </p>
          </motion.div>
        ) : (
          /* ─── Unlocked Result ─── */
          <motion.div
            key="unlocked"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h3
              className="text-[20px] text-center mb-6"
              style={{ ...FONT_INTER_MEDIUM, color: "#0A0B24" }}
            >
              {lang === "pt" ? "Resultado da Divisão" : lang === "es" ? "Resultado de la División" : "Split Result"}
            </h3>

            {/* Donut Chart */}
            <div className="relative w-40 h-40 mx-auto mb-8">
              <div className="w-full h-full rounded-full" style={{ background: generateConicGradient() }} />
              <div
                className="absolute inset-4 rounded-full flex flex-col items-center justify-center"
                style={{ background: "#FFFFFF" }}
              >
                <span className="text-[10px] uppercase tracking-[2px]" style={{ color: "#9999AA" }}>
                  Total
                </span>
                <span className="text-[24px]" style={{ ...FONT_INTER_MEDIUM, color: "#0A0B24" }}>
                  100%
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3 mb-8">
              {results.map((r, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 rounded-lg"
                  style={{ background: "#F5F5FA", border: "1px solid #F0F0F0" }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
                    <span className="text-[14px]" style={{ ...FONT_MONTSERRAT, color: "#0A0B24" }}>{r.name}</span>
                  </div>
                  <span className="text-[28px] font-bold" style={{ ...FONT_INTER_MEDIUM, color: r.color }}>{r.percentage}%</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <p className="text-[13px] text-center" style={{ ...FONT_MONTSERRAT, color: "#9999AA" }}>
                {lang === "pt"
                  ? "Ajuste nas barras de cada co-founder para ver mudar o equity acima"
                  : lang === "es"
                  ? "Ajusta las barras de cada co-founder para ver cambiar el equity arriba"
                  : "Adjust each co-founder's sliders to see the equity change above"}
              </p>

              <a
                href="https://suprema.guilda.app.br/auth?view=signup"
                className="w-full flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#E5670F] text-white font-semibold text-[15px] py-[14px] rounded-xl transition-colors duration-200"
                style={FONT_MONTSERRAT}
              >
                {lang === "pt" ? "Encontrar meu Co-fundador" : lang === "es" ? "Encontrar mi Cofundador" : "Find my Co-founder"}
              </a>
            </div>

            {/* Disclaimer */}
            <p className="mt-5 text-[11px] leading-[1.5] text-center" style={{ ...FONT_MONTSERRAT, color: "#9999AA" }}>
              {lang === "pt"
                ? "⚠️ Simulação educacional. Para acordos formais, consulte um advogado."
                : lang === "es"
                ? "⚠️ Simulación educativa. Para acuerdos formales, consulte un abogado."
                : "⚠️ Educational simulation. For formal agreements, consult a lawyer."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EquityCalculator;
