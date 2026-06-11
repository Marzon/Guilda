import { describe, it, expect } from 'vitest';
import { checkWCAGCompliance } from './wcag-contrast-calculator';

// Definições de cores por tema (extraídas do index.css)
const themeColors = {
  cyber: {
    background: '223 71% 6%',
    foreground: '0 0% 98%',
    primary: '258 90% 66%',
    primaryForeground: '0 0% 100%',
    muted: '223 71% 15%',
    mutedForeground: '0 0% 75%',
    card: '223 71% 9%',
    cardForeground: '0 0% 98%',
  },
  ocean: {
    background: '223 71% 6%',
    foreground: '0 0% 98%',
    primary: '188 94% 43%',
    primaryForeground: '0 0% 100%',
    muted: '223 71% 15%',
    mutedForeground: '0 0% 75%',
    card: '223 71% 9%',
    cardForeground: '0 0% 98%',
  },
  forest: {
    background: '223 71% 6%',
    foreground: '0 0% 98%',
    primary: '142 76% 45%',
    primaryForeground: '0 0% 100%',
    muted: '223 71% 15%',
    mutedForeground: '0 0% 75%',
    card: '223 71% 9%',
    cardForeground: '0 0% 98%',
  },
  crimson: {
    background: '223 71% 6%',
    foreground: '0 0% 98%',
    primary: '0 84% 60%',
    primaryForeground: '0 0% 100%',
    muted: '223 71% 15%',
    mutedForeground: '0 0% 75%',
    card: '223 71% 9%',
    cardForeground: '0 0% 98%',
  },
  frost: {
    background: '223 71% 6%',
    foreground: '0 0% 98%',
    primary: '217 91% 60%',
    primaryForeground: '0 0% 100%',
    muted: '223 71% 15%',
    mutedForeground: '0 0% 75%',
    card: '223 71% 9%',
    cardForeground: '0 0% 98%',
  },
};

describe('Verificação de Contraste WCAG por Tema', () => {
  Object.entries(themeColors).forEach(([themeName, colors]) => {
    describe(`Tema: ${themeName}`, () => {
      it('foreground/background passa AA para texto normal (4.5:1)', () => {
        const result = checkWCAGCompliance(colors.foreground, colors.background);
        expect(result.AA.normalText, `${themeName}: foreground/background ratio ${result.ratio}:1`).toBe(true);
        expect(result.ratio).toBeGreaterThanOrEqual(4.5);
      });

      it('primary-foreground/primary passa AA (4.5:1)', () => {
        const result = checkWCAGCompliance(colors.primaryForeground, colors.primary);
        expect(result.AA.normalText, `${themeName}: primary ratio ${result.ratio}:1`).toBe(true);
      });

      it('muted-foreground/muted passa AA (4.5:1)', () => {
        const result = checkWCAGCompliance(colors.mutedForeground, colors.muted);
        expect(result.AA.normalText, `${themeName}: muted ratio ${result.ratio}:1`).toBe(true);
      });

      it('card-foreground/card passa AA (4.5:1)', () => {
        const result = checkWCAGCompliance(colors.cardForeground, colors.card);
        expect(result.AA.normalText, `${themeName}: card ratio ${result.ratio}:1`).toBe(true);
      });

      it('foreground/background passa AAA para texto grande (7:1)', () => {
        const result = checkWCAGCompliance(colors.foreground, colors.background);
        expect(result.AAA.normalText, `${themeName}: AAA ratio ${result.ratio}:1`).toBe(true);
      });
    });
  });
});
