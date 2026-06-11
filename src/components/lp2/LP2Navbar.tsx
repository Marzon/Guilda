import { useState, useEffect, useCallback } from "react";
import { Menu, X } from "lucide-react";
import guildaLogo from "@/assets/logos/guilda-logo-full.webp";
import { CORE_APP_URL } from "@/lib/constants";
import { buildCoreAppUrl } from "@/lib/url-utils";

const NAV_ITEMS = [
  { label: "Como Funciona", href: "#como-funciona" },
  { label: "Aceleração", href: "#aceleracao" },
  { label: "Blog", href: "https://www.guilda.app.br/blog", isExternal: true },
];

const LP2Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const handleNav = useCallback((href: string, isExternal?: boolean) => {
    setDrawerOpen(false);
    if (isExternal) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handleCTA = useCallback(() => {
    setDrawerOpen(false);
    window.location.href = "https://suprema.guilda.app.br/pro";
  }, []);

  const handleLogin = useCallback(() => {
    setDrawerOpen(false);
    window.location.href = "https://suprema.guilda.app.br/pro";
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
          boxShadow: scrolled
            ? "0 2px 16px rgba(118,16,220,0.08)"
            : "none",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          transition: "all 200ms ease",
        }}
      >
        {/* Logo */}
        <a href="/lp2" className="flex items-center z-10 flex-shrink-0">
          <img src={guildaLogo} alt="Guilda" style={{ height: 36, width: "auto", objectFit: "contain" }} />
        </a>

        {/* Nav — absolutely centered (desktop) */}
        <nav
          className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2"
          style={{ gap: 40 }}
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNav(item.href, item.isExternal)}
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
              {item.label}
            </button>
          ))}
        </nav>

        {/* Login + CTA (desktop) */}
        <div className="hidden md:flex z-10 flex-shrink-0 items-center gap-4">
          <a
            href="https://suprema.guilda.app.br/auth"
            className="cursor-pointer"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: 15,
              fontWeight: 500,
              color: "#0A0B24",
              textDecoration: "none",
              transition: "color 150ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#7610DC")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#0A0B24")}
          >
            Login
          </a>
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
            Encontrar meu Sócio
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
          {/* Drawer header */}
          <div
            className="flex items-center justify-between"
            style={{ height: 68, padding: "0 20px" }}
          >
            <a href="/lp2" className="flex items-center">
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

          {/* Nav items */}
          <nav className="flex flex-col gap-6 px-8 pt-10 flex-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNav(item.href, item.isExternal)}
                className="bg-transparent border-none cursor-pointer text-left"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: 20,
                  fontWeight: 500,
                  color: "#3D3D5C",
                  padding: 0,
                }}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={handleLogin}
              className="bg-transparent border-none cursor-pointer text-left"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: 20,
                fontWeight: 500,
                color: "#3D3D5C",
                padding: 0,
              }}
            >
              Login
            </button>
          </nav>

          {/* CTA at bottom */}
          <div className="px-8 pb-10">
            <button
              onClick={handleCTA}
              className="w-full"
              style={{
                background: "#7610DC",
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
              Encontrar meu Sócio
            </button>
          </div>
        </div>
      )}

      {/* Spacer for fixed header */}
      <div style={{ height: 104 }} />
    </>
  );
};

export default LP2Navbar;
