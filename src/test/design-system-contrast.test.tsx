import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { THEMES, ThemeWrapper, axe } from './accessibility-utils';

// Testar combinações de cores do design system
const colorCombinations = [
  { bg: 'bg-background', fg: 'text-foreground', name: 'Background + Foreground' },
  { bg: 'bg-card', fg: 'text-card-foreground', name: 'Card + Card Foreground' },
  { bg: 'bg-primary', fg: 'text-primary-foreground', name: 'Primary + Primary Foreground' },
  { bg: 'bg-secondary', fg: 'text-secondary-foreground', name: 'Secondary + Secondary Foreground' },
  { bg: 'bg-muted', fg: 'text-muted-foreground', name: 'Muted + Muted Foreground' },
  { bg: 'bg-accent', fg: 'text-accent-foreground', name: 'Accent + Accent Foreground' },
  { bg: 'bg-destructive', fg: 'text-destructive-foreground', name: 'Destructive + Destructive Foreground' },
];

describe('Design System - Contraste de Cores WCAG', () => {
  describe.each(THEMES)('Tema: %s', (theme) => {
    it.each(colorCombinations)(
      '$name deve ter contraste WCAG AA (4.5:1)',
      async ({ bg, fg, name }) => {
        const { container } = render(
          <ThemeWrapper theme={theme}>
            <div className={`${bg} ${fg} p-4`}>
              <span>Texto de teste para verificação de contraste</span>
              <p className="text-sm">Texto pequeno também precisa passar</p>
            </div>
          </ThemeWrapper>
        );
        
        const results = await axe(container);
        
        const contrastViolations = results.violations.filter(
          (v) => v.id === 'color-contrast'
        );
        
        expect(contrastViolations, `${theme} - ${name}: ${contrastViolations.length} violações`).toHaveLength(0);
      }
    );
  });
});
