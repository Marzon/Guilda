export interface FAQQuestionData {
  id: string;
  sectionId: string;
  question: { pt: string; en: string; es: string };
  answer: { pt: string; en: string; es: string };
}

export interface FAQSectionData {
  id: string;
  title: { pt: string; en: string; es: string };
  colorClass: string;
  iconType: 'wrench' | 'lightbulb' | 'trending' | 'dollar' | 'rocket' | 'message';
  questions: FAQQuestionData[];
}

export const faqSectionsData: FAQSectionData[] = [
  {
    id: 'acceleration-program',
    title: { pt: 'Programa de Aceleração', en: 'Acceleration Program', es: 'Programa de Aceleración' },
    colorClass: 'text-purple-500',
    iconType: 'rocket',
    questions: [
      {
        id: 'accel-program-overview',
        sectionId: 'acceleration-program',
        question: { 
          pt: 'O que é o Programa de Aceleração da Guilda?', 
          en: 'What is the Guilda Acceleration Program?', 
          es: '¿Qué es el Programa de Aceleración de Guilda?' 
        },
        answer: { 
          pt: `O Programa de Aceleração é uma jornada intensiva de 15 dias onde Builders e Sellers trabalham juntos para validar uma ideia de startup. O programa combina:

🚀 **Missões diárias** - Tarefas práticas com feedback imediato de IA
🤖 **Commander** - Seu mentor de IA que avalia cada entrega com rigor e profundidade
✨ **Pivoter** - Análise estratégica que gera 7 ideias de pivot personalizadas baseadas em suas entregas

Ao final, você terá uma startup validada ou clareza sobre o próximo passo.`, 
          en: `The Acceleration Program is an intensive 15-day journey where Builders and Sellers work together to validate a startup idea. The program combines:

🚀 **Daily missions** - Practical tasks with immediate AI feedback
🤖 **Commander** - Your AI mentor that evaluates each delivery with rigor and depth
✨ **Pivoter** - Strategic analysis that generates 7 personalized pivot ideas based on your deliveries

At the end, you'll have a validated startup or clarity on the next step.`, 
          es: `El Programa de Aceleración es un viaje intensivo de 15 días donde Builders y Sellers trabajan juntos para validar una idea de startup. El programa combina:

🚀 **Misiones diarias** - Tareas prácticas con feedback inmediato de IA
🤖 **Commander** - Tu mentor de IA que evalúa cada entrega con rigor y profundidad
✨ **Pivoter** - Análisis estratégico que genera 7 ideas de pivot personalizadas basadas en tus entregas

Al final, tendrás una startup validada o claridad sobre el próximo paso.`
        }
      },
      {
        id: 'accel-program-commander',
        sectionId: 'acceleration-program',
        question: { 
          pt: '🤖 O que é o Commander e como ele funciona?', 
          en: '🤖 What is the Commander and how does it work?', 
          es: '🤖 ¿Qué es el Commander y cómo funciona?' 
        },
        answer: { 
          pt: `O **Commander** é seu mentor de IA no programa de aceleração. Ele funciona como um investidor exigente que:

📋 **Avalia cada entrega** - Analisa se você cumpriu os critérios da missão
💬 **Dá feedback detalhado** - Explica o que está bom e o que precisa melhorar
✅ **Aprova ou rejeita** - Só avança para o próximo dia quando a entrega está no padrão

**Por que isso importa?**
Startups falham por falta de feedback honesto. O Commander não te deixa avançar com entregas medianas - ele te força a melhorar.

**Dica:** Leia o feedback com atenção e resubmeta se for rejeitado. Cada iteração te deixa mais forte.`, 
          en: `The **Commander** is your AI mentor in the acceleration program. It works like a demanding investor who:

📋 **Evaluates each delivery** - Analyzes if you met the mission criteria
💬 **Gives detailed feedback** - Explains what's good and what needs improvement
✅ **Approves or rejects** - Only advances to the next day when delivery is up to standard

**Why does this matter?**
Startups fail due to lack of honest feedback. The Commander won't let you advance with mediocre deliveries - it forces you to improve.

**Tip:** Read the feedback carefully and resubmit if rejected. Each iteration makes you stronger.`, 
          es: `El **Commander** es tu mentor de IA en el programa de aceleración. Funciona como un inversor exigente que:

📋 **Evalúa cada entrega** - Analiza si cumpliste los criterios de la misión
💬 **Da feedback detallado** - Explica qué está bien y qué necesita mejorar
✅ **Aprueba o rechaza** - Solo avanza al siguiente día cuando la entrega está a la altura

**¿Por qué importa?**
Las startups fallan por falta de feedback honesto. El Commander no te deja avanzar con entregas mediocres - te obliga a mejorar.

**Tip:** Lee el feedback con atención y reenvía si fue rechazado. Cada iteración te hace más fuerte.`
        }
      },
      {
        id: 'accel-program-pivoter',
        sectionId: 'acceleration-program',
        question: { 
          pt: '✨ O que é o Pivoter e quando ele aparece?', 
          en: '✨ What is the Pivoter and when does it appear?', 
          es: '✨ ¿Qué es el Pivoter y cuándo aparece?' 
        },
        answer: { 
          pt: `O **Pivoter** é uma ferramenta de análise estratégica que aparece no **Dia 15 (O Veredito)** do programa. Ele:

🔍 **Analisa todas suas entregas** - Revisa as 15 missões que você completou
📊 **Calcula seu Score de Crescimento** - Avalia a viabilidade do seu negócio
💡 **Gera 7 ideias de pivot** - Sugestões personalizadas baseadas em seus pontos fortes e fracos

**O que cada pivot inclui:**
• Nome e conceito da transformação
• Por que tem potencial para você
• Dificuldade técnica (1-5 estrelas)
• Modelo de monetização sugerido
• Como fazer o MVP em 7 dias

**Importante:** O Pivoter não decide por você - ele expande suas opções para uma decisão mais informada.`, 
          en: `The **Pivoter** is a strategic analysis tool that appears on **Day 15 (The Verdict)** of the program. It:

🔍 **Analyzes all your deliveries** - Reviews the 15 missions you completed
📊 **Calculates your Growth Score** - Evaluates your business viability
💡 **Generates 7 pivot ideas** - Personalized suggestions based on your strengths and weaknesses

**What each pivot includes:**
• Name and transformation concept
• Why it has potential for you
• Technical difficulty (1-5 stars)
• Suggested monetization model
• How to build the MVP in 7 days

**Important:** The Pivoter doesn't decide for you - it expands your options for a more informed decision.`, 
          es: `El **Pivoter** es una herramienta de análisis estratégico que aparece en el **Día 15 (El Veredicto)** del programa. Él:

🔍 **Analiza todas tus entregas** - Revisa las 15 misiones que completaste
📊 **Calcula tu Score de Crecimiento** - Evalúa la viabilidad de tu negocio
💡 **Genera 7 ideas de pivot** - Sugerencias personalizadas basadas en tus fortalezas y debilidades

**Lo que incluye cada pivot:**
• Nombre y concepto de la transformación
• Por qué tiene potencial para ti
• Dificultad técnica (1-5 estrellas)
• Modelo de monetización sugerido
• Cómo hacer el MVP en 7 días

**Importante:** El Pivoter no decide por ti - expande tus opciones para una decisión más informada.`
        }
      },
      {
        id: 'accel-program-for-builders',
        sectionId: 'acceleration-program',
        question: { 
          pt: '🔧 Como funciona o programa para Builders?', 
          en: '🔧 How does the program work for Builders?', 
          es: '🔧 ¿Cómo funciona el programa para Builders?' 
        },
        answer: { 
          pt: `Como **Builder**, seu papel é transformar ideias em realidade. No programa você vai:

**Suas responsabilidades:**
• Construir o MVP técnico da startup
• Definir a arquitetura e stack tecnológico
• Validar viabilidade técnica das soluções
• Estimar prazos e complexidade

**O que você vai aprender:**
• Como validar antes de construir
• Técnicas de prototipagem rápida
• Como comunicar progresso para não-técnicos
• Equilíbrio entre perfeição e velocidade

**Dica para Builders:**
Você vai se sentir tentado a construir primeiro e validar depois. O programa te força a inverter isso - e isso vai te poupar meses de trabalho desperdiçado.`, 
          en: `As a **Builder**, your role is to turn ideas into reality. In the program you will:

**Your responsibilities:**
• Build the startup's technical MVP
• Define architecture and tech stack
• Validate technical feasibility of solutions
• Estimate timelines and complexity

**What you'll learn:**
• How to validate before building
• Rapid prototyping techniques
• How to communicate progress to non-technical people
• Balance between perfection and speed

**Tip for Builders:**
You'll feel tempted to build first and validate later. The program forces you to reverse this - and it will save you months of wasted work.`, 
          es: `Como **Builder**, tu rol es transformar ideas en realidad. En el programa vas a:

**Tus responsabilidades:**
• Construir el MVP técnico de la startup
• Definir la arquitectura y stack tecnológico
• Validar viabilidad técnica de las soluciones
• Estimar plazos y complejidad

**Lo que aprenderás:**
• Cómo validar antes de construir
• Técnicas de prototipado rápido
• Cómo comunicar progreso a no-técnicos
• Equilibrio entre perfección y velocidad

**Tip para Builders:**
Te sentirás tentado a construir primero y validar después. El programa te obliga a invertir esto - y eso te ahorrará meses de trabajo desperdiciado.`
        }
      },
      {
        id: 'accel-program-for-sellers',
        sectionId: 'acceleration-program',
        question: { 
          pt: '🎯 Como funciona o programa para Sellers?', 
          en: '🎯 How does the program work for Sellers?', 
          es: '🎯 ¿Cómo funciona el programa para Sellers?' 
        },
        answer: { 
          pt: `Como **Seller**, seu papel é garantir que estamos construindo algo que as pessoas querem comprar. No programa você vai:

**Suas responsabilidades:**
• Conversar com clientes potenciais
• Validar hipóteses de mercado
• Definir posicionamento e proposta de valor
• Criar estratégia de go-to-market

**O que você vai aprender:**
• Técnicas de customer discovery
• Como fazer entrevistas de problema
• Criação de landing pages de validação
• Métricas de tração inicial

**Dica para Sellers:**
Seu maior inimigo é o viés de confirmação. O programa te treina para ouvir o que os clientes realmente dizem, não o que você quer ouvir.`, 
          en: `As a **Seller**, your role is to ensure we're building something people want to buy. In the program you will:

**Your responsibilities:**
• Talk to potential customers
• Validate market hypotheses
• Define positioning and value proposition
• Create go-to-market strategy

**What you'll learn:**
• Customer discovery techniques
• How to conduct problem interviews
• Creating validation landing pages
• Early traction metrics

**Tip for Sellers:**
Your biggest enemy is confirmation bias. The program trains you to hear what customers actually say, not what you want to hear.`, 
          es: `Como **Seller**, tu rol es asegurar que estamos construyendo algo que las personas quieren comprar. En el programa vas a:

**Tus responsabilidades:**
• Hablar con clientes potenciales
• Validar hipótesis de mercado
• Definir posicionamiento y propuesta de valor
• Crear estrategia de go-to-market

**Lo que aprenderás:**
• Técnicas de customer discovery
• Cómo hacer entrevistas de problema
• Creación de landing pages de validación
• Métricas de tracción inicial

**Tip para Sellers:**
Tu mayor enemigo es el sesgo de confirmación. El programa te entrena para escuchar lo que los clientes realmente dicen, no lo que quieres oír.`
        }
      },
      {
        id: 'accel-program-for-investors',
        sectionId: 'acceleration-program',
        question: { 
          pt: '💰 Como investidores podem usar a plataforma?', 
          en: '💰 How can investors use the platform?', 
          es: '💰 ¿Cómo pueden los inversores usar la plataforma?' 
        },
        answer: { 
          pt: `A Guilda oferece acesso antecipado às startups mais promissoras da comunidade. Como investidor, você pode:

**Benefícios:**
• 🔍 **Dealflow qualificado** - Startups que passaram pelo programa têm validação real
• 📊 **Dados de execução** - Veja como a dupla executa sob pressão (15 entregas avaliadas)
• 🤝 **Acesso direto** - Conecte-se com fundadores antes de qualquer rodada

**O que diferencia nossas startups:**
• Passaram por validação intensiva de 15 dias
• Têm dupla Builder + Seller (execução balanceada)
• Receberam feedback brutal da IA (sem ego inflado)
• Sabem pivotar (foram treinados para isso)

**Como participar:**
Cadastre-se como investidor para receber nossa newsletter mensal com as melhores startups do programa.`, 
          en: `Guilda offers early access to the most promising startups in the community. As an investor, you can:

**Benefits:**
• 🔍 **Qualified dealflow** - Startups that went through the program have real validation
• 📊 **Execution data** - See how the duo executes under pressure (15 evaluated deliveries)
• 🤝 **Direct access** - Connect with founders before any round

**What differentiates our startups:**
• Went through 15-day intensive validation
• Have Builder + Seller duo (balanced execution)
• Received brutal AI feedback (no inflated egos)
• Know how to pivot (they were trained for it)

**How to participate:**
Sign up as an investor to receive our monthly newsletter with the best startups from the program.`, 
          es: `Guilda ofrece acceso anticipado a las startups más prometedoras de la comunidad. Como inversor, puedes:

**Beneficios:**
• 🔍 **Dealflow calificado** - Startups que pasaron por el programa tienen validación real
• 📊 **Datos de ejecución** - Ve cómo el dúo ejecuta bajo presión (15 entregas evaluadas)
• 🤝 **Acceso directo** - Conéctate con fundadores antes de cualquier ronda

**Lo que diferencia nuestras startups:**
• Pasaron por validación intensiva de 15 días
• Tienen dúo Builder + Seller (ejecución balanceada)
• Recibieron feedback brutal de la IA (sin egos inflados)
• Saben pivotar (fueron entrenados para eso)

**Cómo participar:**
Regístrate como inversor para recibir nuestro newsletter mensual con las mejores startups del programa.`
        }
      },
      {
        id: 'accel-program-phases',
        sectionId: 'acceleration-program',
        question: { 
          pt: 'Quais são as fases do programa?', 
          en: 'What are the program phases?', 
          es: '¿Cuáles son las fases del programa?' 
        },
        answer: { 
          pt: `O programa é dividido em **3 fases** ao longo de 15 dias:

**🔍 Fase 1: Descoberta (Dias 1-5)**
• Definir o problema que você resolve
• Identificar seu público-alvo
• Mapear a concorrência
• Criar hipóteses iniciais

**🧪 Fase 2: Validação (Dias 6-10)**
• Conversar com clientes reais
• Testar proposta de valor
• Criar protótipos de baixa fidelidade
• Coletar evidências de tração

**🚀 Fase 3: Tração (Dias 11-15)**
• Construir MVP funcional
• Definir estratégia de lançamento
• Validar modelo de negócios
• **Dia 15: O Veredito** (análise final + Pivoter)

Cada dia tem uma missão específica com critérios claros de aprovação.`, 
          en: `The program is divided into **3 phases** over 15 days:

**🔍 Phase 1: Discovery (Days 1-5)**
• Define the problem you solve
• Identify your target audience
• Map the competition
• Create initial hypotheses

**🧪 Phase 2: Validation (Days 6-10)**
• Talk to real customers
• Test value proposition
• Create low-fidelity prototypes
• Collect traction evidence

**🚀 Phase 3: Traction (Days 11-15)**
• Build functional MVP
• Define launch strategy
• Validate business model
• **Day 15: The Verdict** (final analysis + Pivoter)

Each day has a specific mission with clear approval criteria.`, 
          es: `El programa está dividido en **3 fases** a lo largo de 15 días:

**🔍 Fase 1: Descubrimiento (Días 1-5)**
• Definir el problema que resuelves
• Identificar tu público objetivo
• Mapear la competencia
• Crear hipótesis iniciales

**🧪 Fase 2: Validación (Días 6-10)**
• Hablar con clientes reales
• Probar propuesta de valor
• Crear prototipos de baja fidelidad
• Recolectar evidencias de tracción

**🚀 Fase 3: Tracción (Días 11-15)**
• Construir MVP funcional
• Definir estrategia de lanzamiento
• Validar modelo de negocio
• **Día 15: El Veredicto** (análisis final + Pivoter)

Cada día tiene una misión específica con criterios claros de aprobación.`
        }
      }
    ]
  },
  {
    id: 'acceleration-prep',
    title: { pt: 'Preparação para Aceleração', en: 'Acceleration Preparation', es: 'Preparación para Aceleración' },
    colorClass: 'text-violet-500',
    iconType: 'lightbulb',
    questions: [
      {
        id: 'accel-prep-q1',
        sectionId: 'acceleration-prep',
        question: { 
          pt: 'Como me preparar para a primeira reunião com meu co-founder?', 
          en: 'How to prepare for the first meeting with my co-founder?', 
          es: '¿Cómo prepararme para la primera reunión con mi co-founder?' 
        },
        answer: { 
          pt: 'Antes de começar o programa, reserve 1-2 horas para uma reunião inicial. Usem este tempo para se conhecer melhor, explorar o site juntos (Blog, FAQ, Ferramentas) e alinhar expectativas. Sigam o guia de entrevista de co-founders abaixo.', 
          en: 'Before starting the program, set aside 1-2 hours for an initial meeting. Use this time to get to know each other better, explore the site together (Blog, FAQ, Tools) and align expectations. Follow the co-founder interview guide below.', 
          es: 'Antes de comenzar el programa, reserva 1-2 horas para una reunión inicial. Usen este tiempo para conocerse mejor, explorar el sitio juntos (Blog, FAQ, Herramientas) y alinear expectativas. Sigan la guía de entrevista de co-founders abajo.' 
        }
      },
      {
        id: 'accel-prep-q2',
        sectionId: 'acceleration-prep',
        question: { 
          pt: 'Quais perguntas fazer na entrevista de co-founders?', 
          en: 'What questions to ask in the co-founder interview?', 
          es: '¿Qué preguntas hacer en la entrevista de co-founders?' 
        },
        answer: { 
          pt: '1) Qual sua motivação para empreender? 2) Quanto tempo você pode dedicar semanalmente? 3) Qual sua situação financeira e runway pessoal? 4) Quais são seus pontos fortes e fracos? 5) Como você lida com conflitos? 6) Qual seu objetivo em 5 anos? 7) Você já teve sociedades antes? Como foram? 8) O que te faria desistir deste projeto?', 
          en: '1) What is your motivation to start a business? 2) How much time can you dedicate weekly? 3) What is your financial situation and personal runway? 4) What are your strengths and weaknesses? 5) How do you handle conflicts? 6) What is your goal in 5 years? 7) Have you had partnerships before? How were they? 8) What would make you give up on this project?', 
          es: '1) ¿Cuál es tu motivación para emprender? 2) ¿Cuánto tiempo puedes dedicar semanalmente? 3) ¿Cuál es tu situación financiera y runway personal? 4) ¿Cuáles son tus fortalezas y debilidades? 5) ¿Cómo manejas los conflictos? 6) ¿Cuál es tu objetivo en 5 años? 7) ¿Has tenido sociedades antes? ¿Cómo fueron? 8) ¿Qué te haría desistir de este proyecto?' 
        }
      },
      {
        id: 'accel-prep-seller-interview',
        sectionId: 'acceleration-prep',
        question: { 
          pt: '🎯 Guia de Entrevista para Sellers: Como avaliar um Builder?', 
          en: '🎯 Interview Guide for Sellers: How to evaluate a Builder?', 
          es: '🎯 Guía de Entrevista para Sellers: ¿Cómo evaluar un Builder?' 
        },
        answer: { 
          pt: `**Perguntas Técnicas:**
1) Me mostre algo que você construiu do zero. Qual foi o maior desafio técnico?
2) Como você decide qual tecnologia usar em um projeto?
3) Quanto tempo você levaria para construir um MVP funcional?
4) Como você lida com bugs críticos em produção?

**Perguntas de Processo:**
5) Como você organiza seu trabalho? Usa sprints, kanban?
6) Como você comunica progresso técnico para não-técnicos?
7) Qual sua experiência com entregas sob pressão?

**Red Flags para Observar:**
⚠️ Não consegue explicar decisões técnicas de forma simples
⚠️ Nunca terminou um projeto pessoal
⚠️ Foca mais em tecnologia perfeita do que em resolver o problema
⚠️ Não aceita feedback ou críticas
⚠️ Estima prazos muito otimistas sem considerar imprevistos

**Green Flags:**
✅ Portfolio com projetos finalizados
✅ Explica conceitos técnicos claramente
✅ Pergunta sobre o problema antes de propor solução
✅ Tem noção de produto, não só código
✅ Admite o que não sabe e propõe como aprender`, 
          en: `**Technical Questions:**
1) Show me something you built from scratch. What was the biggest technical challenge?
2) How do you decide which technology to use in a project?
3) How long would it take you to build a functional MVP?
4) How do you handle critical bugs in production?

**Process Questions:**
5) How do you organize your work? Do you use sprints, kanban?
6) How do you communicate technical progress to non-technical people?
7) What is your experience with deliveries under pressure?

**Red Flags to Watch:**
⚠️ Cannot explain technical decisions simply
⚠️ Never finished a personal project
⚠️ Focuses more on perfect technology than solving the problem
⚠️ Does not accept feedback or criticism
⚠️ Estimates very optimistic deadlines without considering contingencies

**Green Flags:**
✅ Portfolio with finished projects
✅ Explains technical concepts clearly
✅ Asks about the problem before proposing a solution
✅ Has product sense, not just code
✅ Admits what they don't know and proposes how to learn`, 
          es: `**Preguntas Técnicas:**
1) Muéstrame algo que construiste desde cero. ¿Cuál fue el mayor desafío técnico?
2) ¿Cómo decides qué tecnología usar en un proyecto?
3) ¿Cuánto tiempo te tomaría construir un MVP funcional?
4) ¿Cómo manejas bugs críticos en producción?

**Preguntas de Proceso:**
5) ¿Cómo organizas tu trabajo? ¿Usas sprints, kanban?
6) ¿Cómo comunicas el progreso técnico a personas no técnicas?
7) ¿Cuál es tu experiencia con entregas bajo presión?

**Red Flags a Observar:**
⚠️ No puede explicar decisiones técnicas de forma simple
⚠️ Nunca terminó un proyecto personal
⚠️ Se enfoca más en tecnología perfecta que en resolver el problema
⚠️ No acepta feedback o críticas
⚠️ Estima plazos muy optimistas sin considerar imprevistos

**Green Flags:**
✅ Portfolio con proyectos terminados
✅ Explica conceptos técnicos claramente
✅ Pregunta sobre el problema antes de proponer solución
✅ Tiene noción de producto, no solo código
✅ Admite lo que no sabe y propone cómo aprender` 
        }
      },
      {
        id: 'accel-prep-builder-interview',
        sectionId: 'acceleration-prep',
        question: { 
          pt: '🎯 Guia de Entrevista para Builders: Como avaliar um Seller?', 
          en: '🎯 Interview Guide for Builders: How to evaluate a Seller?', 
          es: '🎯 Guía de Entrevista para Builders: ¿Cómo evaluar un Seller?' 
        },
        answer: { 
          pt: `**Perguntas de Vendas:**
1) Me conta uma venda difícil que você fechou. Qual foi sua estratégia?
2) Como você faz prospecção de clientes? Qual seu processo?
3) Qual foi a maior objeção que você superou?
4) Como você mede seu próprio desempenho em vendas?

**Perguntas de Mercado:**
5) Como você valida se um produto tem demanda?
6) Como você descobre o preço certo para um produto?
7) Qual sua experiência com marketing digital e growth?

**Perguntas de Startup:**
8) Você está confortável vendendo algo que ainda não existe 100%?
9) Como você lida com rejeição constante?
10) Já trabalhou sem salário fixo antes? Como foi?

**Red Flags para Observar:**
⚠️ Só fala de teoria, sem exemplos práticos
⚠️ Nunca vendeu algo "do zero" (só manteve carteira existente)
⚠️ Não demonstra curiosidade sobre o produto/tecnologia
⚠️ Foco excessivo em comissão antes de entender o projeto
⚠️ Não consegue explicar um funil de vendas básico

**Green Flags:**
✅ Histórico comprovado de vendas B2B ou B2C
✅ Entende métricas (CAC, LTV, churn, conversão)
✅ Faz perguntas inteligentes sobre o problema e mercado
✅ Experiência em early-stage ou startup
✅ Confortável com ambiguidade e "fazer acontecer"
✅ Tem rede de contatos relevante para o setor`, 
          en: `**Sales Questions:**
1) Tell me about a difficult sale you closed. What was your strategy?
2) How do you prospect for customers? What is your process?
3) What was the biggest objection you overcame?
4) How do you measure your own sales performance?

**Market Questions:**
5) How do you validate if a product has demand?
6) How do you discover the right price for a product?
7) What is your experience with digital marketing and growth?

**Startup Questions:**
8) Are you comfortable selling something that doesn't 100% exist yet?
9) How do you handle constant rejection?
10) Have you ever worked without a fixed salary? How was it?

**Red Flags to Watch:**
⚠️ Only talks theory, no practical examples
⚠️ Never sold something "from scratch" (only maintained existing portfolio)
⚠️ Shows no curiosity about the product/technology
⚠️ Excessive focus on commission before understanding the project
⚠️ Cannot explain a basic sales funnel

**Green Flags:**
✅ Proven track record of B2B or B2C sales
✅ Understands metrics (CAC, LTV, churn, conversion)
✅ Asks smart questions about the problem and market
✅ Experience in early-stage or startup
✅ Comfortable with ambiguity and "making things happen"
✅ Has relevant network of contacts for the sector`, 
          es: `**Preguntas de Ventas:**
1) Cuéntame de una venta difícil que cerraste. ¿Cuál fue tu estrategia?
2) ¿Cómo haces prospección de clientes? ¿Cuál es tu proceso?
3) ¿Cuál fue la mayor objeción que superaste?
4) ¿Cómo mides tu propio desempeño en ventas?

**Preguntas de Mercado:**
5) ¿Cómo validas si un producto tiene demanda?
6) ¿Cómo descubres el precio correcto para un producto?
7) ¿Cuál es tu experiencia con marketing digital y growth?

**Preguntas de Startup:**
8) ¿Estás cómodo vendiendo algo que aún no existe 100%?
9) ¿Cómo manejas el rechazo constante?
10) ¿Has trabajado sin salario fijo antes? ¿Cómo fue?

**Red Flags a Observar:**
⚠️ Solo habla de teoría, sin ejemplos prácticos
⚠️ Nunca vendió algo "desde cero" (solo mantuvo cartera existente)
⚠️ No muestra curiosidad sobre el producto/tecnología
⚠️ Enfoque excesivo en comisión antes de entender el proyecto
⚠️ No puede explicar un embudo de ventas básico

**Green Flags:**
✅ Historial comprobado de ventas B2B o B2C
✅ Entiende métricas (CAC, LTV, churn, conversión)
✅ Hace preguntas inteligentes sobre el problema y mercado
✅ Experiencia en early-stage o startup
✅ Cómodo con ambigüedad y "hacer que las cosas pasen"
✅ Tiene red de contactos relevante para el sector` 
        }
      },
      {
        id: 'accel-prep-q3',
        sectionId: 'acceleration-prep',
        question: { 
          pt: 'Como dividir responsabilidades (Builder vs Seller)?', 
          en: 'How to divide responsibilities (Builder vs Seller)?', 
          es: '¿Cómo dividir responsabilidades (Builder vs Seller)?' 
        },
        answer: { 
          pt: 'Builder: foca em produto, tecnologia, desenvolvimento, UX/UI, arquitetura técnica. Seller: foca em vendas, marketing, growth, relacionamento com clientes, parcerias. Ambos participam de decisões estratégicas. Documentem isso no memorando de entendimento.', 
          en: 'Builder: focuses on product, technology, development, UX/UI, technical architecture. Seller: focuses on sales, marketing, growth, customer relationships, partnerships. Both participate in strategic decisions. Document this in the memorandum of understanding.', 
          es: 'Builder: se enfoca en producto, tecnología, desarrollo, UX/UI, arquitectura técnica. Seller: se enfoca en ventas, marketing, growth, relación con clientes, alianzas. Ambos participan en decisiones estratégicas. Documenten esto en el memorando de entendimiento.' 
        }
      },
      {
        id: 'accel-prep-q4',
        sectionId: 'acceleration-prep',
        question: { 
          pt: 'O que é o memorando de entendimento?', 
          en: 'What is the memorandum of understanding?', 
          es: '¿Qué es el memorando de entendimiento?' 
        },
        answer: { 
          pt: 'É um documento informal onde vocês registram quem faz o quê, expectativas de dedicação, divisão inicial de equity, e como vão lidar com decisões importantes. Não é um contrato legal, mas ajuda a alinhar expectativas desde o início.', 
          en: 'It is an informal document where you record who does what, dedication expectations, initial equity split, and how you will handle important decisions. It is not a legal contract, but it helps align expectations from the start.', 
          es: 'Es un documento informal donde registran quién hace qué, expectativas de dedicación, división inicial de equity, y cómo van a manejar decisiones importantes. No es un contrato legal, pero ayuda a alinear expectativas desde el inicio.' 
        }
      },
      {
        id: 'accel-prep-q5',
        sectionId: 'acceleration-prep',
        question: { 
          pt: 'Como alinhar expectativas de equity e dedicação?', 
          en: 'How to align equity and dedication expectations?', 
          es: '¿Cómo alinear expectativas de equity y dedicación?' 
        },
        answer: { 
          pt: 'Sejam honestos sobre: 1) Quantas horas semanais cada um pode dedicar 2) Se é full-time ou part-time 3) Quanto tempo podem viver sem salário 4) Como querem dividir equity (não precisa ser 50/50). Use nossa calculadora de equity para simular cenários.', 
          en: 'Be honest about: 1) How many weekly hours each can dedicate 2) If it is full-time or part-time 3) How long you can live without salary 4) How you want to split equity (it does not have to be 50/50). Use our equity calculator to simulate scenarios.', 
          es: 'Sean honestos sobre: 1) Cuántas horas semanales cada uno puede dedicar 2) Si es full-time o part-time 3) Cuánto tiempo pueden vivir sin salario 4) Cómo quieren dividir el equity (no tiene que ser 50/50). Usen nuestra calculadora de equity para simular escenarios.' 
        }
      },
      {
        id: 'accel-prep-q6',
        sectionId: 'acceleration-prep',
        question: { 
          pt: 'Preciso definir o nome da startup agora?', 
          en: 'Do I need to define the startup name now?', 
          es: '¿Necesito definir el nombre de la startup ahora?' 
        },
        answer: { 
          pt: 'Sim, escolham um nome provisório. Pode ser simples e você pode mudar depois. O importante é ter algo para identificar o projeto durante o programa. Evitem gastar muito tempo nisso - foquem no problema e solução primeiro.', 
          en: 'Yes, choose a provisional name. It can be simple and you can change it later. The important thing is to have something to identify the project during the program. Avoid spending too much time on this - focus on the problem and solution first.', 
          es: 'Sí, elijan un nombre provisional. Puede ser simple y pueden cambiarlo después. Lo importante es tener algo para identificar el proyecto durante el programa. Eviten gastar mucho tiempo en esto - enfóquense en el problema y solución primero.' 
        }
      },
    ]
  },
  {
    id: 'builders',
    title: { pt: 'Para Builders', en: 'For Builders', es: 'Para Builders' },
    colorClass: 'text-primary',
    iconType: 'wrench',
    questions: [
      {
        id: 'builders-q1',
        sectionId: 'builders',
        question: { 
          pt: 'Como completar meu perfil de Builder?', 
          en: 'How to complete my Builder profile?', 
          es: '¿Cómo completar mi perfil de Builder?' 
        },
        answer: { 
          pt: 'Acesse "Editar Perfil" no menu. Adicione uma foto profissional, escreva uma bio destacando suas skills técnicas, selecione até 10 habilidades principais e descreva o que você oferece e busca. Perfis completos têm 3x mais chances de receber conexões.', 
          en: 'Access "Edit Profile" in the menu. Add a professional photo, write a bio highlighting your technical skills, select up to 10 main skills and describe what you offer and are looking for. Complete profiles are 3x more likely to receive connections.', 
          es: 'Accede a "Editar Perfil" en el menú. Agrega una foto profesional, escribe una bio destacando tus habilidades técnicas, selecciona hasta 10 habilidades principales y describe lo que ofreces y buscas. Los perfiles completos tienen 3x más probabilidades de recibir conexiones.' 
        }
      },
      {
        id: 'builders-q2',
        sectionId: 'builders',
        question: { 
          pt: 'Como criar uma startup?', 
          en: 'How to create a startup?', 
          es: '¿Cómo crear una startup?' 
        },
        answer: { 
          pt: 'Clique em "Criar Startup" no menu principal. Adicione nome, descrição do problema que resolve, estágio atual (ideia, MVP, tração) e uma imagem. Você pode definir vagas abertas para atrair cofundadores. Startups ativas aparecem para toda a comunidade.', 
          en: 'Click "Create Startup" in the main menu. Add name, problem description, current stage (idea, MVP, traction) and an image. You can set open positions to attract co-founders. Active startups appear to the entire community.', 
          es: 'Haz clic en "Crear Startup" en el menú principal. Agrega nombre, descripción del problema, etapa actual (idea, MVP, tracción) y una imagen. Puedes definir vacantes para atraer cofundadores. Las startups activas aparecen para toda la comunidad.' 
        }
      },
      {
        id: 'builders-q3',
        sectionId: 'builders',
        question: { 
          pt: 'Como publicar uma vaga na minha startup?', 
          en: 'How to post a job in my startup?', 
          es: '¿Cómo publicar una vacante en mi startup?' 
        },
        answer: { 
          pt: 'Dentro da sua startup, vá em "Configurações" e depois "Vagas". Defina o título da vaga, descrição das responsabilidades, equity oferecido e skills desejadas. Candidatos interessados enviarão aplicações que você pode revisar.', 
          en: 'Inside your startup, go to "Settings" then "Jobs". Define the job title, responsibilities description, offered equity and desired skills. Interested candidates will send applications you can review.', 
          es: 'Dentro de tu startup, ve a "Configuración" y luego "Vacantes". Define el título de la vacante, descripción de responsabilidades, equity ofrecido y habilidades deseadas. Los candidatos interesados enviarán solicitudes que puedes revisar.' 
        }
      },
      {
        id: 'builders-q4',
        sectionId: 'builders',
        question: { 
          pt: 'Como encontrar um cofounder comercial (Seller)?', 
          en: 'How to find a commercial co-founder (Seller)?', 
          es: '¿Cómo encontrar un cofundador comercial (Seller)?' 
        },
        answer: { 
          pt: 'Use a Taverna e filtre por "Sellers". Analise os perfis de profissionais com experiência em vendas, marketing ou growth. Envie um convite de conexão destacando seu projeto e como um Seller pode agregar. Após aceito, inicie a conversa sobre a oportunidade.', 
          en: 'Use the Tavern and filter by "Sellers". Analyze profiles of professionals with experience in sales, marketing or growth. Send a connection request highlighting your project and how a Seller can add value. Once accepted, start the conversation about the opportunity.', 
          es: 'Usa la Taberna y filtra por "Sellers". Analiza los perfiles de profesionales con experiencia en ventas, marketing o growth. Envía una solicitud de conexión destacando tu proyecto y cómo un Seller puede agregar valor. Una vez aceptado, inicia la conversación sobre la oportunidad.' 
        }
      },
      {
        id: 'builders-q5',
        sectionId: 'builders',
        question: { 
          pt: 'Como usar as ferramentas de startup?', 
          en: 'How to use startup tools?', 
          es: '¿Cómo usar las herramientas de startup?' 
        },
        answer: { 
          pt: 'Acesse "Ferramentas" no menu. Você encontra calculadoras de equity, valuation, cap table, runway e mais. Cada ferramenta guia você passo a passo. Resultados podem ser exportados em PDF para apresentar a investidores.', 
          en: 'Access "Tools" in the menu. You will find equity, valuation, cap table, runway calculators and more. Each tool guides you step by step. Results can be exported to PDF to present to investors.', 
          es: 'Accede a "Herramientas" en el menú. Encontrarás calculadoras de equity, valuación, cap table, runway y más. Cada herramienta te guía paso a paso. Los resultados se pueden exportar en PDF para presentar a inversores.' 
        }
      },
      {
        id: 'builders-q6',
        sectionId: 'builders',
        question: { 
          pt: 'Como editar vagas abertas na minha startup?', 
          en: 'How to edit open positions in my startup?', 
          es: '¿Cómo editar vacantes abiertas en mi startup?' 
        },
        answer: { 
          pt: 'Acesse a página da sua startup e clique em "Configurações". Na aba "Vagas", você verá todas as posições. Clique no ícone de lápis para editar nome, descrição, arquétipo e skills da vaga. As alterações são salvas automaticamente.', 
          en: 'Access your startup page and click "Settings". In the "Jobs" tab, you will see all positions. Click the pencil icon to edit name, description, archetype and skills. Changes are saved automatically.', 
          es: 'Accede a la página de tu startup y haz clic en "Configuración". En la pestaña "Vacantes", verás todas las posiciones. Haz clic en el ícono de lápiz para editar nombre, descripción, arquetipo y skills. Los cambios se guardan automáticamente.' 
        }
      },
      {
        id: 'builders-q7',
        sectionId: 'builders',
        question: { 
          pt: 'Como gerenciar candidaturas e aprovar membros?', 
          en: 'How to manage applications and approve team members?', 
          es: '¿Cómo gestionar candidaturas y aprobar miembros?' 
        },
        answer: { 
          pt: 'Na aba "Candidaturas" das configurações do projeto, você vê todas as aplicações. Aceite ou rejeite candidatos pendentes. Candidatos aceitos aparecem na aba "Equipe" onde você pode aprovar para adicionar ao time ou rejeitar. O botão desaparece automaticamente após a aprovação.', 
          en: 'In the "Applications" tab of project settings, you see all applications. Accept or reject pending candidates. Accepted candidates appear in the "Team" tab where you can approve to add to the team or reject. The button disappears automatically after approval.', 
          es: 'En la pestaña "Candidaturas" de la configuración del proyecto, ves todas las aplicaciones. Acepta o rechaza candidatos pendientes. Los candidatos aceptados aparecen en la pestaña "Equipo" donde puedes aprobar para agregar al equipo o rechazar. El botón desaparece automáticamente después de la aprobación.' 
        }
      },
      {
        id: 'builders-q8',
        sectionId: 'builders',
        question: { 
          pt: 'Posso re-adicionar um membro que foi removido?', 
          en: 'Can I re-add a member who was removed?', 
          es: '¿Puedo re-agregar un miembro que fue removido?' 
        },
        answer: { 
          pt: 'Sim! Se você removeu alguém do time, pode adicioná-lo novamente. Basta aprovar a candidatura existente ou adicionar manualmente na aba "Equipe". O sistema detecta automaticamente que a pessoa já foi membro e reativa o acesso.', 
          en: 'Yes! If you removed someone from the team, you can add them back. Just approve the existing application or add manually in the "Team" tab. The system automatically detects the person was a member and reactivates their access.', 
          es: '¡Sí! Si removiste a alguien del equipo, puedes agregarlo de nuevo. Solo aprueba la candidatura existente o agrega manualmente en la pestaña "Equipo". El sistema detecta automáticamente que la persona ya fue miembro y reactiva su acceso.' 
        }
      },
    ]
  },
  {
    id: 'builders-advanced',
    title: { pt: 'Dicas Avançadas para Builders', en: 'Advanced Tips for Builders', es: 'Consejos Avanzados para Builders' },
    colorClass: 'text-primary',
    iconType: 'lightbulb',
    questions: [
      {
        id: 'builders-adv-q1',
        sectionId: 'builders-advanced',
        question: { 
          pt: 'Como otimizar meu perfil para atrair Sellers de qualidade?', 
          en: 'How to optimize my profile to attract quality Sellers?', 
          es: '¿Cómo optimizar mi perfil para atraer Sellers de calidad?' 
        },
        answer: { 
          pt: 'Destaque métricas do seu projeto (usuários, receita, crescimento). Sellers experientes buscam startups com tração real. Mencione o tamanho do mercado e diferencial competitivo na bio. Perfis com projetos ativos recebem 5x mais visualizações.', 
          en: 'Highlight your project metrics (users, revenue, growth). Experienced Sellers look for startups with real traction. Mention market size and competitive advantage in your bio. Profiles with active projects receive 5x more views.', 
          es: 'Destaca las métricas de tu proyecto (usuarios, ingresos, crecimiento). Los Sellers experimentados buscan startups con tracción real. Menciona el tamaño del mercado y ventaja competitiva en tu bio. Los perfiles con proyectos activos reciben 5x más visualizaciones.' 
        }
      },
      {
        id: 'builders-adv-q2',
        sectionId: 'builders-advanced',
        question: { 
          pt: 'Estratégias de networking para validação de mercado', 
          en: 'Networking strategies for market validation', 
          es: 'Estrategias de networking para validación de mercado' 
        },
        answer: { 
          pt: 'Conecte-se com Sellers do seu setor. Peça feedback sobre pitch e estratégia comercial antes de formalizar parcerias. Muitos oferecem consultoria gratuita em troca de conhecer o projeto. Responder rápido a candidaturas aumenta taxa de conversão.', 
          en: 'Connect with Sellers in your industry. Ask for feedback on pitch and commercial strategy before formalizing partnerships. Many offer free consulting in exchange for learning about the project. Responding quickly to applications increases conversion rate.', 
          es: 'Conéctate con Sellers de tu sector. Pide feedback sobre pitch y estrategia comercial antes de formalizar alianzas. Muchos ofrecen consultoría gratuita a cambio de conocer el proyecto. Responder rápido a las solicitudes aumenta la tasa de conversión.' 
        }
      },
      {
        id: 'builders-adv-q3',
        sectionId: 'builders-advanced',
        question: { 
          pt: 'Como usar ferramentas para impressionar investidores?', 
          en: 'How to use tools to impress investors?', 
          es: '¿Cómo usar herramientas para impresionar inversores?' 
        },
        answer: { 
          pt: 'Gere relatórios de Cap Table, Valuation e Runway antes de reuniões. Apresentar projeções bem fundamentadas demonstra maturidade e aumenta credibilidade com VCs. Usar calculadoras e compartilhar resultados mostra profissionalismo.', 
          en: 'Generate Cap Table, Valuation and Runway reports before meetings. Presenting well-founded projections demonstrates maturity and increases credibility with VCs. Using calculators and sharing results shows professionalism.', 
          es: 'Genera informes de Cap Table, Valuación y Runway antes de reuniones. Presentar proyecciones bien fundamentadas demuestra madurez y aumenta credibilidad con VCs. Usar calculadoras y compartir resultados muestra profesionalismo.' 
        }
      },
      {
        id: 'builders-adv-q4',
        sectionId: 'builders-advanced',
        question: { 
          pt: 'Qual o timing ideal para postar projetos e vagas?', 
          en: 'What is the ideal timing to post projects and jobs?', 
          es: '¿Cuál es el momento ideal para publicar proyectos y vacantes?' 
        },
        answer: { 
          pt: 'Segundas e terças de manhã têm 2x mais visualizações. Evite postar sextas à tarde ou fins de semana. Atualize vagas abertas semanalmente para manter visibilidade no feed.', 
          en: 'Monday and Tuesday mornings have 2x more views. Avoid posting on Friday afternoons or weekends. Update open positions weekly to maintain visibility in the feed.', 
          es: 'Lunes y martes por la mañana tienen 2x más visualizaciones. Evita publicar viernes por la tarde o fines de semana. Actualiza las vacantes semanalmente para mantener visibilidad en el feed.' 
        }
      },
      {
        id: 'builders-adv-q5',
        sectionId: 'builders-advanced',
        question: { 
          pt: 'Como construir credibilidade na comunidade?', 
          en: 'How to build credibility in the community?', 
          es: '¿Cómo construir credibilidad en la comunidad?' 
        },
        answer: { 
          pt: 'Comente em projetos de outros founders. Compartilhe aprendizados e erros. Founders ativos e colaborativos recebem mais convites de conexão de Sellers qualificados. Participar constrói reputação.', 
          en: 'Comment on other founders projects. Share learnings and mistakes. Active and collaborative founders receive more connection invites from qualified Sellers. Participating builds reputation.', 
          es: 'Comenta en proyectos de otros founders. Comparte aprendizajes y errores. Los founders activos y colaborativos reciben más invitaciones de conexión de Sellers calificados. Participar construye reputación.' 
        }
      },
    ]
  },
  {
    id: 'sellers',
    title: { pt: 'Para Sellers', en: 'For Sellers', es: 'Para Sellers' },
    colorClass: 'text-emerald-500',
    iconType: 'trending',
    questions: [
      {
        id: 'sellers-q1',
        sectionId: 'sellers',
        question: { 
          pt: 'Como me posicionar como Seller na plataforma?', 
          en: 'How to position myself as a Seller on the platform?', 
          es: '¿Cómo posicionarme como Seller en la plataforma?' 
        },
        answer: { 
          pt: 'Ao criar seu perfil, selecione o arquétipo "Seller". Destaque experiências em vendas, marketing, growth ou operações comerciais. Mencione setores onde atuou e métricas de resultados. Builders buscam Sellers com track record comprovado.', 
          en: 'When creating your profile, select the "Seller" archetype. Highlight experiences in sales, marketing, growth or commercial operations. Mention industries you worked in and result metrics. Builders look for Sellers with proven track record.', 
          es: 'Al crear tu perfil, selecciona el arquetipo "Seller". Destaca experiencias en ventas, marketing, growth u operaciones comerciales. Menciona sectores donde trabajaste y métricas de resultados. Los Builders buscan Sellers con historial comprobado.' 
        }
      },
      {
        id: 'sellers-q2',
        sectionId: 'sellers',
        question: { 
          pt: 'Como encontrar startups para me juntar?', 
          en: 'How to find startups to join?', 
          es: '¿Cómo encontrar startups para unirme?' 
        },
        answer: { 
          pt: 'Use a seção "Startups" ou "Vagas" para explorar projetos com posições abertas. Filtre por estágio, setor ou tipo de vaga. Leia as descrições e candidate-se aos projetos que combinam com seu perfil e interesses.', 
          en: 'Use the "Startups" or "Jobs" section to explore projects with open positions. Filter by stage, sector or job type. Read descriptions and apply to projects that match your profile and interests.', 
          es: 'Usa la sección "Startups" o "Vacantes" para explorar proyectos con posiciones abiertas. Filtra por etapa, sector o tipo de vacante. Lee las descripciones y postúlate a los proyectos que coincidan con tu perfil e intereses.' 
        }
      },
      {
        id: 'sellers-q3',
        sectionId: 'sellers',
        question: { 
          pt: 'Como usar as ferramentas de vendas?', 
          en: 'How to use sales tools?', 
          es: '¿Cómo usar las herramientas de ventas?' 
        },
        answer: { 
          pt: 'Acesse a seção de Ferramentas. Encontre calculadoras de markup, simulador de taxas de cartão, calculadora de breakeven e gerador de propostas. Ideais para demonstrar seu conhecimento comercial e apoiar startups parceiras.', 
          en: 'Access the Tools section. Find markup calculators, card fee simulator, breakeven calculator and proposal generator. Ideal for demonstrating your commercial knowledge and supporting partner startups.', 
          es: 'Accede a la sección de Herramientas. Encuentra calculadoras de markup, simulador de tasas de tarjeta, calculadora de breakeven y generador de propuestas. Ideales para demostrar tu conocimiento comercial y apoyar startups socias.' 
        }
      },
      {
        id: 'sellers-q4',
        sectionId: 'sellers',
        question: { 
          pt: 'Como me candidatar a uma vaga?', 
          en: 'How to apply for a job?', 
          es: '¿Cómo postularme a una vacante?' 
        },
        answer: { 
          pt: 'Ao ver uma vaga interessante, clique em "Candidatar". Escreva uma mensagem personalizada explicando por que você é ideal para a posição. Você também pode incluir seu perfil do LinkedIn e telefone para facilitar o contato. O fundador receberá sua aplicação com todos esses dados e pode aceitar, recusar ou iniciar uma conversa.', 
          en: 'When you see an interesting job, click "Apply". Write a personalized message explaining why you are ideal for the position. You can also include your LinkedIn profile and phone to facilitate contact. The founder will receive your application with all this data and can accept, reject or start a conversation.', 
          es: 'Al ver una vacante interesante, haz clic en "Postularme". Escribe un mensaje personalizado explicando por qué eres ideal para la posición. También puedes incluir tu perfil de LinkedIn y teléfono para facilitar el contacto. El fundador recibirá tu solicitud con todos estos datos y puede aceptar, rechazar o iniciar una conversación.' 
        }
      },
      {
        id: 'sellers-q5',
        sectionId: 'sellers',
        question: { 
          pt: 'Como fazer networking eficiente?', 
          en: 'How to do efficient networking?', 
          es: '¿Cómo hacer networking eficiente?' 
        },
        answer: { 
          pt: 'Explore a Taverna diariamente. Envie convites de conexão para Builders com projetos interessantes. Seja específico na mensagem inicial sobre como você pode agregar. Participe de grupos de apresentação quando convidado.', 
          en: 'Explore the Tavern daily. Send connection requests to Builders with interesting projects. Be specific in the initial message about how you can add value. Participate in introduction groups when invited.', 
          es: 'Explora la Taberna diariamente. Envía solicitudes de conexión a Builders con proyectos interesantes. Sé específico en el mensaje inicial sobre cómo puedes agregar valor. Participa en grupos de presentación cuando te inviten.' 
        }
      },
      {
        id: 'sellers-q6',
        sectionId: 'sellers',
        question: { 
          pt: 'Como incluir meu LinkedIn e telefone na candidatura?', 
          en: 'How to include my LinkedIn and phone in the application?', 
          es: '¿Cómo incluir mi LinkedIn y teléfono en la postulación?' 
        },
        answer: { 
          pt: 'Ao se candidatar a uma vaga, você verá campos opcionais para LinkedIn e telefone. Preencher esses dados aumenta suas chances de ser contatado rapidamente pelo founder. O hiring manager verá essas informações junto com sua mensagem.', 
          en: 'When applying for a job, you will see optional fields for LinkedIn and phone. Filling in this data increases your chances of being contacted quickly by the founder. The hiring manager will see this information along with your message.', 
          es: 'Al postularte a una vacante, verás campos opcionales para LinkedIn y teléfono. Completar estos datos aumenta tus posibilidades de ser contactado rápidamente por el founder. El hiring manager verá esta información junto con tu mensaje.' 
        }
      },
    ]
  },
  {
    id: 'sellers-advanced',
    title: { pt: 'Dicas Avançadas para Sellers', en: 'Advanced Tips for Sellers', es: 'Consejos Avanzados para Sellers' },
    colorClass: 'text-emerald-500',
    iconType: 'lightbulb',
    questions: [
      {
        id: 'sellers-adv-q1',
        sectionId: 'sellers-advanced',
        question: { 
          pt: 'Como identificar startups com alto potencial?', 
          en: 'How to identify high potential startups?', 
          es: '¿Cómo identificar startups con alto potencial?' 
        },
        answer: { 
          pt: 'Procure projetos em estágio de tração (não apenas ideias). Analise se o founder tem histórico técnico sólido. Startups com MVPs lançados e primeiros clientes oferecem mais segurança e oportunidade real de crescimento.', 
          en: 'Look for projects in traction stage (not just ideas). Analyze if the founder has solid technical background. Startups with launched MVPs and first customers offer more security and real growth opportunity.', 
          es: 'Busca proyectos en etapa de tracción (no solo ideas). Analiza si el founder tiene historial técnico sólido. Startups con MVPs lanzados y primeros clientes ofrecen más seguridad y oportunidad real de crecimiento.' 
        }
      },
      {
        id: 'sellers-adv-q2',
        sectionId: 'sellers-advanced',
        question: { 
          pt: 'Como se destacar entre candidatos?', 
          en: 'How to stand out among candidates?', 
          es: '¿Cómo destacarse entre candidatos?' 
        },
        answer: { 
          pt: 'Na sua candidatura, mencione métricas específicas de resultados anteriores. "Aumentei vendas em 40%" é mais impactante que "experiência em vendas". Quantifique seu impacto sempre que possível.', 
          en: 'In your application, mention specific metrics of previous results. "I increased sales by 40%" is more impactful than "sales experience". Quantify your impact whenever possible.', 
          es: 'En tu postulación, menciona métricas específicas de resultados anteriores. "Aumenté las ventas en 40%" es más impactante que "experiencia en ventas". Cuantifica tu impacto siempre que sea posible.' 
        }
      },
      {
        id: 'sellers-adv-q3',
        sectionId: 'sellers-advanced',
        question: { 
          pt: 'Como demonstrar ROI ao abordar founders?', 
          en: 'How to demonstrate ROI when approaching founders?', 
          es: '¿Cómo demostrar ROI al abordar founders?' 
        },
        answer: { 
          pt: 'Proponha um plano de 30 dias com metas claras antes de discutir equity. Mostrar como você pode gerar resultados rápidos constrói confiança. Oferecer advisory antes de equity pode abrir portas.', 
          en: 'Propose a 30-day plan with clear goals before discussing equity. Showing how you can generate quick results builds trust. Offering advisory before equity can open doors.', 
          es: 'Propón un plan de 30 días con metas claras antes de discutir equity. Mostrar cómo puedes generar resultados rápidos construye confianza. Ofrecer advisory antes de equity puede abrir puertas.' 
        }
      },
      {
        id: 'sellers-adv-q4',
        sectionId: 'sellers-advanced',
        question: { 
          pt: 'Quando e como fazer follow-up?', 
          en: 'When and how to follow-up?', 
          es: '¿Cuándo y cómo hacer follow-up?' 
        },
        answer: { 
          pt: 'Espere 3 dias úteis após enviar convite. Um follow-up educado mostra interesse genuíno sem parecer insistente. Após 2 tentativas sem resposta, siga em frente para outras oportunidades.', 
          en: 'Wait 3 business days after sending invite. A polite follow-up shows genuine interest without seeming pushy. After 2 attempts without response, move on to other opportunities.', 
          es: 'Espera 3 días hábiles después de enviar invitación. Un follow-up educado muestra interés genuino sin parecer insistente. Después de 2 intentos sin respuesta, sigue adelante con otras oportunidades.' 
        }
      },
      {
        id: 'sellers-adv-q5',
        sectionId: 'sellers-advanced',
        question: { 
          pt: 'Como usar seu track record para negociar equity?', 
          en: 'How to use your track record to negotiate equity?', 
          es: '¿Cómo usar tu historial para negociar equity?' 
        },
        answer: { 
          pt: 'Documente resultados anteriores com prints e métricas. Sellers com histórico comprovado podem negociar entre 5-15% dependendo do estágio e contribuição esperada. Ter perfil de LinkedIn atualizado passa credibilidade.', 
          en: 'Document previous results with screenshots and metrics. Sellers with proven track record can negotiate between 5-15% depending on stage and expected contribution. Having updated LinkedIn profile adds credibility.', 
          es: 'Documenta resultados anteriores con capturas y métricas. Los Sellers con historial comprobado pueden negociar entre 5-15% dependiendo de la etapa y contribución esperada. Tener perfil de LinkedIn actualizado da credibilidad.' 
        }
      },
    ]
  },
  {
    id: 'investors',
    title: { pt: 'Para Investidores', en: 'For Investors', es: 'Para Inversores' },
    colorClass: 'text-violet-500',
    iconType: 'dollar',
    questions: [
      {
        id: 'investors-q1',
        sectionId: 'investors',
        question: { 
          pt: 'Como usar o Deal Flow?', 
          en: 'How to use Deal Flow?', 
          es: '¿Cómo usar el Deal Flow?' 
        },
        answer: { 
          pt: 'O Deal Flow é seu pipeline de investimentos. Salve founders interessantes clicando no ícone de bookmark. Organize por prioridade (alta, média, baixa), adicione tags personalizadas e anote observações. Ideal para acompanhar negociações.', 
          en: 'Deal Flow is your investment pipeline. Save interesting founders by clicking the bookmark icon. Organize by priority (high, medium, low), add custom tags and note observations. Ideal for tracking negotiations.', 
          es: 'Deal Flow es tu pipeline de inversiones. Guarda founders interesantes haciendo clic en el ícono de marcador. Organiza por prioridad (alta, media, baja), agrega tags personalizados y anota observaciones. Ideal para seguir negociaciones.' 
        }
      },
      {
        id: 'investors-q2',
        sectionId: 'investors',
        question: { 
          pt: 'Como filtrar founders para investir?', 
          en: 'How to filter founders to invest?', 
          es: '¿Cómo filtrar founders para invertir?' 
        },
        answer: { 
          pt: 'Na seção Capital, use filtros por estágio (pré-seed, seed, Series A), setor, localização e se estão captando. Analise perfis, projetos e métricas disponíveis antes de iniciar contato.', 
          en: 'In Capital section, use filters by stage (pre-seed, seed, Series A), sector, location and if they are raising. Analyze profiles, projects and available metrics before initiating contact.', 
          es: 'En la sección Capital, usa filtros por etapa (pre-seed, seed, Series A), sector, ubicación y si están levantando capital. Analiza perfiles, proyectos y métricas disponibles antes de iniciar contacto.' 
        }
      },
      {
        id: 'investors-q3',
        sectionId: 'investors',
        question: { 
          pt: 'Como entrar em contato com founders?', 
          en: 'How to contact founders?', 
          es: '¿Cómo contactar founders?' 
        },
        answer: { 
          pt: 'Após salvar um founder no Deal Flow, clique em "Mensagem" para iniciar conversa. Seja objetivo sobre seu interesse e tese de investimento. Founders apreciam feedback construtivo mesmo quando o investimento não acontece.', 
          en: 'After saving a founder in Deal Flow, click "Message" to start conversation. Be objective about your interest and investment thesis. Founders appreciate constructive feedback even when investment doesnt happen.', 
          es: 'Después de guardar un founder en Deal Flow, haz clic en "Mensaje" para iniciar conversación. Sé objetivo sobre tu interés y tesis de inversión. Los founders aprecian feedback constructivo incluso cuando la inversión no sucede.' 
        }
      },
      {
        id: 'investors-q4',
        sectionId: 'investors',
        question: { 
          pt: 'Como configurar meu perfil de investidor?', 
          en: 'How to configure my investor profile?', 
          es: '¿Cómo configurar mi perfil de inversor?' 
        },
        answer: { 
          pt: 'Em "Editar Perfil", selecione arquétipo "Investidor". Adicione tese de investimento, ticket médio, setores de interesse e portfolio de startups investidas. Perfis completos atraem mais founders qualificados.', 
          en: 'In "Edit Profile", select "Investor" archetype. Add investment thesis, average ticket, sectors of interest and invested startups portfolio. Complete profiles attract more qualified founders.', 
          es: 'En "Editar Perfil", selecciona arquetipo "Inversor". Agrega tesis de inversión, ticket promedio, sectores de interés y portafolio de startups invertidas. Los perfiles completos atraen más founders calificados.' 
        }
      },
      {
        id: 'investors-q5',
        sectionId: 'investors',
        question: { 
          pt: 'O que é o Tour do Investidor?', 
          en: 'What is the Investor Tour?', 
          es: '¿Qué es el Tour del Inversor?' 
        },
        answer: { 
          pt: 'O Tour é um guia interativo que apresenta todas as funcionalidades para investidores. Mostra como usar o Deal Flow, filtros de founders, sistema de mensagens e mais. Acesse pelo menu para fazer o tour completo.', 
          en: 'The Tour is an interactive guide that presents all features for investors. Shows how to use Deal Flow, founder filters, messaging system and more. Access through menu for the complete tour.', 
          es: 'El Tour es una guía interactiva que presenta todas las funcionalidades para inversores. Muestra cómo usar el Deal Flow, filtros de founders, sistema de mensajes y más. Accede desde el menú para el tour completo.' 
        }
      },
    ]
  },
  {
    id: 'investors-advanced',
    title: { pt: 'Dicas Avançadas para Investidores', en: 'Advanced Tips for Investors', es: 'Consejos Avanzados para Inversores' },
    colorClass: 'text-violet-500',
    iconType: 'lightbulb',
    questions: [
      {
        id: 'investors-adv-q1',
        sectionId: 'investors-advanced',
        question: { 
          pt: 'Como usar o Deal Flow para criar pipeline de qualidade?', 
          en: 'How to use Deal Flow to create quality pipeline?', 
          es: '¿Cómo usar Deal Flow para crear pipeline de calidad?' 
        },
        answer: { 
          pt: 'Salve deals regularmente e categorize por prioridade. Use tags para organizar por setor, estágio e ticket. Revisite semanalmente para acompanhar progresso. Tags no Deal Flow ajudam a manter pipeline organizado.', 
          en: 'Save deals regularly and categorize by priority. Use tags to organize by sector, stage and ticket. Review weekly to track progress. Tags in Deal Flow help keep pipeline organized.', 
          es: 'Guarda deals regularmente y categoriza por prioridad. Usa tags para organizar por sector, etapa y ticket. Revisa semanalmente para seguir el progreso. Los tags en Deal Flow ayudan a mantener el pipeline organizado.' 
        }
      },
      {
        id: 'investors-adv-q2',
        sectionId: 'investors-advanced',
        question: { 
          pt: 'Estratégias de sourcing passivo', 
          en: 'Passive sourcing strategies', 
          es: 'Estrategias de sourcing pasivo' 
        },
        answer: { 
          pt: 'Complete seu perfil com tese clara e ticket médio. Founders buscam investidores pelo filtro. Perfis com portfolio e tese detalhada recebem 3x mais inbound de founders qualificados.', 
          en: 'Complete your profile with clear thesis and average ticket. Founders search investors by filter. Profiles with portfolio and detailed thesis receive 3x more inbound from qualified founders.', 
          es: 'Completa tu perfil con tesis clara y ticket promedio. Los founders buscan inversores por filtro. Perfiles con portafolio y tesis detallada reciben 3x más inbound de founders calificados.' 
        }
      },
      {
        id: 'investors-adv-q3',
        sectionId: 'investors-advanced',
        question: { 
          pt: 'Como otimizar perfil para atrair deals qualificados?', 
          en: 'How to optimize profile to attract qualified deals?', 
          es: '¿Cómo optimizar perfil para atraer deals calificados?' 
        },
        answer: { 
          pt: 'Liste setores de interesse e estágios preferidos. Mencione startups investidas anteriormente. Seja claro sobre o que busca e o que oferece além de capital (mentoria, network, experiência).', 
          en: 'List sectors of interest and preferred stages. Mention previously invested startups. Be clear about what you seek and what you offer beyond capital (mentoring, network, experience).', 
          es: 'Lista sectores de interés y etapas preferidas. Menciona startups invertidas anteriormente. Sé claro sobre lo que buscas y lo que ofreces además de capital (mentoría, network, experiencia).' 
        }
      },
      {
        id: 'investors-adv-q4',
        sectionId: 'investors-advanced',
        question: { 
          pt: 'Técnicas de triagem rápida de founders', 
          en: 'Quick founder screening techniques', 
          es: 'Técnicas de evaluación rápida de founders' 
        },
        answer: { 
          pt: 'Analise: equipe técnica completa? Tem tração ou só ideia? Mercado grande o suficiente? Cap table limpo? Founders full-time? Estes filtros economizam tempo e focam em deals com potencial real.', 
          en: 'Analyze: complete technical team? Has traction or just idea? Market big enough? Clean cap table? Full-time founders? These filters save time and focus on deals with real potential.', 
          es: 'Analiza: ¿equipo técnico completo? ¿Tiene tracción o solo idea? ¿Mercado suficientemente grande? ¿Cap table limpio? ¿Founders full-time? Estos filtros ahorran tiempo y enfocan en deals con potencial real.' 
        }
      },
      {
        id: 'investors-adv-q5',
        sectionId: 'investors-advanced',
        question: { 
          pt: 'Como manter relacionamento com portfolio via plataforma?', 
          en: 'How to maintain relationship with portfolio via platform?', 
          es: '¿Cómo mantener relación con portafolio vía plataforma?' 
        },
        answer: { 
          pt: 'Use mensagens para check-ins mensais com founders investidos. Acompanhe atualizações de projetos. Estar presente fortalece o relacionamento, abre portas para follow-ons e gera referências.', 
          en: 'Use messages for monthly check-ins with invested founders. Follow project updates. Being present strengthens relationship, opens doors for follow-ons and generates referrals.', 
          es: 'Usa mensajes para check-ins mensuales con founders invertidos. Sigue las actualizaciones de proyectos. Estar presente fortalece la relación, abre puertas para follow-ons y genera referencias.' 
        }
      },
    ]
  },
  {
    id: 'premium',
    title: { pt: 'Recursos Premium', en: 'Premium Resources', es: 'Recursos Premium' },
    colorClass: 'text-amber-500',
    iconType: 'rocket',
    questions: [
      {
        id: 'premium-q1',
        sectionId: 'premium',
        question: { 
          pt: 'Quais são os benefícios premium?', 
          en: 'What are the premium benefits?', 
          es: '¿Cuáles son los beneficios premium?' 
        },
        answer: { 
          pt: 'Usuários premium têm conexões ilimitadas por dia, mensagens ilimitadas, acesso ao AI Matching (sugestões inteligentes de cofounders), visualização de quem viu seu perfil, e prioridade na listagem da Taverna.', 
          en: 'Premium users have unlimited connections per day, unlimited messages, access to AI Matching (smart cofounder suggestions), view who saw your profile, and priority listing in the Tavern.', 
          es: 'Los usuarios premium tienen conexiones ilimitadas por día, mensajes ilimitados, acceso al AI Matching (sugerencias inteligentes de cofounders), ver quién vio tu perfil y prioridad en la Taberna.' 
        }
      },
      {
        id: 'premium-q2',
        sectionId: 'premium',
        question: { 
          pt: 'Como funciona o AI Matching?', 
          en: 'How does AI Matching work?', 
          es: '¿Cómo funciona el AI Matching?' 
        },
        answer: { 
          pt: 'O AI Matching analisa seu perfil, skills e objetivos para sugerir cofounders complementares. Builders recebem sugestões de Sellers e vice-versa. O algoritmo considera compatibilidade de interesses e disponibilidade.', 
          en: 'AI Matching analyzes your profile, skills and goals to suggest complementary co-founders. Builders receive Seller suggestions and vice versa. The algorithm considers interest compatibility and availability.', 
          es: 'El AI Matching analiza tu perfil, habilidades y objetivos para sugerir cofounders complementarios. Los Builders reciben sugerencias de Sellers y viceversa. El algoritmo considera compatibilidad de intereses y disponibilidad.' 
        }
      },
      {
        id: 'premium-q3',
        sectionId: 'premium',
        question: { 
          pt: 'Como ver quem visualizou meu perfil?', 
          en: 'How to see who viewed my profile?', 
          es: '¿Cómo ver quién vio mi perfil?' 
        },
        answer: { 
          pt: 'Acesse "Quem Viu" no menu. Veja a lista de usuários que visitaram seu perfil nos últimos dias. Útil para identificar interesse e iniciar conversas com quem já demonstrou curiosidade sobre você.', 
          en: 'Access "Who Viewed" in the menu. See the list of users who visited your profile in recent days. Useful for identifying interest and starting conversations with those who already showed curiosity about you.', 
          es: 'Accede a "Quién Vio" en el menú. Ve la lista de usuarios que visitaron tu perfil en los últimos días. Útil para identificar interés e iniciar conversaciones con quienes ya mostraron curiosidad sobre ti.' 
        }
      },
      {
        id: 'premium-q4',
        sectionId: 'premium',
        question: { 
          pt: 'Como comparar os planos?', 
          en: 'How to compare plans?', 
          es: '¿Cómo comparar los planes?' 
        },
        answer: { 
          pt: 'Vá em "Preços" no menu principal. Compare recursos de cada plano: Free, Adventurer, Founder e Alpha. Veja limites de conexões, mensagens, projetos e recursos exclusivos de cada nível.', 
          en: 'Go to "Pricing" in the main menu. Compare features of each plan: Free, Adventurer, Founder and Alpha. See connection limits, messages, projects and exclusive features of each level.', 
          es: 'Ve a "Precios" en el menú principal. Compara características de cada plan: Free, Adventurer, Founder y Alpha. Ve límites de conexiones, mensajes, proyectos y características exclusivas de cada nivel.' 
        }
      },
    ]
  },
  {
    id: 'tools',
    title: { pt: 'Ferramentas Essenciais', en: 'Essential Tools', es: 'Herramientas Esenciales' },
    colorClass: 'text-blue-500',
    iconType: 'wrench',
    questions: [
      {
        id: 'tools-q1',
        sectionId: 'tools',
        question: { 
          pt: 'Calculadora de Equity', 
          en: 'Equity Calculator', 
          es: 'Calculadora de Equity' 
        },
        answer: { 
          pt: 'Simule divisão de equity entre cofounders. Considere fatores como dedicação, investimento, experiência e contribuição. Gera um relatório com sugestão de split justo baseado em práticas de mercado.', 
          en: 'Simulate equity split between co-founders. Consider factors like dedication, investment, experience and contribution. Generates a report with fair split suggestion based on market practices.', 
          es: 'Simula división de equity entre cofounders. Considera factores como dedicación, inversión, experiencia y contribución. Genera un informe con sugerencia de división justa basada en prácticas de mercado.' 
        }
      },
      {
        id: 'tools-q2',
        sectionId: 'tools',
        question: { 
          pt: 'Simulador de Cap Table', 
          en: 'Cap Table Simulator', 
          es: 'Simulador de Cap Table' 
        },
        answer: { 
          pt: 'Visualize como rodadas de investimento afetam a participação de cada sócio. Adicione rodadas, investidores e veja a diluição em tempo real. Essencial para negociações com VCs.', 
          en: 'Visualize how investment rounds affect each partners stake. Add rounds, investors and see dilution in real time. Essential for VC negotiations.', 
          es: 'Visualiza cómo las rondas de inversión afectan la participación de cada socio. Agrega rondas, inversores y ve la dilución en tiempo real. Esencial para negociaciones con VCs.' 
        }
      },
      {
        id: 'tools-q3',
        sectionId: 'tools',
        question: { 
          pt: 'Calculadora de Valuation', 
          en: 'Valuation Calculator', 
          es: 'Calculadora de Valuación' 
        },
        answer: { 
          pt: 'Estime o valor da sua startup usando múltiplos métodos: múltiplos de receita, comparáveis de mercado e DCF simplificado. Compare cenários conservador, base e otimista.', 
          en: 'Estimate your startup value using multiple methods: revenue multiples, market comparables and simplified DCF. Compare conservative, base and optimistic scenarios.', 
          es: 'Estima el valor de tu startup usando múltiples métodos: múltiplos de ingresos, comparables de mercado y DCF simplificado. Compara escenarios conservador, base y optimista.' 
        }
      },
      {
        id: 'tools-q4',
        sectionId: 'tools',
        question: { 
          pt: 'Gerador de Contratos', 
          en: 'Contract Generator', 
          es: 'Generador de Contratos' 
        },
        answer: { 
          pt: 'Crie contratos de vesting, NDA, acordo de cofounders e outros documentos jurídicos básicos. Personalize cláusulas e baixe em formato editável. Para uso educacional - sempre consulte um advogado.', 
          en: 'Create vesting contracts, NDA, co-founder agreements and other basic legal documents. Customize clauses and download in editable format. For educational use - always consult a lawyer.', 
          es: 'Crea contratos de vesting, NDA, acuerdo de cofounders y otros documentos legales básicos. Personaliza cláusulas y descarga en formato editable. Para uso educativo - siempre consulta a un abogado.' 
        }
      },
      {
        id: 'tools-q5',
        sectionId: 'tools',
        question: { 
          pt: 'Calculadora de Runway', 
          en: 'Runway Calculator', 
          es: 'Calculadora de Runway' 
        },
        answer: { 
          pt: 'Calcule quanto tempo sua startup sobrevive com o caixa atual. Insira despesas mensais e receitas projetadas. Identifique quando precisa captar ou cortar custos.', 
          en: 'Calculate how long your startup survives with current cash. Enter monthly expenses and projected revenue. Identify when you need to raise or cut costs.', 
          es: 'Calcula cuánto tiempo sobrevive tu startup con el efectivo actual. Ingresa gastos mensuales e ingresos proyectados. Identifica cuándo necesitas levantar capital o cortar costos.' 
        }
      },
    ]
  },
  {
    id: 'general',
    title: { pt: 'Perguntas Frequentes', en: 'Frequently Asked Questions', es: 'Preguntas Frecuentes' },
    colorClass: 'text-muted-foreground',
    iconType: 'message',
    questions: [
      {
        id: 'general-q1',
        sectionId: 'general',
        question: { 
          pt: 'Como funciona a conexão?', 
          en: 'How does connection work?', 
          es: '¿Cómo funciona la conexión?' 
        },
        answer: { 
          pt: 'Envie um convite de conexão. Se aceito, vocês podem trocar mensagens ilimitadas. Convites expiram após 7 dias sem resposta. Você pode cancelar convites pendentes e gerenciar conexões na seção "Conexões".', 
          en: 'Send a connection request. If accepted, you can exchange unlimited messages. Requests expire after 7 days without response. You can cancel pending requests and manage connections in the "Connections" section.', 
          es: 'Envía una solicitud de conexión. Si es aceptada, pueden intercambiar mensajes ilimitados. Las solicitudes expiran después de 7 días sin respuesta. Puedes cancelar solicitudes pendientes y gestionar conexiones en la sección "Conexiones".' 
        }
      },
      {
        id: 'general-q2',
        sectionId: 'general',
        question: { 
          pt: 'Como denunciar um usuário?', 
          en: 'How to report a user?', 
          es: '¿Cómo denunciar un usuario?' 
        },
        answer: { 
          pt: 'No perfil do usuário, clique nos três pontos e selecione "Denunciar". Descreva o motivo: spam, assédio, perfil falso ou outro comportamento inadequado. Nossa equipe analisa todas as denúncias em até 48 horas.', 
          en: 'On the user profile, click the three dots and select "Report". Describe the reason: spam, harassment, fake profile or other inappropriate behavior. Our team analyzes all reports within 48 hours.', 
          es: 'En el perfil del usuario, haz clic en los tres puntos y selecciona "Denunciar". Describe el motivo: spam, acoso, perfil falso u otro comportamiento inapropiado. Nuestro equipo analiza todas las denuncias en 48 horas.' 
        }
      },
      {
        id: 'general-q3',
        sectionId: 'general',
        question: { 
          pt: 'Como deletar minha conta?', 
          en: 'How to delete my account?', 
          es: '¿Cómo eliminar mi cuenta?' 
        },
        answer: { 
          pt: 'Vá em "Configurações" e depois "Conta". Clique em "Deletar Conta" e confirme. Seus dados serão removidos em até 30 dias conforme nossa política de privacidade. Esta ação é irreversível.', 
          en: 'Go to "Settings" then "Account". Click "Delete Account" and confirm. Your data will be removed within 30 days according to our privacy policy. This action is irreversible.', 
          es: 'Ve a "Configuración" y luego "Cuenta". Haz clic en "Eliminar Cuenta" y confirma. Tus datos serán eliminados en hasta 30 días según nuestra política de privacidad. Esta acción es irreversible.' 
        }
      },
      {
        id: 'general-q4',
        sectionId: 'general',
        question: { 
          pt: 'Como entrar em contato com o suporte?', 
          en: 'How to contact support?', 
          es: '¿Cómo contactar soporte?' 
        },
        answer: { 
          pt: 'Use o e-mail contato@guilda.app.br ou a comunidade no Discord. Tempo médio de resposta: 24 horas em dias úteis. Para bugs urgentes, descreva o problema com prints se possível.', 
          en: 'Use email contato@guilda.app.br or the Discord community. Average response time: 24 hours on business days. For urgent bugs, describe the problem with screenshots if possible.', 
          es: 'Usa el email contato@guilda.app.br o la comunidad de Discord. Tiempo promedio de respuesta: 24 horas en días hábiles. Para bugs urgentes, describe el problema con capturas si es posible.' 
        }
      },
      {
        id: 'general-q5',
        sectionId: 'general',
        question: { 
          pt: 'A plataforma é segura?', 
          en: 'Is the platform secure?', 
          es: '¿La plataforma es segura?' 
        },
        answer: { 
          pt: 'Sim. Usamos criptografia de ponta a ponta para mensagens, autenticação segura e políticas rigorosas de privacidade. Nunca compartilhamos seus dados com terceiros sem consentimento. Suas informações de contato são protegidas.', 
          en: 'Yes. We use end-to-end encryption for messages, secure authentication and strict privacy policies. We never share your data with third parties without consent. Your contact information is protected.', 
          es: 'Sí. Usamos cifrado de extremo a extremo para mensajes, autenticación segura y políticas estrictas de privacidad. Nunca compartimos tus datos con terceros sin consentimiento. Tu información de contacto está protegida.' 
        }
      },
    ]
  },
];

// Helper to get all FAQ questions in flat array
export function getAllFAQQuestions(): FAQQuestionData[] {
  return faqSectionsData.flatMap(section => section.questions);
}
