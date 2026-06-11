import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import guildaLogo from "@/assets/logos/guilda-logo-full.webp";

const AceleracaoThankYou = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Inscrição Confirmada | Guilda</title>
        <meta name="description" content="Sua inscrição na aceleração foi recebida. Entraremos em contato com os próximos passos." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-[#FFFBF7] text-[#0A0B24] flex flex-col">
        {/* Simple navbar */}
        <header className="w-full border-b border-[#E5E0DB] bg-[#FFFBF7]/90 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <button onClick={() => navigate("/")} className="flex items-center gap-2">
              <img src={guildaLogo} alt="Guilda" className="h-7 w-auto" />
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/aceleracao")}
              className="text-[#0A0B24]/60 hover:text-[#0A0B24] text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <motion.div
            className="max-w-lg w-full text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-8"
            >
              <div className="w-20 h-20 rounded-full bg-[#7610DC]/10 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-[#7610DC]" />
              </div>
            </motion.div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] mb-4" style={{ fontFamily: "'Merriweather', serif", fontWeight: 100 }}>
              Inscrição recebida!
            </h1>

            <p className="text-lg text-[#0A0B24]/70 leading-relaxed mb-3">
              Obrigado pelo seu interesse na aceleração da Guilda.
            </p>

            <p className="text-base text-[#0A0B24]/60 leading-relaxed mb-10">
              Nossa equipe vai analisar sua inscrição e entrar em contato pelo WhatsApp com os próximos passos. Fique de olho nas suas mensagens!
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={() => { window.location.href = "https://suprema.guilda.app.br/pro"; }}
                className="bg-[#7610DC] hover:bg-[#5A0CB0] text-white px-8 py-3 h-auto rounded-xl text-base font-medium"
              >
                Conhecer a Guilda
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/aceleracao")}
                className="border-[#0A0B24]/15 text-[#0A0B24]/70 hover:bg-[#0A0B24]/5 px-8 py-3 h-auto rounded-xl text-base"
              >
                Voltar à página
              </Button>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-12 flex items-center justify-center gap-2 text-sm text-[#0A0B24]/40"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Responderemos em até 24h úteis</span>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default AceleracaoThankYou;
