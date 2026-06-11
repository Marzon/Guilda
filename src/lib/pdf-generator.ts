import { jsPDF } from 'jspdf';

interface PDFSection {
  title: string;
  type: 'text' | 'table' | 'key-value';
  content: string | string[][] | Record<string, string>;
}

interface PDFOptions {
  title: string;
  subtitle?: string;
  sections: PDFSection[];
  footer?: string;
}

const COLORS = {
  primary: [139, 92, 246] as [number, number, number], // #8B5CF6
  text: [30, 30, 30] as [number, number, number],
  muted: [100, 100, 100] as [number, number, number],
  border: [200, 200, 200] as [number, number, number],
};

export const generateToolPDF = (options: PDFOptions): jsPDF => {
  const doc = new jsPDF();
  let yPosition = 20;

  // Header
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.muted);
  doc.text('GUILDA - guilda.app.br', 20, yPosition);
  doc.text(new Date().toLocaleDateString('pt-BR'), 190, yPosition, { align: 'right' });
  
  yPosition += 15;

  // Title
  doc.setFontSize(24);
  doc.setTextColor(...COLORS.primary);
  doc.text(options.title, 20, yPosition);
  
  yPosition += 10;

  // Subtitle
  if (options.subtitle) {
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.muted);
    doc.text(options.subtitle, 20, yPosition);
    yPosition += 10;
  }

  // Separator line
  doc.setDrawColor(...COLORS.border);
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 15;

  // Sections
  options.sections.forEach((section) => {
    // Check for page break
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }

    // Section title
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.text);
    doc.text(section.title, 20, yPosition);
    yPosition += 8;

    doc.setFontSize(11);

    if (section.type === 'text' && typeof section.content === 'string') {
      const lines = doc.splitTextToSize(section.content, 170);
      doc.setTextColor(...COLORS.muted);
      doc.text(lines, 20, yPosition);
      yPosition += lines.length * 6 + 10;
    }

    if (section.type === 'key-value' && typeof section.content === 'object' && !Array.isArray(section.content)) {
      Object.entries(section.content).forEach(([key, value]) => {
        doc.setTextColor(...COLORS.muted);
        doc.text(`${key}:`, 20, yPosition);
        doc.setTextColor(...COLORS.text);
        doc.text(value, 80, yPosition);
        yPosition += 7;
      });
      yPosition += 5;
    }

    if (section.type === 'table' && Array.isArray(section.content)) {
      const tableData = section.content as string[][];
      const colWidth = 170 / tableData[0].length;
      
      tableData.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          const isHeader = rowIndex === 0;
          const color = isHeader ? COLORS.text : COLORS.muted;
          doc.setTextColor(color[0], color[1], color[2]);
          doc.setFont('helvetica', isHeader ? 'bold' : 'normal');
          doc.text(cell, 20 + colIndex * colWidth, yPosition);
        });
        yPosition += 7;
      });
      yPosition += 5;
    }
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.muted);
    doc.text(
      options.footer || 'Gerado por Guilda - guilda.app.br',
      105,
      285,
      { align: 'center' }
    );
    doc.text(`Página ${i} de ${pageCount}`, 190, 285, { align: 'right' });
  }

  return doc;
};

export const generateRunwayPDF = (data: {
  balance: number;
  burnRate: number;
  revenue: number;
  growthRate: number;
  runwayMonths: number;
  netBurn: number;
  breakevenMonth: number | null;
}): jsPDF => {
  const formatCurrency = (v: number) => `R$ ${v.toLocaleString('pt-BR')}`;

  return generateToolPDF({
    title: 'Calculadora de Runway',
    subtitle: 'Projeção financeira da sua startup',
    sections: [
      {
        title: 'Dados de Entrada',
        type: 'key-value',
        content: {
          'Saldo Atual': formatCurrency(data.balance),
          'Burn Rate Mensal': formatCurrency(data.burnRate),
          'Receita Mensal': formatCurrency(data.revenue),
          'Crescimento de Receita': `${data.growthRate}%`,
        },
      },
      {
        title: 'Resultado',
        type: 'key-value',
        content: {
          'Runway': `${data.runwayMonths} meses`,
          'Burn Líquido': `${formatCurrency(data.netBurn)}/mês`,
          'Breakeven': data.breakevenMonth ? `Mês ${data.breakevenMonth}` : 'Não projetado',
        },
      },
    ],
  });
};

export const generateValuationPDF = (data: {
  method: string;
  valuation: number;
  inputs: Record<string, string>;
}): jsPDF => {
  const formatCurrency = (v: number) => {
    if (v >= 1000000) return `R$ ${(v / 1000000).toFixed(2)}M`;
    if (v >= 1000) return `R$ ${(v / 1000).toFixed(0)}K`;
    return `R$ ${v.toFixed(0)}`;
  };

  return generateToolPDF({
    title: 'Calculadora de Valuation',
    subtitle: `Método: ${data.method}`,
    sections: [
      {
        title: 'Parâmetros',
        type: 'key-value',
        content: data.inputs,
      },
      {
        title: 'Valuation Estimado',
        type: 'key-value',
        content: {
          'Valor': formatCurrency(data.valuation),
        },
      },
    ],
  });
};

export const generateCapTablePDF = (data: {
  shareholders: Array<{ name: string; shares: number; percentage: number }>;
  totalShares: number;
  rounds: Array<{ name: string; investment: number; dilution: number }>;
}): jsPDF => {
  const formatNumber = (v: number) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(2)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
    return v.toFixed(0);
  };

  const shareholderTable: string[][] = [
    ['Sócio', 'Ações', 'Participação'],
    ...data.shareholders.map(s => [s.name, formatNumber(s.shares), `${s.percentage.toFixed(2)}%`]),
  ];

  return generateToolPDF({
    title: 'Simulador Cap Table',
    subtitle: `Total de Ações: ${formatNumber(data.totalShares)}`,
    sections: [
      {
        title: 'Distribuição Atual',
        type: 'table',
        content: shareholderTable,
      },
      ...(data.rounds.length > 0 ? [{
        title: 'Rodadas de Investimento',
        type: 'table' as const,
        content: [
          ['Rodada', 'Investimento', 'Diluição'],
          ...data.rounds.map(r => [r.name, `R$ ${formatNumber(r.investment)}`, `${r.dilution.toFixed(1)}%`]),
        ],
      }] : []),
    ],
  });
};

export const generateEquityPDF = (data: {
  founders: Array<{ name: string; percentage: number }>;
  weights: Record<string, number>;
}): jsPDF => {
  const founderTable: string[][] = [
    ['Sócio', 'Participação'],
    ...data.founders.map(f => [f.name, `${f.percentage}%`]),
  ];

  return generateToolPDF({
    title: 'Calculadora de Equity',
    subtitle: 'Divisão societária sugerida',
    sections: [
      {
        title: 'Pesos Utilizados',
        type: 'key-value',
        content: {
          'Capital': `${data.weights.capital}%`,
          'Tempo': `${data.weights.time}%`,
          'Skills': `${data.weights.skills}%`,
          'Experiência': `${data.weights.experience}%`,
        },
      },
      {
        title: 'Divisão Sugerida',
        type: 'table',
        content: founderTable,
      },
    ],
  });
};

// Reading List PDF Generator - Professional Design
interface ReadingListPDFOptions {
  userName: string;
  userArchetype: 'BUILDER' | 'SELLER';
  currentLevel: string;
  projectStage: 'idea' | 'mvp' | 'traction';
  booksRead: number[];
  totalBooks: number;
  readCount: number;
  progressPercent: number;
  translations: {
    title: string;
    subtitle: string;
    criticalReadings: string;
    nextRecommendations: string;
    progress: string;
    book: string;
    author: string;
    stage: string;
    category: string;
    footer: string;
    stages: Record<string, string>;
    categories: Record<string, string>;
    archetypes: Record<string, string>;
  };
}

interface BookForPDF {
  id: number;
  title: string;
  author: string;
  category: 'universal' | 'builder' | 'seller';
  critical_for_stage: 'idea' | 'mvp' | 'traction';
}

interface CriticalRuleForPDF {
  bookId: number;
  stage: 'idea' | 'mvp' | 'traction';
  role?: 'BUILDER' | 'SELLER';
}

// Professional color palette
const PDF_COLORS = {
  primary: [118, 16, 220] as [number, number, number],      // #7610DC (purple - NEW)
  primaryLight: [167, 40, 235] as [number, number, number], // #A728EB (light purple - NEW)
  secondary: [249, 115, 22] as [number, number, number],    // #F97316 (orange accent - NEW)
  critical: [220, 38, 38] as [number, number, number],      // #DC2626 (red)
  criticalLight: [254, 226, 226] as [number, number, number], // #FEE2E2 (light red bg)
  success: [34, 197, 94] as [number, number, number],       // #22C55E (green)
  warning: [234, 179, 8] as [number, number, number],       // #EAB308 (yellow)
  bgLight: [249, 250, 251] as [number, number, number],     // #F9FAFB (light gray)
  bgCard: [243, 244, 246] as [number, number, number],      // #F3F4F6 (card bg)
  text: [17, 24, 39] as [number, number, number],           // #111827 (dark)
  textMuted: [107, 114, 128] as [number, number, number],   // #6B7280 (gray)
  white: [255, 255, 255] as [number, number, number],
  // Category colors
  builder: [59, 130, 246] as [number, number, number],      // #3B82F6 (blue)
  seller: [249, 115, 22] as [number, number, number],       // #F97316 (orange)
  universal: [168, 85, 247] as [number, number, number],    // #A855F7 (purple)
  // Stage colors
  idea: [34, 197, 94] as [number, number, number],          // #22C55E (green)
  mvp: [234, 179, 8] as [number, number, number],           // #EAB308 (yellow)
  traction: [59, 130, 246] as [number, number, number],     // #3B82F6 (blue)
};

// Helper function to draw rounded rectangle
const drawRoundedRect = (
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fillColor?: [number, number, number],
  strokeColor?: [number, number, number]
) => {
  if (fillColor) {
    doc.setFillColor(...fillColor);
  }
  if (strokeColor) {
    doc.setDrawColor(...strokeColor);
  }
  
  // Simple rounded corners using lines and arcs
  doc.roundedRect(x, y, w, h, r, r, fillColor ? 'F' : 'S');
};

// Helper to draw a badge
const drawBadge = (
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  bgColor: [number, number, number],
  textColor: [number, number, number] = PDF_COLORS.white
): number => {
  doc.setFontSize(7);
  const textWidth = doc.getTextWidth(text);
  const badgeWidth = textWidth + 6;
  const badgeHeight = 5;
  
  // Draw badge background
  doc.setFillColor(...bgColor);
  doc.roundedRect(x, y - 3.5, badgeWidth, badgeHeight, 1.5, 1.5, 'F');
  
  // Draw text
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  doc.text(text, x + 3, y);
  
  return badgeWidth + 2; // Return width for positioning next badge
};

// Helper to draw progress bar
const drawProgressBar = (
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  percent: number,
  fillColor: [number, number, number]
) => {
  // Background
  doc.setFillColor(...PDF_COLORS.bgCard);
  doc.roundedRect(x, y, width, height, height / 2, height / 2, 'F');
  
  // Fill
  const fillWidth = (width * percent) / 100;
  if (fillWidth > 0) {
    doc.setFillColor(...fillColor);
    doc.roundedRect(x, y, Math.max(fillWidth, height), height, height / 2, height / 2, 'F');
  }
};

export const generateReadingListPDF = (
  options: ReadingListPDFOptions,
  allBooks: BookForPDF[],
  criticalRules: CriticalRuleForPDF[]
): jsPDF => {
  const doc = new jsPDF();
  let yPosition = 0;
  const { translations } = options;
  const pageWidth = 210;
  const marginLeft = 15;
  const marginRight = 15;
  const contentWidth = pageWidth - marginLeft - marginRight;

  // Get unread books
  const unreadBooks = allBooks.filter(book => !options.booksRead.includes(book.id));

  // Stage priority based on current stage
  const stagePriority: Record<string, number> = {
    [options.projectStage]: 0,
  };
  const stages = ['idea', 'mvp', 'traction'];
  const currentIndex = stages.indexOf(options.projectStage);
  if (currentIndex < stages.length - 1) {
    stagePriority[stages[currentIndex + 1]] = 1;
  }
  if (currentIndex > 0) {
    stagePriority[stages[currentIndex - 1]] = 2;
  }
  stages.forEach((s, i) => {
    if (stagePriority[s] === undefined) {
      stagePriority[s] = 3 + i;
    }
  });

  // Category priority based on archetype
  const userRole = options.userArchetype.toLowerCase();
  const categoryPriority: Record<string, number> = {
    [userRole]: 0,
    'universal': 1,
  };
  ['builder', 'seller'].forEach((c, i) => {
    if (categoryPriority[c] === undefined) {
      categoryPriority[c] = 2 + i;
    }
  });

  // Critical book IDs for this user's stage and role
  const criticalBookIds = new Set(
    criticalRules
      .filter(rule => 
        rule.stage === options.projectStage && 
        (!rule.role || rule.role === options.userArchetype)
      )
      .map(rule => rule.bookId)
  );

  // Sort unread books
  const sortedUnread = [...unreadBooks].sort((a, b) => {
    const aCritical = criticalBookIds.has(a.id) ? 0 : 1;
    const bCritical = criticalBookIds.has(b.id) ? 0 : 1;
    if (aCritical !== bCritical) return aCritical - bCritical;

    const aStage = stagePriority[a.critical_for_stage] ?? 99;
    const bStage = stagePriority[b.critical_for_stage] ?? 99;
    if (aStage !== bStage) return aStage - bStage;

    const aCat = categoryPriority[a.category] ?? 99;
    const bCat = categoryPriority[b.category] ?? 99;
    return aCat - bCat;
  });

  const criticalBooks = sortedUnread.filter(b => criticalBookIds.has(b.id));
  const regularBooks = sortedUnread.filter(b => !criticalBookIds.has(b.id));

  // ========== HEADER SECTION ==========
  // Purple header bar
  doc.setFillColor(...PDF_COLORS.primary);
  doc.rect(0, 0, pageWidth, 25, 'F');
  
  // Logo text
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PDF_COLORS.white);
  doc.text('GUILDA', marginLeft, 16);
  
  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('pt-BR'), pageWidth - marginRight, 16, { align: 'right' });
  
  yPosition = 35;

  // ========== TITLE ==========
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PDF_COLORS.text);
  doc.text(translations.title, marginLeft, yPosition);
  
  yPosition += 12;

  // ========== INFO CARD ==========
  const infoCardHeight = 20;
  drawRoundedRect(doc, marginLeft, yPosition, contentWidth, infoCardHeight, 3, PDF_COLORS.bgLight);
  
  // Archetype icon and name
  const archetypeColor = options.userArchetype === 'BUILDER' ? PDF_COLORS.builder : PDF_COLORS.seller;
  const archetypeName = options.userArchetype === 'BUILDER' ? 'Builder' : 'Seller';
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...archetypeColor);
  doc.text(archetypeName.toUpperCase(), marginLeft + 6, yPosition + 8);
  
  // Stage - increased spacing
  const stageColor = PDF_COLORS[options.projectStage as keyof typeof PDF_COLORS] as [number, number, number] || PDF_COLORS.success;
  const stageName = translations.stages[options.projectStage] || options.projectStage;
  
  doc.setTextColor(...stageColor);
  doc.text(`Estágio: ${stageName}`, marginLeft + 45, yPosition + 8);
  
  // Level - increased spacing
  doc.setTextColor(...PDF_COLORS.primary);
  doc.text(options.currentLevel, marginLeft + 100, yPosition + 8);
  
  // Progress bar
  const progressBarY = yPosition + 13;
  const progressBarWidth = contentWidth - 70;
  drawProgressBar(doc, marginLeft + 6, progressBarY, progressBarWidth, 4, options.progressPercent, PDF_COLORS.primary);
  
  // Progress text
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF_COLORS.textMuted);
  doc.text(
    `${options.readCount}/${options.totalBooks} (${options.progressPercent}%)`,
    marginLeft + progressBarWidth + 12,
    progressBarY + 3
  );
  
  yPosition += infoCardHeight + 6;

  // ========== BOOK RENDERING HELPER ==========
  const addBookCard = (index: number, book: BookForPDF, isCritical: boolean, isAlt: boolean) => {
    const cardHeight = 14;
    
    // Check for page break
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 15;
    }

    // Card background
    const bgColor = isCritical 
      ? PDF_COLORS.criticalLight 
      : (isAlt ? PDF_COLORS.bgLight : PDF_COLORS.white);
    drawRoundedRect(doc, marginLeft, yPosition, contentWidth, cardHeight, 2, bgColor);
    
    // Critical indicator border
    if (isCritical) {
      doc.setDrawColor(...PDF_COLORS.critical);
      doc.setLineWidth(0.5);
      doc.roundedRect(marginLeft, yPosition, contentWidth, cardHeight, 2, 2, 'S');
      doc.setLineWidth(0.2);
    }

    // Index number
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PDF_COLORS.textMuted);
    const indexText = `${index}.`;
    doc.text(indexText, marginLeft + 3, yPosition + 6);

    // Critical star - use asterisk instead of emoji
    let titleX = marginLeft + 12;
    if (isCritical) {
      doc.setTextColor(...PDF_COLORS.critical);
      doc.text('*', titleX, yPosition + 6);
      titleX += 4;
    }

    // Book title
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PDF_COLORS.text);
    doc.setFontSize(9);
    const maxTitleWidth = 95;
    let displayTitle = book.title;
    if (doc.getTextWidth(displayTitle) > maxTitleWidth) {
      while (doc.getTextWidth(displayTitle + '...') > maxTitleWidth && displayTitle.length > 0) {
        displayTitle = displayTitle.slice(0, -1);
      }
      displayTitle += '...';
    }
    doc.text(displayTitle, titleX, yPosition + 6);

    // Author
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...PDF_COLORS.textMuted);
    doc.text(book.author, titleX, yPosition + 11);

    // Badges on the right
    const badgeY = yPosition + 6;
    let badgeX = pageWidth - marginRight - 50;
    
    // Stage badge
    const stageText = translations.stages[book.critical_for_stage] || book.critical_for_stage;
    const stageColor = PDF_COLORS[book.critical_for_stage as keyof typeof PDF_COLORS] as [number, number, number] || PDF_COLORS.success;
    badgeX += drawBadge(doc, stageText.toUpperCase(), badgeX, badgeY, stageColor);
    
    // Category badge
    const catText = translations.categories[book.category] || book.category;
    const catColor = PDF_COLORS[book.category as keyof typeof PDF_COLORS] as [number, number, number] || PDF_COLORS.universal;
    drawBadge(doc, catText.toUpperCase(), badgeX, badgeY, catColor);

    yPosition += cardHeight + 1;
  };

  // ========== CRITICAL READINGS SECTION ==========
  if (criticalBooks.length > 0) {
    // Section header with red background
    doc.setFillColor(...PDF_COLORS.critical);
    doc.roundedRect(marginLeft, yPosition, contentWidth, 8, 2, 2, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PDF_COLORS.white);
    doc.text(`${translations.criticalReadings} (${criticalBooks.length})`, marginLeft + 5, yPosition + 6);
    
    yPosition += 10;

    criticalBooks.forEach((book, idx) => {
      addBookCard(idx + 1, book, true, idx % 2 === 1);
    });

    yPosition += 4;
  }

  // ========== RECOMMENDED READINGS SECTION ==========
  if (regularBooks.length > 0) {
    // Section header - no emoji
    doc.setFillColor(...PDF_COLORS.primary);
    doc.roundedRect(marginLeft, yPosition, contentWidth, 8, 2, 2, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PDF_COLORS.white);
    doc.text(`${translations.nextRecommendations} (${regularBooks.length})`, marginLeft + 5, yPosition + 6);
    
    yPosition += 10;

    const startIndex = criticalBooks.length + 1;
    regularBooks.forEach((book, idx) => {
      addBookCard(startIndex + idx, book, false, idx % 2 === 1);
    });
  }

  // ========== EMPTY STATE ==========
  if (sortedUnread.length === 0) {
    drawRoundedRect(doc, marginLeft, yPosition, contentWidth, 30, 3, PDF_COLORS.bgLight);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PDF_COLORS.success);
    doc.text('🎉 Parabéns!', pageWidth / 2, yPosition + 12, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...PDF_COLORS.text);
    doc.text('Você completou todos os livros do Cânone!', pageWidth / 2, yPosition + 22, { align: 'center' });
  }

  // ========== FOOTER ==========
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer bar
    doc.setFillColor(...PDF_COLORS.bgLight);
    doc.rect(0, 285, pageWidth, 12, 'F');
    
    // Footer content
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...PDF_COLORS.textMuted);
    
    doc.text(translations.footer, marginLeft, 291);
    doc.text(`${i}/${pageCount}`, pageWidth - marginRight, 291, { align: 'right' });
  }

  return doc;
};
