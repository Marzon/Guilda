import { useEffect, useState, createContext, useContext, ReactNode } from "react";

export type Theme = "cyber" | "ocean" | "forest" | "crimson" | "frost";
export type Mode = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("guild-theme");
    return (stored as Theme) || "cyber";
  });

  const [mode, setMode] = useState<Mode>(() => {
    const stored = localStorage.getItem("guild-mode");
    return (stored as Mode) || "light";
  });

  // Apply theme on mount and whenever it changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-mode", mode);
    localStorage.setItem("guild-theme", theme);
    localStorage.setItem("guild-mode", mode);
  }, [theme, mode]);

  const toggleMode = () => setMode(m => m === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, setTheme, mode, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
