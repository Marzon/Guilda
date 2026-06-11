import { motion } from "framer-motion";
import { Swords, Brain, Zap, ShieldCheck } from "lucide-react";

const FEATURES = [
{
  icon: Brain,
  title: "Match inteligente",
  description: "Algoritmo que conecta por habilidades complementares, não por sorte."
},
{
  icon: Zap,
  title: "Aceleração em 15 dias",
  description: "Do match ao MVP validado com mentor, método e deadline real."
},
{
  icon: ShieldCheck,
  title: "Founders validados",
  description: "Perfis verificados com portfólio, disponibilidade e skin in the game."
}];


const LP2DarkCTA = () => {
  return (
    <section>
      <div
        className="relative overflow-visible"
        style={{
          background: "#0A0B24",
          borderRadius: "var(--lp2-radius-section)",
          padding: "80px 24px 72px"
        }}>
        
        {/* Ambient glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(118,16,220,0.15) 0%, transparent 70%)"
          }} />
        

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Badge icon */}
          <motion.div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 72,
              height: 72,
              background: "#7610DC",
              boxShadow: "0 0 24px rgba(118,16,220,0.5)"
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}>
            
            <Swords size={32} className="text-white" />
          </motion.div>

          {/* Headline */}
          <motion.h2
            className="text-[28px] tracking-tight text-white mt-6 max-w-[600px] font-serif font-thin md:text-6xl text-center"
            style={{ lineHeight: 0.85 }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}>
            A <span className="italic" style={{ color: "#A728EB" }}>Guilda</span> vai mudar
            <br />
            como você busca
            <br />
            seu sócio
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            className="font-sans text-[15px] leading-relaxed mt-4 max-w-[480px]"
            style={{ color: "rgba(255,255,255,0.65)" }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}>
            
            Não é networking genérico. É uma máquina de formar duplas de co-fundadores com método, dados e compromisso real.
          </motion.p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10 w-full max-w-[680px]">
            {FEATURES.map(({ icon: Icon, title, description }, i) =>
            <motion.div
              key={title}
              className="flex flex-col items-center text-center gap-2"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 * i }}>
              
                <Icon size={24} style={{ color: "#F97316" }} />
                <span className="font-telegraf font-bold text-sm text-white">{title}</span>
                <span className="font-sans" style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
                  {description}
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>);

};

export default LP2DarkCTA;