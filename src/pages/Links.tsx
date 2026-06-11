import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import guildaDarkLogo from "@/assets/logos/guilda-dark-mode.png";
import blogIcon from "@/assets/icons/blog-icon.png";
import { supabase } from "@/integrations/supabase/client";

const trackClick = (buttonId: string) => {
  supabase.from("link_clicks").insert({ button_id: buttonId }).then(() => {});
};

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0, 0, 0.2, 1] as [number, number, number, number] },
});

const primaryLinks = [
  {
    text: "Experimente a nova Guilda",
    sub: "Cadastro gratuito · 2 min",
    href: "https://suprema.guilda.app.br/?utm_source=instagram&utm_medium=social&utm_campaign=bio_link&utm_content=cta_nova_guilda",
    internal: false,
    bg: "#7610DC",
    shadow: "0 4px 20px rgba(118,16,220,0.25)",
    shadowHover: "0 6px 28px rgba(118,16,220,0.4)",
    icon: "⚔️",
    trackId: "cta_nova_guilda",
  },
  {
    text: "Aceleração Guilda — 15 dias",
    sub: "De match a receita. Vagas limitadas.",
    href: "https://www.guilda.app.br/aceleracao?utm_source=instagram&utm_medium=social&utm_campaign=bio_link&utm_content=cta_aceleracao",
    internal: true,
    bg: "#F97316",
    shadow: "0 4px 20px rgba(249,115,22,0.3)",
    shadowHover: "0 6px 28px rgba(249,115,22,0.45)",
    icon: "🚀",
    trackId: "cta_aceleracao",
  },
];

const secondaryLinks = [
  { icon: "📖", text: "Acesse conteúdos exclusivos no Blog", href: "https://www.guilda.app.br/blog?utm_source=instagram&utm_medium=social&utm_campaign=bio_link&utm_content=blog", internal: true, trackId: "blog" },
  { icon: "💼", text: "Acompanhe a Guilda no LinkedIn", href: "https://www.linkedin.com/company/guilda-app-br", internal: false, trackId: "linkedin" },
  { icon: "💬", text: "Fale com a Guilda", href: "https://wa.me/5511936187183?text=Oi%2C%20vim%20do%20Instagram%20e%20gostaria%20de%20conhecer%20mais%20a%20Guilda", internal: false, trackId: "whatsapp" },
];

const Links = () => {
  return (
    <>
      <Helmet>
        <title>Guilda — Links</title>
        <meta name="description" content="Encontre seu co-fundador técnico ou comercial. A plataforma que conecta Builders e Sellers para fundar startups." />
        <meta property="og:title" content="Guilda — Links" />
        <meta property="og:description" content="Encontre seu co-fundador técnico ou comercial. A plataforma que conecta Builders e Sellers para fundar startups." />
        <meta property="og:url" content="https://www.guilda.app.br/links" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://www.guilda.app.br/links" />
      </Helmet>

      <div
        className="min-h-screen flex flex-col items-center overflow-x-hidden"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 0%, rgba(67,8,176,0.05) 0%, transparent 70%), #0A0B24`,
          fontFamily: "'Montserrat', system-ui, sans-serif",
        }}
      >
        <div className="w-full max-w-[480px] px-6 py-12 flex flex-col items-center">
          {/* Header */}
          <motion.div {...fadeUp(0)} className="mb-3">
            <img src={guildaDarkLogo} alt="Guilda" className="h-14" />
          </motion.div>
          <motion.p {...fadeUp(0.1)} className="text-[#FFFBF7] text-sm text-center mb-5" style={{ fontWeight: 400, marginTop: "-4px" }}>
            Crie, valide e escale sua startup.
          </motion.p>

          <motion.span
            {...fadeUp(0.2)}
            className="inline-flex items-center text-[13px] font-medium mb-7"
            style={{
              color: "#FFFBF7",
              background: "rgba(118,16,220,0.15)",
              border: "1px solid rgba(118,16,220,0.3)",
              borderRadius: 999,
              padding: "6px 16px",
            }}
          >
            🚀 Entre para comunidade com +600 founders
          </motion.span>

          {/* Primary CTAs */}
          <div className="w-full flex flex-col gap-3 mb-6">
            {primaryLinks.map((link, i) => (
              <motion.a
                key={link.href}
                {...fadeUp(0.3 + i * 0.1)}
                href={link.href}
                onClick={() => trackClick(link.trackId)}
                {...(link.internal ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                aria-label={link.text}
                className="w-full rounded-[14px] px-6 py-[18px] flex items-center gap-3 no-underline"
                style={{
                  background: link.bg,
                  boxShadow: link.shadow,
                  transition: "all 0.2s ease",
                }}
                whileHover={{ scale: 1.02, boxShadow: link.shadowHover }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-lg flex-shrink-0">{link.icon}</span>
                <div className="flex flex-col min-w-0">
                  <span className="text-[#FFFBF7] text-base font-bold truncate">{link.text}</span>
                  <span className="text-[#FFFBF7]/80 text-xs">{link.sub}</span>
                </div>
              </motion.a>
            ))}
          </div>

          {/* Secondary Links */}
          <motion.div {...fadeUp(0.5)} className="w-full flex flex-col gap-2.5">
            {secondaryLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => trackClick(link.trackId)}
                {...(link.internal ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                aria-label={link.text}
                className="w-full rounded-xl px-5 py-3.5 flex items-center gap-3 no-underline text-[#FFFBF7] text-sm font-medium"
                style={{
                  border: "1px solid rgba(255,251,247,0.15)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,251,247,0.05)";
                  e.currentTarget.style.borderColor = "rgba(255,251,247,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "rgba(255,251,247,0.15)";
                }}
              >
                <span className="text-base flex-shrink-0">
                  {link.text.includes("Blog") ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#FFFBF7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  ) : link.text === "Fale com a Guilda" ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  ) : link.text === "Acompanhe a Guilda no LinkedIn" ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  ) : link.icon}
                </span>
                <span className="truncate">{link.text}</span>
              </a>
            ))}
          </motion.div>

          {/* Footer */}
          <motion.p {...fadeUp(0.6)} className="text-xs text-center mt-10 mb-6" style={{ color: "rgba(255,251,247,0.3)" }}>
            © 2026 Guilda · Onde startups começam.
          </motion.p>
        </div>
      </div>
    </>
  );
};

export default Links;
