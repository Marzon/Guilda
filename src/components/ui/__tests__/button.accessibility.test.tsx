import { describe, it, expect } from 'vitest';
import { Button } from '../button';
import { renderWithTheme, THEMES, axe } from '@/test/accessibility-utils';

describe('Button - Acessibilidade WCAG', () => {
  const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;
  
  describe.each(THEMES)('Tema: %s', (theme) => {
    it.each(variants)('variante "%s" deve passar WCAG AA', async (variant) => {
      const { container } = renderWithTheme(
        <Button variant={variant}>Texto do Botão</Button>,
        theme
      );
      
      const results = await axe(container);
      const contrastViolations = results.violations.filter(v => v.id === 'color-contrast');
      
      expect(contrastViolations, `${theme} - ${variant}: ${contrastViolations.length} violações`).toHaveLength(0);
    });

    it('botão desabilitado mantém estrutura acessível', async () => {
      const { container } = renderWithTheme(
        <Button disabled>Desabilitado</Button>,
        theme
      );
      
      const results = await axe(container);
      const contrastViolations = results.violations.filter(v => v.id === 'color-contrast');
      expect(contrastViolations).toHaveLength(0);
    });
  });

  it('todos os tamanhos mantêm contraste adequado', async () => {
    const sizes = ['default', 'sm', 'lg', 'icon'] as const;
    
    for (const size of sizes) {
      const { container } = renderWithTheme(
        <Button size={size}>Botão</Button>
      );
      
      const results = await axe(container);
      expect(results.violations.filter(v => v.id === 'color-contrast')).toHaveLength(0);
    }
  });
});
