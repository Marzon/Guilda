import { CORE_APP_URL } from "@/lib/constants";
import { buildCoreAppUrl } from "@/lib/url-utils";

const LP2CTAFinal = () => {
  const handleCTA = () => {
    window.location.href = buildCoreAppUrl(CORE_APP_URL, "/auth?view=signup");
  };

  return (
    <section
      style={{
        background: "#EDE0FF",
        borderRadius: 24,
        padding: "80px 48px",
        textAlign: "center",
      }}
    >
      <h2
        className="font-serif font-thin"
        style={{
          fontSize: "clamp(32px, 5vw, 56px)",
          fontWeight: 100,
          color: "#0A0B24",
          margin: "0 auto 16px",
          lineHeight: 0.95,
        }}
      >
        Encontre seu co-fundador agora.
      </h2>

      <p
        style={{
          fontFamily: "Montserrat, sans-serif",
          fontSize: 17,
          color: "#3D3D5C",
          maxWidth: 520,
          margin: "0 auto 36px",
          lineHeight: 1.6,
        }}
      >
        Crie seu perfil de Builder ou Seller, explore matches por compatibilidade e descubra o sócio ideal para sua startup.
      </p>

      <button
        onClick={handleCTA}
        style={{
          background: "#F97316",
          color: "#FFFFFF",
          fontFamily: "Montserrat, sans-serif",
          fontSize: 16,
          fontWeight: 700,
          borderRadius: 100,
          padding: "16px 40px",
          border: "none",
          cursor: "pointer",
          transition: "background 200ms ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#e0650f")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#F97316")}
      >
        Encontrar meu Sócio →
      </button>

      <p
        style={{
          fontFamily: "Montserrat, sans-serif",
          fontSize: 13,
          color: "#8A8AA8",
          marginTop: 20,
        }}
      >
        Cadastro gratuito em 2 minutos · Comunidade de co-founders verificados
      </p>
    </section>
  );
};

export default LP2CTAFinal;
