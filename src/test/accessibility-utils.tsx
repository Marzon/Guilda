import { render, RenderOptions } from '@testing-library/react';
import { configureAxe } from 'jest-axe';
import { ReactElement } from 'react';

// Temas disponíveis no projeto
export const THEMES = ['cyber', 'ocean', 'forest', 'crimson', 'frost'] as const;
export type Theme = typeof THEMES[number];

// Configurar axe com regras WCAG específicas
export const axe = configureAxe({
  rules: {
    'color-contrast': { enabled: true },
    'color-contrast-enhanced': { enabled: true },
    'link-in-text-block': { enabled: true },
  },
});

// Wrapper que aplica tema
export const ThemeWrapper = ({ 
  children, 
  theme = 'cyber' 
}: { 
  children: React.ReactNode; 
  theme?: Theme;
}) => (
  <div data-theme={theme} className="bg-background text-foreground p-4">
    {children}
  </div>
);

// Renderizar com tema específico
export const renderWithTheme = (
  ui: ReactElement,
  theme: Theme = 'cyber',
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, {
    wrapper: ({ children }) => <ThemeWrapper theme={theme}>{children}</ThemeWrapper>,
    ...options,
  });
};

// Testar acessibilidade em todos os temas
export const testAccessibilityAllThemes = async (
  Component: ReactElement,
  componentName: string
) => {
  const results: { theme: Theme; violations: any[] }[] = [];

  for (const theme of THEMES) {
    const { container } = renderWithTheme(Component, theme);
    const axeResults = await axe(container);
    
    results.push({
      theme,
      violations: axeResults.violations,
    });
  }

  return results;
};
