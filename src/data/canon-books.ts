export interface CanonBook {
  id: number;
  title: string;
  author: string;
  category: 'universal' | 'builder' | 'seller';
  critical_for_stage: 'idea' | 'mvp' | 'traction';
  isbn: string;
}

export const CANON_BOOKS: CanonBook[] = [
  { id: 1, title: "A Startup Enxuta", author: "Eric Ries", category: "universal", critical_for_stage: "idea", isbn: "9788563560803" },
  { id: 2, title: "Do Zero ao Um", author: "Peter Thiel", category: "universal", critical_for_stage: "idea", isbn: "9788539006182" },
  { id: 3, title: "O Lado Difícil das Situações Difíceis", author: "Ben Horowitz", category: "universal", critical_for_stage: "traction", isbn: "9788565847216" },
  { id: 4, title: "Rework", author: "Jason Fried", category: "universal", critical_for_stage: "mvp", isbn: "9780307463746" },
  { id: 5, title: "O Teste da Mãe", author: "Rob Fitzpatrick", category: "builder", critical_for_stage: "idea", isbn: "9788551302673" },
  { id: 6, title: "Inspirado", author: "Marty Cagan", category: "builder", critical_for_stage: "mvp", isbn: "9788550816692" },
  { id: 7, title: "Hooked: Engajado", author: "Nir Eyal", category: "builder", critical_for_stage: "traction", isbn: "9788550800608" },
  { id: 8, title: "Sprint", author: "Jake Knapp", category: "builder", critical_for_stage: "idea", isbn: "9788551001523" },
  { id: 9, title: "O Programador Pragmático", author: "Andrew Hunt", category: "builder", critical_for_stage: "mvp", isbn: "9788550819532" },
  { id: 10, title: "Não Me Faça Pensar", author: "Steve Krug", category: "builder", critical_for_stage: "mvp", isbn: "9788576088509" },
  { id: 11, title: "Shape Up", author: "Ryan Singer", category: "builder", critical_for_stage: "mvp", isbn: "9798888880548" },
  { id: 12, title: "A Travessia do Abismo", author: "Geoffrey Moore", category: "builder", critical_for_stage: "traction", isbn: "9788550816678" },
  { id: 13, title: "Tração", author: "Gabriel Weinberg", category: "seller", critical_for_stage: "traction", isbn: "9788550802015" },
  { id: 14, title: "Receita Previsível", author: "Aaron Ross", category: "seller", critical_for_stage: "traction", isbn: "9788551300183" },
  { id: 15, title: "As Armas da Persuasão", author: "Robert Cialdini", category: "seller", critical_for_stage: "mvp", isbn: "9788575429532" },
  { id: 16, title: "Hacking Growth", author: "Sean Ellis", category: "seller", critical_for_stage: "traction", isbn: "9788550803081" },
  { id: 17, title: "Spin Selling", author: "Neil Rackham", category: "seller", critical_for_stage: "traction", isbn: "9788576793953" },
  { id: 18, title: "Negocie Como Se Sua Vida Dependesse Disso", author: "Chris Voss", category: "seller", critical_for_stage: "mvp", isbn: "9788543105987" },
  { id: 19, title: "A Estratégia do Oceano Azul", author: "W. Chan Kim", category: "seller", critical_for_stage: "idea", isbn: "9788550816418" },
  { id: 20, title: "Contágio", author: "Jonah Berger", category: "seller", critical_for_stage: "mvp", isbn: "9788544105054" },
  { id: 21, title: "Blitzscaling", author: "Reid Hoffman", category: "universal", critical_for_stage: "traction", isbn: "9788550807583" },
  { id: 22, title: "Apertando o F5", author: "Satya Nadella", category: "universal", critical_for_stage: "traction", isbn: "9788595081536" },
  { id: 23, title: "A Era da IA", author: "Eric Schmidt", category: "universal", critical_for_stage: "traction", isbn: "9788535932829" }
];

// Critical book rules for gap detection
export interface CriticalBookRule {
  bookId: number;
  stage: 'idea' | 'mvp' | 'traction';
  role?: 'BUILDER' | 'SELLER';
  alertKey: string;
}

export const CRITICAL_BOOK_RULES: CriticalBookRule[] = [
  { bookId: 5, stage: 'idea', alertKey: 'momTest' },
  { bookId: 14, stage: 'traction', role: 'SELLER', alertKey: 'predictableRevenue' },
  { bookId: 6, stage: 'mvp', role: 'BUILDER', alertKey: 'inspired' },
  { bookId: 13, stage: 'traction', alertKey: 'traction' },
  { bookId: 1, stage: 'idea', alertKey: 'leanStartup' },
];

// Get book category color
export const getCategoryColor = (category: CanonBook['category']): string => {
  switch (category) {
    case 'universal':
      return 'from-amber-500 to-orange-600';
    case 'builder':
      return 'from-purple-500 to-violet-600';
    case 'seller':
      return 'from-emerald-500 to-teal-600';
    default:
      return 'from-slate-500 to-slate-600';
  }
};

// Get stage badge color
export const getStageColor = (stage: CanonBook['critical_for_stage']): string => {
  switch (stage) {
    case 'idea':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'mvp':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'traction':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
};
