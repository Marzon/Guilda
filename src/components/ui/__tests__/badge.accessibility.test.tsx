import { describe, it, expect } from 'vitest';
import { Badge } from '../badge';
import { renderWithTheme, THEMES, axe } from '@/test/accessibility-utils';

describe('Badge - Acessibilidade WCAG', () => {
  const variants = ['default', 'secondary', 'destructive', 'outline'] as const;
  
  describe.each(THEMES)('Tema: %s', (theme) => {
    it.each(variants)('variante "%s" passa WCAG AA', async (variant) => {
      const { container } = renderWithTheme(
        <Badge variant={variant}>Badge Text</Badge>,
        theme
      );
      
      const results = await axe(container);
      const contrastViolations = results.violations.filter(v => v.id === 'color-contrast');
      
      expect(contrastViolations, `${theme} - ${variant}: ${contrastViolations.length} violações`).toHaveLength(0);
    });

    it('múltiplos badges mantêm contraste', async () => {
      const { container } = renderWithTheme(
        <div className="flex gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>,
        theme
      );
      
      const results = await axe(container);
      expect(results.violations.filter(v => v.id === 'color-contrast')).toHaveLength(0);
    });
  });
});
