import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { fadeUp, fadeX, scrollViewport, smoothEase } from "@/lib/scroll-animations";

const faqs = [
  {
    question: "Quanto custa a aceleração?",
    answer: "O programa está incluso no plano Founder (R$ 899,90/semestre). Não cobramos taxa extra, equity ou success fee.",
  },
  {
    question: "Qual a duração exata do programa?",
    answer: "São 15 dias corridos de trabalho intensivo. Esperamos que você dedique pelo menos 2 horas por dia ao programa, entre tarefas, mentorias e execução.",
  },
  {
    question: "Como funcionam os mentores de IA?",
    answer: "O programa conta com dois agentes de IA especializados. O **Guilda Commander** acompanha você durante os 15 dias, avaliando cada entrega diária e garantindo que você não avance com trabalho medíocre — ele aprova ou bloqueia seu progresso. Já o **Guilda Pivoter** entra após O Veredito (Dia 15) para analisar toda sua trajetória e sugerir otimizações rápidas ou mudanças radicais baseadas em dados reais, gerando até 7 ideias de pivot com plano de execução.",
  },
  {
    question: "Preciso ter uma ideia pronta?",
    answer: "Não necessariamente. Se você é um Builder, pode se juntar a um Seller que já tem uma ideia validada. Se você é um Seller com uma ideia, encontraremos um Builder para executar. O importante é estar disposto a agir.",
  },
  {
    question: "Como funciona a divisão de equity?",
    answer: "Recomendamos uma divisão 50/50 entre Builder e Seller, com vesting de 4 anos e cliff de 1 ano. Mas vocês têm autonomia para negociar os termos da parceria.",
  },
  {
    question: "Posso participar de qualquer lugar?",
    answer: "Sim! O programa é 100% remoto. Temos participantes de todo o Brasil e alguns de fora também. As mentorias são online e o grupo se comunica por WhatsApp/Discord.",
  },
  {
    question: "O que acontece se meu projeto 'morrer'?",
    answer: "Isso é um resultado válido e valioso. Matar uma ideia ruim cedo economiza meses de trabalho e dinheiro. Você sai com aprendizados reais, uma rede de contatos, e pode tentar novamente no próximo cohort com uma ideia melhor.",
  },
  {
    question: "Como é o processo de seleção?",
    answer: "Analisamos sua aplicação com base em: clareza de propósito, disponibilidade de tempo, e fit com o programa. Não buscamos as 'melhores ideias', buscamos os founders mais comprometidos.",
  },
  {
    question: "Posso participar se já tenho um co-fundador?",
    answer: "Sim! Duplas já formadas são bem-vindas. Vocês passarão pelo programa juntos e podem pular a fase de matching.",
  },
];

const DoOrDieFAQ = () => {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-background" />
      
      <div className="max-w-3xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          {...fadeUp(20, 0)}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border mb-6">
            <HelpCircle className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Tire suas Dúvidas
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Perguntas <span className="text-primary">Frequentes</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Tudo que você precisa saber antes de se inscrever.
          </p>
        </motion.div>

        {/* FAQ Accordion - staggered items */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={scrollViewport}
              transition={{ duration: 0.7, delay: 0.05 + index * 0.07, ease: smoothEase }}
              style={{ willChange: 'transform, opacity' }}
            >
              <AccordionItem 
                value={`item-${index}`}
                className="glass-card border border-border rounded-xl px-6 data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="text-left text-foreground hover:text-primary hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default DoOrDieFAQ;
