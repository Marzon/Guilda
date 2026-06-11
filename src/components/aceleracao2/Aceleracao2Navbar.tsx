import { useState, useEffect, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import guildaLogo from "@/assets/logos/guilda-logo-full.webp";

const NAV_LINKS = [
  { href: "#como-funciona", label: "Como Funciona" },
  { href: "#o-que-recebe", label: "O Que Recebe" },
  { href: "#para-quem", label: "Para Quem É" },
];

export const Aceleracao2Navbar = memo(function Aceleracao2Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const handleNavClick = useCallback((href: string) => {
    setDrawerOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleLogoClick = useCallback(() => {
    setDrawerOpen(false);
    navigate("/");
  }, [navigate]);

  const handleCTA = useCallback(() => {
    setDrawerOpen(false);
    window.location.href = "https://suprema.guilda.app.br/aceleracao";
  }, []);

  const handleGuilda = useCallback(() => {
    setDrawerOpen(false);
    window.open("https://www.guilda.app.br", "_blank");
  }, []);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between"
        style={{
          height: 80,
          minHeight: 80,
          padding: "0 64px",
          background: scrolled ? "rgba(255,251,247,0.88)" : "#FFFFFF",
          borderBottom: "1px solid rgba(118,16,220,0.12)",
          boxShadow: scrolled ? "0 2px 16px rgba(118,16,220,0.08)" : "none",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          transition: "all 200ms ease",
        }}
      >
        {/* Logo */}
        <a onClick={handleLogoClick} className="flex items-center z-10 flex-shrink-0 cursor-pointer">
          <img src={guildaLogo} alt="Guilda" style={{ height: 36, width: "auto", objectFit: "contain" }} />
        </a>

        {/* Nav — absolutely centered (desktop) */}
        <nav
          className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2"
          style={{ gap: 40 }}
        >
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="bg-transparent border-none cursor-pointer"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: 15,
                fontWeight: 500,
                color: "#0A0B24",
                transition: "color 150ms ease",
                padding: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#7610DC")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#0A0B24")}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center z-10 flex-shrink-0" style={{ gap: 12 }}>
          <button
            onClick={handleGuilda}
            className="flex items-center justify-center"
            style={{
              background: "transparent",
              color: "#7610DC",
              fontFamily: "Montserrat, sans-serif",
              fontSize: 15,
              fontWeight: 600,
              borderRadius: 100,
              padding: "10px 22px",
              height: 42,
              border: "2px solid #7610DC",
              cursor: "pointer",
              transition: "all 200ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#7610DC";
              e.currentTarget.style.color = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#7610DC";
            }}
          >
            Conheça a Guilda
          </button>
          <button
            onClick={handleCTA}
            className="flex items-center justify-center"
            style={{
              background: "#F97316",
              color: "#FFFFFF",
              fontFamily: "Montserrat, sans-serif",
              fontSize: 15,
              fontWeight: 600,
              borderRadius: 100,
              padding: "10px 22px",
              height: 42,
              border: "none",
              cursor: "pointer",
              transition: "background 200ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#e0650f")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#F97316")}
          >
            Entrar para a Aceleração
          </button>
        </div>

        {/* Hamburger (mobile) */}
        <button
          className="md:hidden z-10 bg-transparent border-none cursor-pointer p-1"
          onClick={() => setDrawerOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu size={28} style={{ color: "#7610DC" }} />
        </button>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[100] flex flex-col"
          style={{ background: "#FFFBF7" }}
        >
          <div
            className="flex items-center justify-between"
            style={{ height: 68, padding: "0 20px" }}
          >
            <a onClick={handleLogoClick} className="flex items-center cursor-pointer">
              <img src={guildaLogo} alt="Guilda" className="h-8 w-auto" />
            </a>
            <button
              onClick={() => setDrawerOpen(false)}
              className="bg-transparent border-none cursor-pointer p-1"
              aria-label="Fechar menu"
            >
              <X size={28} style={{ color: "#7610DC" }} />
            </button>
          </div>

          <nav className="flex flex-col gap-6 px-8 pt-10 flex-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="bg-transparent border-none cursor-pointer text-left"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: 20,
                  fontWeight: 500,
                  color: "#3D3D5C",
                  padding: 0,
                }}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={handleGuilda}
              className="bg-transparent border-none cursor-pointer text-left"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: 20,
                fontWeight: 500,
                color: "#3D3D5C",
                padding: 0,
              }}
            >
              Conheça a Guilda
            </button>
          </nav>

          <div className="px-8 pb-10">
            <button
              onClick={handleCTA}
              className="w-full"
              style={{
                background: "#F97316",
                color: "#FFFFFF",
                fontFamily: "Montserrat, sans-serif",
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 100,
                padding: "14px 28px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Entrar para a Aceleração
            </button>
          </div>
        </div>
      )}

      {/* Spacer for fixed header */}
      <div style={{ height: 80 }} />
    </>
  );
});
