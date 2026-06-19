import guildaLogoLight from "@/assets/logos/guilda-logo-invertido.webp";
import { PWA_INSTALL_URL } from "@/lib/constants";

const COLUMNS = [
  {
    header: "Produto",
    links: [
      { label: "Início", href: "/" },
      { label: "Vagas", href: "/vagas" },
      { label: "Startups", href: "/startups" },
      { label: "Manifesto", href: "/manifesto" },
    ],
  },
  {
    header: "Recursos",
    links: [
      { label: "Ferramentas", href: "/tools" },
      { label: "Blog", href: "/blog" },
      { label: "Histórias", href: "/success-stories" },
      { label: "Baixar App", href: "https://play.google.com/store/apps/details?id=com.theguilda.app", external: true },
    ],
  },
  {
    header: "Arquétipos",
    links: [
      { label: "Builders", href: "/builders" },
      { label: "Sellers", href: "/sellers" },
      { label: "Starters", href: "/starters" },
      { label: "Investidores", href: "/investors" },
    ],
  },
  {
    header: "Comunidade",
    links: [
      { label: "LinkedIn", href: "https://www.linkedin.com/company/guilda-app-br", external: true },
      { label: "Instagram", href: "https://www.instagram.com/guilda.app.br", external: true },
      { label: "Privacidade", href: "/privacy" },
      { label: "Termos", href: "/terms" },
    ],
  },
];

const headerStyle: React.CSSProperties = {
  fontFamily: "Montserrat, sans-serif",
  fontSize: 11,
  fontWeight: 700,
  color: "rgba(255,255,255,0.3)",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  marginBottom: 16,
};

const linkStyle: React.CSSProperties = {
  fontFamily: "Montserrat, sans-serif",
  fontSize: 14,
  color: "rgba(255,255,255,0.6)",
  textDecoration: "none",
  transition: "color 150ms ease",
  display: "block",
  marginBottom: 10,
};

const LP2Footer = () => {
  return (
    <footer
      style={{
        background: "#0A0B24",
        padding: "64px 48px 32px",
      }}
    >
      {/* Main grid */}
      <div
        className="grid grid-cols-2 md:grid-cols-5"
        style={{ gap: 40 }}
      >
        {/* Col 1 — Logo + tagline */}
        <div className="col-span-2 md:col-span-1">
          <img
            src={guildaLogoLight}
            alt="Guilda"
            loading="lazy"
            width={120}
            height={32}
            style={{ height: 32, width: "auto", display: "block" }}
          />
          <p
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: 13,
              color: "rgba(255,255,255,0.45)",
              maxWidth: 180,
              marginTop: 12,
              lineHeight: 1.5,
            }}
          >
            Onde empreendedores se encontram para construir o futuro.
          </p>
        </div>

        {/* Cols 2-5 — Link columns */}
        {COLUMNS.map((col) => (
          <div key={col.header}>
            <p style={headerStyle}>{col.header}</p>
            {col.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                {...((link as any).external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                style={linkStyle}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,1)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
              >
                {link.label}
              </a>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        className="flex flex-col md:flex-row justify-between items-center"
        style={{
          marginTop: 48,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: 24,
          gap: 8,
        }}
      >
        <span
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 12,
            color: "rgba(255,255,255,0.3)",
          }}
        >
          © 2026 Guilda Inc. Feito por Builders.
        </span>
        <span
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 12,
            color: "rgba(255,255,255,0.3)",
          }}
        >
          <a href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>Privacidade</a>
          {" · "}
          <a href="/terms" style={{ color: "inherit", textDecoration: "none" }}>Termos</a>
        </span>
      </div>
    </footer>
  );
};

export default LP2Footer;
