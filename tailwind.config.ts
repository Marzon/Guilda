import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        builder: "hsl(var(--builder-color))",
        seller: "hsl(var(--seller-color))",
        guilda: {
          purple: "#7610DC",
          deep: "#4308B0",
          light: "#A728EB",
          accent: "#F97316",
          surface: "#0A0B24",
          cream: "#FFFBF7",
          gold: "#F59E0B",
        },
        // LP2 design tokens
        lp2: {
          primary: "hsl(var(--lp2-primary))",
          "primary-dark": "hsl(var(--lp2-primary-dark))",
          "primary-light": "hsl(var(--lp2-primary-light))",
          accent: "hsl(var(--lp2-accent))",
          bg: "hsl(var(--lp2-bg))",
          "surface-light": "hsl(var(--lp2-surface-light))",
          "surface-dark": "hsl(var(--lp2-surface-dark))",
          text: "hsl(var(--lp2-text))",
          "text-secondary": "hsl(var(--lp2-text-secondary))",
          "text-muted": "hsl(var(--lp2-text-muted))",
          border: "hsl(var(--lp2-border))",
        },
        neon: {
          blue: "#3b82f6",
          purple: "#a855f7",
          cyan: "#22d3ee",
          amber: "#fbbf24",
          emerald: "#10b981",
        },
      },
      boxShadow: {
        "glow-primary": "0 8px 20px hsl(258 90% 66% / 0.4)",
        "glow-emerald": "0 0 10px hsl(160 84% 39% / 0.5)",
        "glow-amber": "0 0 10px hsl(43 96% 56% / 0.5)",
        "card-hover": "0 8px 30px 0 hsl(0 0% 0% / 0.08)",
        "lp2-subtle": "var(--lp2-shadow-subtle)",
        "lp2-medium": "var(--lp2-shadow-medium)",
        "lp2-strong": "var(--lp2-shadow-strong)",
      },
      fontFamily: {
        sans: ["Poppins", "system-ui", "sans-serif"],
        display: ["Montserrat", "system-ui", "sans-serif"],
        editorial: ["PP Editorial New", "Georgia", "Times New Roman", "serif"],
        telegraf: ["Montserrat", "system-ui", "sans-serif"],
        serif: ["Merriweather", "Georgia", "serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        "lp2-sm": "var(--lp2-radius-sm)",
        "lp2-card": "var(--lp2-radius-card)",
        "lp2-section": "var(--lp2-radius-section)",
        "lp2-pill": "var(--lp2-radius-pill)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
        'navbar': 'var(--navbar-height)',
        'navbar-padding': 'var(--navbar-padding)',
        'navbar-padding-sm': 'var(--navbar-padding-sm)',
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "gradient": {
          "0%, 100%": {
            "background-position": "0% 50%",
          },
          "50%": {
            "background-position": "100% 50%",
          },
        },
        "shimmer": {
          "0%": {
            transform: "translateX(-100%)",
          },
          "100%": {
            transform: "translateX(100%)",
          },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 20px rgba(139, 92, 246, 0.5)" },
          "50%": { opacity: "0.9", boxShadow: "0 0 40px rgba(139, 92, 246, 0.8)" },
        },
        "splash-breathe": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.05)", opacity: "0.9" },
        },
        "splash-fill-bar": {
          "0%": { width: "0%" },
          "40%": { width: "30%" },
          "70%": { width: "70%" },
          "100%": { width: "100%" },
        },
        "splash-fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "ticket-entry": {
          "0%": { opacity: "0", transform: "translateY(50px) rotate(-10deg)" },
          "100%": { opacity: "1", transform: "translateY(0) rotate(-3deg)" },
        },
        "glow-gold": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(251, 191, 36, 0.5)" },
          "50%": { boxShadow: "0 0 16px rgba(251, 191, 36, 0.8)" },
        },
        "float-mobile": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-4px)" },
          "75%": { transform: "translateX(4px)" },
        },
        "float-subtle": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "pulse-arrow": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "gradient": "gradient 3s ease infinite",
        "shimmer": "shimmer 2s infinite",
        "float": "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 3s infinite",
        "pulse-slow": "pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "splash-breathe": "splash-breathe 3s ease-in-out infinite",
        "splash-fill-bar": "splash-fill-bar 2.5s ease-out forwards",
        "splash-fade-up": "splash-fade-up 0.8s ease-out forwards",
        "ticket-entry": "ticket-entry 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "glow-gold": "glow-gold 2s ease-in-out infinite",
        "float-mobile": "float-mobile 3s ease-in-out infinite alternate",
        "float-mobile-delayed-1": "float-mobile 3s ease-in-out 0.5s infinite alternate",
        "float-mobile-delayed-2": "float-mobile 3s ease-in-out 1s infinite alternate",
        marquee: "marquee 25s linear infinite",
        shake: "shake 0.5s ease-in-out",
        "float-subtle": "float-subtle 3s ease-in-out infinite",
        "float-subtle-delayed": "float-subtle 3s ease-in-out 1.5s infinite",
        "pulse-arrow": "pulse-arrow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
