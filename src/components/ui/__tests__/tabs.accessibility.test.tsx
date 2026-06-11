import { describe, it, expect } from 'vitest';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../tabs';
import { renderWithTheme, THEMES, axe } from '@/test/accessibility-utils';

describe('Tabs - Acessibilidade WCAG', () => {
  describe.each(THEMES)('Tema: %s', (theme) => {
    it('tabs completas passam WCAG AA', async () => {
      const { container } = renderWithTheme(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Conteúdo da Tab 1</TabsContent>
          <TabsContent value="tab2">Conteúdo da Tab 2</TabsContent>
          <TabsContent value="tab3">Conteúdo da Tab 3</TabsContent>
        </Tabs>,
        theme
      );
      
      const results = await axe(container);
      const contrastViolations = results.violations.filter(v => v.id === 'color-contrast');
      
      expect(contrastViolations, `${theme}: ${contrastViolations.length} violações`).toHaveLength(0);
    });

    it('tab ativa e inativa têm contraste adequado', async () => {
      const { container } = renderWithTheme(
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Ativa</TabsTrigger>
            <TabsTrigger value="inactive">Inativa</TabsTrigger>
          </TabsList>
        </Tabs>,
        theme
      );
      
      const results = await axe(container);
      expect(results.violations.filter(v => v.id === 'color-contrast')).toHaveLength(0);
    });
  });
});
