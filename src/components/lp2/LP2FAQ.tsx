import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FAQ_ITEMS = [
{
  q: "A Guilda é gratuita?",
  a: "Sim. Criar seu perfil e fazer matches na plataforma é 100% gratuito. A Aceleração Guilda é um programa pago com vagas limitadas por cohort — mas você só entra se quiser."
},
{
  q: "Preciso ter uma ideia de startup para entrar?",
  a: "Não necessariamente. Builders podem entrar com uma ideia em andamento ou apenas querendo encontrar um sócio Seller para explorar oportunidades juntos. Sellers podem entrar sem ideia nenhuma — o match pode vir de um Builder que já tem um MVP esperando por alguém de negócios."
},
{
  q: "Qual a diferença entre Builder e Seller?",
  a: "Builders são quem constroem o produto: devs, engenheiros, PMs, designers técnicos. Sellers são quem fazem o negócio crescer: vendas, marketing, growth, operações, CS. A Guilda conecta esses dois perfis porque startups que têm os dois desde o início têm muito mais chance de decolar."
},
{
  q: "Como funciona o matching?",
  a: "O algoritmo analisa seu portfólio, disponibilidade, tipo de startup que quer construir e compatibilidade de perfil. Não é matching por currículo bonito — é por o que você já fez e como você quer trabalhar."
},
{
  q: "E se eu não me conectar bem com o meu match?",
  a: "Você pode passar para o próximo. Não tem compromisso até vocês decidirem avançar juntos. A plataforma continua mostrando outros perfis compatíveis."
},
{
  q: "A Guilda é só para quem quer criar startup do zero?",
  a: "Principalmente sim — o foco é early-stage. Mas se você já tem um produto e precisa de um co-founder para escalar, também faz sentido entrar."
}];


const LP2FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section>
      <div className="mx-auto" style={{ maxWidth: 760 }}>
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <span
            className="inline-block mb-5 font-bold uppercase"
            style={{
              background: "#EDE0FF",
              color: "#7610DC",
              fontFamily: "Montserrat, sans-serif",
              fontSize: 12,
              borderRadius: 100,
              padding: "6px 16px"
            }}>
            
            Dúvidas frequentes
          </span>

          <h2
            className="font-serif font-thin text-6xl"
            style={{
              fontSize: "clamp(36px, 5vw, 56px)",
              color: "#0A0B24",
              lineHeight: 0.95,
              letterSpacing: "-0.02em"
              }}>Tudo que você precisa <br />saber antes de entrar</h2>

          <p
            className="mt-3"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: 15,
              color: "#3D3D5C"
            }}>
            
            Ainda ficou alguma dúvida?<br className="md:hidden" />{" "}
            <a
              href="#"
              style={{
                color: "#7610DC",
                textDecoration: "underline",
                textUnderlineOffset: 3
              }}>
              
              Fala com a gente
            </a>
            .
          </p>
        </div>

        {/* Accordion */}
        <div className="flex flex-col gap-2">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="bg-white cursor-pointer"
                style={{
                  border: `1px solid ${isOpen ? "#7610DC" : "#E4D9F5"}`,
                  borderRadius: 12,
                  padding: "20px 24px",
                  boxShadow: isOpen ?
                  "0 4px 16px rgba(118,16,220,0.08)" :
                  "none",
                  transition: "border-color 0.2s, box-shadow 0.2s"
                }}
                onClick={() => toggle(i)}>
                
                <div className="flex items-center justify-between gap-4">
                  <span
                    className="font-telegraf font-bold"
                    style={{ fontSize: 16, color: "#0A0B24" }}>
                    
                    {item.q}
                  </span>
                  <ChevronDown
                    size={20}
                    style={{
                      color: "#7610DC",
                      flexShrink: 0,
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease-in-out"
                    }} />
                  
                </div>

                <AnimatePresence initial={false}>
                  {isOpen &&
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}>
                    
                      <p
                      className="mt-3 pt-3"
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: 15,
                        color: "#3D3D5C",
                        lineHeight: 1.6,
                        borderTop: "1px solid #E4D9F5"
                      }}>
                      
                        {item.a}
                      </p>
                    </motion.div>
                  }
                </AnimatePresence>
              </div>);

          })}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center mt-10">
          <a
            href="https://suprema.guilda.app.br/auth?view=signup"
            className="font-bold text-white transition-colors hover:opacity-90 no-underline"
            style={{
              background: "#7610DC",
              borderRadius: 100,
              padding: "14px 32px",
              fontFamily: "Montserrat, sans-serif",
              fontSize: 16,
              display: "inline-block",
            }}>
            Criar meu perfil grátis
          </a>
          <span
            className="mt-3"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: 13,
              color: "#8A8AA8"
            }}>
            
            Sem cartão de crédito. Sem compromisso.
          </span>
        </div>
      </div>
    </section>);

};

export default LP2FAQ;