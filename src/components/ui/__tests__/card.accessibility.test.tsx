import { describe, it, expect } from 'vitest';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../card';
import { renderWithTheme, THEMES, axe } from '@/test/accessibility-utils';

describe('Card - Acessibilidade WCAG', () => {
  describe.each(THEMES)('Tema: %s', (theme) => {
    it('card completo passa WCAG AA', async () => {
      const { container } = renderWithTheme(
        <Card>
          <CardHeader>
            <CardTitle>Título do Card</CardTitle>
            <CardDescription>Descrição secundária do card</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Conteúdo do card com texto padrão</p>
            <p className="text-muted-foreground">Texto com cor muted</p>
          </CardContent>
        </Card>,
        theme
      );
      
      const results = await axe(container);
      const contrastViolations = results.violations.filter(v => v.id === 'color-contrast');
      
      expect(contrastViolations, `${theme}: ${contrastViolations.length} violações`).toHaveLength(0);
    });

    it('card com variações de texto mantém contraste', async () => {
      const { container } = renderWithTheme(
        <Card>
          <CardContent>
            <h3 className="font-bold text-lg">Título Grande</h3>
            <p className="text-sm text-muted-foreground">Texto pequeno muted</p>
            <span className="text-xs">Texto extra pequeno</span>
          </CardContent>
        </Card>,
        theme
      );
      
      const results = await axe(container);
      expect(results.violations.filter(v => v.id === 'color-contrast')).toHaveLength(0);
    });
  });
});
