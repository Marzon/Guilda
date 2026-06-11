import { checkWCAGCompliance, WCAGResult } from './wcag-contrast-calculator';
import * as fs from 'fs';

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

interface TestResult {
  combination: string;
  result: WCAGResult;
}

export function generateContrastReport() {
  const allResults: Record<string, TestResult[]> = {};

  // Testar todas as combinações para cada tema
  Object.entries(themeColors).forEach(([themeName, colors]) => {
    const tests: TestResult[] = [
      {
        combination: 'foreground / background',
        result: checkWCAGCompliance(colors.foreground, colors.background),
      },
      {
        combination: 'primary-foreground / primary',
        result: checkWCAGCompliance(colors.primaryForeground, colors.primary),
      },
      {
        combination: 'muted-foreground / muted',
        result: checkWCAGCompliance(colors.mutedForeground, colors.muted),
      },
      {
        combination: 'card-foreground / card',
        result: checkWCAGCompliance(colors.cardForeground, colors.card),
      },
    ];

    allResults[themeName] = tests;
  });

  // Gerar HTML
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Contraste WCAG - Guilda</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', sans-serif;
      background: #0B0E14;
      color: #F5F5F5;
      padding: 2rem;
    }
    h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      color: #8B5CF6;
    }
    .subtitle {
      color: #A0A0A0;
      margin-bottom: 2rem;
    }
    .theme-section {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(139, 92, 246, 0.2);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .theme-section h2 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      text-transform: capitalize;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    th {
      background: rgba(255, 255, 255, 0.05);
      font-weight: 600;
    }
    .pass {
      color: #22c55e;
      font-weight: 600;
    }
    .fail {
      color: #ef4444;
      font-weight: 600;
    }
    .ratio {
      font-family: 'Courier New', monospace;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <h1>🎨 Relatório de Contraste WCAG</h1>
  <p class="subtitle">Análise de conformidade WCAG AA/AAA para todos os temas da Guilda</p>
  
  ${Object.entries(allResults).map(([theme, tests]) => `
    <section class="theme-section">
      <h2>${theme}</h2>
      <table>
        <thead>
          <tr>
            <th>Combinação de Cores</th>
            <th>Ratio</th>
            <th>WCAG AA</th>
            <th>WCAG AAA</th>
          </tr>
        </thead>
        <tbody>
          ${tests.map(test => `
            <tr>
              <td>${test.combination}</td>
              <td class="ratio">${test.result.ratio}:1</td>
              <td class="${test.result.AA.normalText ? 'pass' : 'fail'}">
                ${test.result.AA.normalText ? '✓ Passa' : '✗ Falha'}
              </td>
              <td class="${test.result.AAA.normalText ? 'pass' : 'fail'}">
                ${test.result.AAA.normalText ? '✓ Passa' : '✗ Falha'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </section>
  `).join('')}
  
  <footer style="margin-top: 2rem; text-align: center; color: #666;">
    <p>Gerado em ${new Date().toLocaleString('pt-BR')}</p>
  </footer>
</body>
</html>
  `;

  fs.writeFileSync('contrast-report.html', html);
  console.log('✅ Relatório gerado: contrast-report.html');
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  generateContrastReport();
}
