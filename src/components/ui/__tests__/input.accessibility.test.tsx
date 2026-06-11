import { describe, it, expect } from 'vitest';
import { Input } from '../input';
import { Label } from '../label';
import { renderWithTheme, THEMES, axe } from '@/test/accessibility-utils';

describe('Input - Acessibilidade WCAG', () => {
  describe.each(THEMES)('Tema: %s', (theme) => {
    it('input com label passa WCAG AA', async () => {
      const { container } = renderWithTheme(
        <div>
          <Label htmlFor="test-input">Nome</Label>
          <Input id="test-input" placeholder="Digite seu nome" />
        </div>,
        theme
      );
      
      const results = await axe(container);
      const contrastViolations = results.violations.filter(v => v.id === 'color-contrast');
      
      expect(contrastViolations, `${theme}: ${contrastViolations.length} violações`).toHaveLength(0);
    });

    it('input desabilitado mantém acessibilidade', async () => {
      const { container } = renderWithTheme(
        <Input disabled placeholder="Desabilitado" />,
        theme
      );
      
      const results = await axe(container);
      const contrastViolations = results.violations.filter(v => v.id === 'color-contrast');
      expect(contrastViolations).toHaveLength(0);
    });

    it('placeholder mantém contraste adequado', async () => {
      const { container } = renderWithTheme(
        <Input placeholder="Texto do placeholder" />,
        theme
      );
      
      const results = await axe(container);
      expect(results.violations.filter(v => v.id === 'color-contrast')).toHaveLength(0);
    });
  });
});
