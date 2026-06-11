export interface QuizOption {
  text: string;
  x: number;
  y: number;
  dims: [number, number, number, number, number];
  lead?: "hot" | "warm" | "cold";
}

export interface QuizQuestion {
  id: number;
  text: string;
  qualifier?: boolean;
  options: QuizOption[];
}

export interface ArchetypeData {
  name: string;
  emoji: string;
  tagline: string;
  color: string;
  description: string;
  strengths: [string, string, string];
  blindSpot: string;
  idealMatch: string;
  advice: string;
}

export const RADAR_LABELS = [
  "Execução Técnica",
  "Visão de Negócio",
  "Liderança",
  "Vendas & Relacionamento",
  "Resiliência",
] as const;

export const QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    text: "Você acorda com uma ideia de startup. Qual é sua primeira reação?",
    options: [
      { text: "Abrir o VS Code e prototipar", x: -3, y: -2, dims: [3, 0, 0, 0, 2] },
      { text: "Pesquisar o mercado e montar um plano", x: 1, y: 3, dims: [0, 2, 1, 0, 0] },
      { text: "Mandar mensagem pra 5 pessoas que poderiam ser clientes", x: 3, y: -2, dims: [0, 1, 0, 3, 2] },
      { text: "Desenhar a arquitetura do produto no papel", x: -2, y: 3, dims: [2, 1, 0, 0, 0] },
    ],
  },
  {
    id: 2,
    text: "Sua startup tem um bug crítico em produção E um cliente importante esperando resposta. O que você faz primeiro?",
    options: [
      { text: "Corrige o bug — se o produto não funciona, nada mais importa", x: -3, y: -2, dims: [3, 0, 0, 0, 2] },
      { text: "Responde o cliente — relacionamento é o que mantém o negócio vivo", x: 3, y: -2, dims: [0, 0, 0, 3, 1] },
      { text: "Avalia o impacto de cada um e delega o menos crítico", x: 1, y: 3, dims: [0, 1, 3, 0, 0] },
      { text: "Cria um processo para que isso nunca mais aconteça ao mesmo tempo", x: -1, y: 3, dims: [1, 1, 2, 0, 0] },
    ],
  },
  {
    id: 3,
    text: "Você precisa dominar um assunto novo para sua startup. Como você aprende?",
    options: [
      { text: "Tutoriais e documentação — aprendo fazendo", x: -2, y: -3, dims: [3, 0, 0, 0, 2] },
      { text: "Converso com 3 pessoas que já fizeram", x: 2, y: -2, dims: [0, 1, 0, 3, 1] },
      { text: "Leio 5 artigos e monto um framework mental antes de agir", x: 0, y: 3, dims: [0, 3, 1, 0, 0] },
      { text: "Entro num curso ou comunidade e acompanho o progresso", x: 0, y: -1, dims: [1, 1, 0, 1, 1] },
    ],
  },
  {
    id: 4,
    text: "Sua startup tem 3 meses de runway. Como você prioriza?",
    options: [
      { text: "Acelerar o desenvolvimento para lançar logo", x: -3, y: -2, dims: [2, 0, 0, 0, 3] },
      { text: "Ligar para potenciais clientes e fechar pré-vendas", x: 3, y: -3, dims: [0, 0, 0, 3, 3] },
      { text: "Cortar custos e repensar a estratégia de monetização", x: 0, y: 2, dims: [0, 2, 2, 0, 1] },
      { text: "Montar um pitch e buscar investimento", x: 2, y: 3, dims: [0, 2, 1, 2, 0] },
    ],
  },
  {
    id: 5,
    text: "Num time de 3 pessoas, qual papel você naturalmente assume?",
    options: [
      { text: "Quem constrói — código, design, infraestrutura", x: -3, y: -2, dims: [3, 0, 0, 0, 2] },
      { text: "Quem vende — fala com clientes, fecha deals, faz parcerias", x: 3, y: -2, dims: [0, 0, 0, 3, 2] },
      { text: "Quem planeja — roadmap, métricas, estratégia", x: 0, y: 2, dims: [0, 3, 1, 0, 0] },
      { text: "Quem lidera — alinha prioridades, toma decisões, resolve conflitos", x: 0, y: 3, dims: [0, 1, 3, 0, 0] },
    ],
  },
  {
    id: 6,
    text: "Daqui a 1 ano, o que te faria sentir que a startup deu certo?",
    options: [
      { text: "Produto tecnicamente sólido que os usuários amam", x: -3, y: -1, dims: [3, 0, 0, 0, 1] },
      { text: "Receita recorrente e clientes pagando todo mês", x: 2, y: -2, dims: [0, 1, 0, 2, 2] },
      { text: "Uma marca reconhecida no mercado como referência", x: 2, y: 2, dims: [0, 3, 1, 1, 0] },
      { text: "Um time forte que funciona sem depender só de mim", x: 0, y: 3, dims: [0, 0, 3, 0, 0] },
    ],
  },
  {
    id: 7,
    text: "O que os outros mais elogiam em você no trabalho?",
    options: [
      { text: "\"Você entrega rápido e com qualidade técnica impecável\"", x: -3, y: -2, dims: [3, 0, 0, 0, 2] },
      { text: "\"Você convence qualquer pessoa — até as mais difíceis\"", x: 3, y: -2, dims: [0, 0, 0, 3, 2] },
      { text: "\"Você sempre tem uma visão clara de para onde ir\"", x: 0, y: 3, dims: [0, 2, 3, 0, 0] },
      { text: "\"Você faz as coisas acontecerem, não importa o obstáculo\"", x: 0, y: -3, dims: [1, 0, 0, 1, 3] },
    ],
  },
  {
    id: 8,
    text: "Como você prefere convencer alguém de que sua ideia é boa?",
    options: [
      { text: "Mostro um protótipo funcionando", x: -3, y: -2, dims: [3, 0, 0, 0, 2] },
      { text: "Conto uma história que conecta com a dor da pessoa", x: 2, y: -1, dims: [0, 0, 0, 3, 1] },
      { text: "Apresento dados, TAM, comparáveis e projeções", x: 2, y: 3, dims: [0, 3, 1, 1, 0] },
      { text: "Desenho a visão de longo prazo e como tudo se conecta", x: -1, y: 3, dims: [1, 2, 2, 0, 0] },
    ],
  },
  {
    id: 9,
    text: "O que te dá mais energia no dia a dia de uma startup?",
    options: [
      { text: "Resolver um problema técnico complexo", x: -3, y: -2, dims: [3, 0, 0, 0, 2] },
      { text: "Fechar um deal ou ouvir feedback positivo de cliente", x: 3, y: -2, dims: [0, 0, 0, 3, 2] },
      { text: "Ver uma métrica crescendo consistentemente", x: 1, y: 2, dims: [0, 3, 1, 0, 0] },
      { text: "Montar uma estratégia e ver as peças se encaixando", x: 0, y: 3, dims: [0, 2, 2, 0, 0] },
    ],
  },
  {
    id: 10,
    text: "Qual é o seu momento agora?",
    qualifier: true,
    options: [
      { text: "Tenho uma ideia e quero começar nos próximos 30 dias", x: 0, y: 0, dims: [0, 0, 0, 0, 0], lead: "hot" },
      { text: "Já comecei algo solo e preciso de ajuda", x: 0, y: 0, dims: [0, 0, 0, 0, 0], lead: "hot" },
      { text: "Estou explorando, sem pressa", x: 0, y: 0, dims: [0, 0, 0, 0, 0], lead: "cold" },
      { text: "Já tenho um cofundador, quero validar a dinâmica", x: 0, y: 0, dims: [0, 0, 0, 0, 0], lead: "warm" },
    ],
  },
];

export const ARCHETYPES: Record<string, ArchetypeData> = {
  mago: {
    name: "Mago do Código",
    emoji: "🧙‍♂️",
    tagline: "Você transforma problemas em código — e código em produto.",
    color: "#7610DC",
    description:
      "Você é a força técnica bruta de qualquer startup. Quando outros estão debatendo, você já está prototipando. Sua zona de conforto é o terminal, não a sala de reunião. Você entrega rápido, resolve bugs sob pressão e constrói coisas que funcionam.",
    strengths: [
      "Velocidade de execução técnica",
      "Capacidade de prototipar sozinho",
      "Resolver problemas complexos com elegância",
    ],
    blindSpot:
      "Você pode construir o produto perfeito que ninguém compra. Sem alguém que venda, seu código morre no repositório.",
    idealMatch: "Paladino de Vendas",
    advice: "O melhor código do mundo não vale nada sem o primeiro cliente pagante. Encontre seu Paladino.",
  },
  arquiteto: {
    name: "Arquiteto Visionário",
    emoji: "🏗️",
    tagline: "Você não constrói features — você projeta sistemas.",
    color: "#4308B0",
    description:
      "Você pensa em arquitetura antes de escrever a primeira linha de código. Enxerga como as peças se conectam, prevê gargalos e planeja escalabilidade desde o dia 1. Seu desafio é que às vezes planeja mais do que executa.",
    strengths: [
      "Visão sistêmica",
      "Planejamento de roadmap",
      "Tomada de decisão técnica estratégica",
    ],
    blindSpot:
      "Você pode ficar preso no planejamento e nunca lançar. Precisa de alguém que force a ida ao mercado.",
    idealMatch: "Estrategista Arcano",
    advice: "O plano perfeito é inimigo do MVP lançado. Encontre quem te empurre para a rua.",
  },
  paladino: {
    name: "Paladino de Vendas",
    emoji: "⚔️",
    tagline: "Você não espera o mercado vir até você — você vai até ele.",
    color: "#F97316",
    description:
      "Você é um closer. Liga, manda mensagem, marca reunião, faz follow-up. Quando outros estão teorizando sobre product-market fit, você já está conversando com o décimo cliente. Sua energia é de hunter.",
    strengths: [
      "Capacidade de fechar deals",
      "Resiliência com rejeição",
      "Relacionamento com clientes",
    ],
    blindSpot:
      "Você vende promessas que dependem de alguém construir. Sem um Builder forte, você fecha deals que não consegue entregar.",
    idealMatch: "Mago do Código",
    advice: "Seu próximo deal depende de um produto que funciona. Encontre seu Mago.",
  },
  estrategista: {
    name: "Estrategista Arcano",
    emoji: "🔮",
    tagline: "Você enxerga o tabuleiro inteiro enquanto outros olham só para a próxima jogada.",
    color: "#D97706",
    description:
      "Você pensa em growth antes de pensar em produto. Entende canais, posicionamento, pricing e parcerias. Vê oportunidades onde outros veem mercados saturados. Você é o cérebro estratégico de negócios.",
    strengths: [
      "Visão de mercado",
      "Estratégia de crescimento",
      "Posicionamento e narrativa",
    ],
    blindSpot:
      "Estratégia sem execução é PowerPoint. Você precisa de quem transforme seus frameworks em features reais.",
    idealMatch: "Arquiteto Visionário",
    advice: "O melhor plano de growth do mundo precisa de um produto para crescer. Encontre seu Arquiteto.",
  },
  ranger: {
    name: "Ranger Híbrido",
    emoji: "🏹",
    tagline: "Você faz o que precisa ser feito — não importa o que seja.",
    color: "#6D28D9",
    description:
      "Você é o cofundador dos mil ofícios. Coda um pouco, vende um pouco, opera um pouco. No early stage, essa versatilidade é ouro. Você não espera ninguém — resolve.",
    strengths: [
      "Versatilidade extrema",
      "Adaptabilidade",
      "Capacidade de operar solo no early stage",
    ],
    blindSpot:
      "Fazer tudo 'mais ou menos' pode ser pior do que fazer uma coisa muito bem. Em algum momento, você precisa de um especialista.",
    idealMatch: "Mago do Código ou Paladino de Vendas",
    advice: "Versatilidade te trouxe até aqui. Especialização vai te levar ao próximo nível.",
  },
  comandante: {
    name: "Comandante da Guilda",
    emoji: "👑",
    tagline: "Você não constrói produtos nem fecha deals — você constrói times que fazem os dois.",
    color: "#A728EB",
    description:
      "Você é o CEO natural. Sua força não está em codar ou vender, mas em alinhar pessoas, tomar decisões difíceis e manter o time focado. Você orquestra.",
    strengths: [
      "Liderança e tomada de decisão",
      "Capacidade de alinhar visões",
      "Gestão de prioridades",
    ],
    blindSpot:
      "Sem builders e sellers dedicados, você é um general sem exército. Não adianta liderar se não tem quem execute.",
    idealMatch: "Builder forte + Seller forte",
    advice: "Monte seu exército antes de planejar a conquista. A Guilda é o melhor lugar para encontrar seus guerreiros.",
  },
};

export function getArchetype(x: number, y: number): string {
  if (x <= -7 && y <= 0) return "mago";
  if (x <= -7 && y > 0) return "arquiteto";
  if (x >= 7 && y <= 0) return "paladino";
  if (x >= 7 && y > 0) return "estrategista";
  if (x > -7 && x < 7 && y <= 0) return "ranger";
  return "comandante";
}

export function deriveTipo(archetypeKey: string, scoreX: number): "builder" | "seller" {
  if (archetypeKey === "mago" || archetypeKey === "arquiteto") return "builder";
  if (archetypeKey === "paladino" || archetypeKey === "estrategista") return "seller";
  return scoreX < 0 ? "builder" : "seller";
}

export function calculateRadarDims(answers: number[]): number[] {
  const totals = [0, 0, 0, 0, 0];
  answers.forEach((optionIndex, questionIndex) => {
    const dims = QUESTIONS[questionIndex].options[optionIndex].dims;
    for (let i = 0; i < 5; i++) {
      totals[i] += dims[i];
    }
  });
  return totals.map((v) => Math.round((v / 27) * 100));
}
