import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Download, Share2 } from "lucide-react";
import { RadarChart } from "./RadarChart";
import { supabase } from "@/integrations/supabase/client";
import { deriveTipo } from "@/data/quizData";
import type { ArchetypeData } from "@/data/quizData";

const STORAGE_BASE = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/quiz-reports`;

interface QuizResultProps {
  archetypeKey: string;
  archetype: ArchetypeData;
  radarDims: number[];
  scoreX: number;
  scoreY: number;
  leadQuality: string;
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.2 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function QuizResult({
  archetypeKey,
  archetype,
  radarDims,
  scoreX,
  scoreY,
  leadQuality,
}: QuizResultProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    const checkShare = async () => {
      if (navigator.share && navigator.canShare) {
        try {
          const testFile = new File([new Uint8Array(1)], "test.png", { type: "image/png" });
          setCanNativeShare(navigator.canShare({ files: [testFile] }));
        } catch {
          setCanNativeShare(false);
        }
      }
    };
    checkShare();
  }, []);

  const imageUrl = `${STORAGE_BASE}/og-${archetypeKey}.png`;

  const handleShare = (platform: "linkedin" | "whatsapp") => {
    const quizUrl = `https://guilda.app.br/quiz-empreendedor?utm_source=share&utm_medium=${platform}&utm_campaign=quiz-empreendedor`;

    if (platform === "linkedin") {
      const text = `Fiz o quiz de arquétipo de empreendedor da Guilda e sou: ${archetype.name}! 🎮\n\n"${archetype.tagline}"\n\nDescubra qual é o seu perfil empreendedor:\n${quizUrl}`;
      window.open(
        `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`,
        "_blank"
      );
    } else {
      const text = `Fiz o quiz de arquétipo de empreendedor da Guilda e sou: ${archetype.name}! "${archetype.tagline}" — Descubra o seu: ${quizUrl}`;
      window.open(
        `https://wa.me/?text=${encodeURIComponent(text)}`,
        "_blank"
      );
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Meu Arquétipo - ${archetype.name}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(imageUrl, "_blank");
    }
  };

  const handleDownloadPDF = async () => {
    const pdfUrl = `${STORAGE_BASE}/relatorio-${archetypeKey}.pdf`;
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Meu Arquétipo - ${archetype.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(pdfUrl, "_blank");
    }
  };

  const handleNativeShare = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `meu-arquetipo-${archetypeKey}.png`, { type: "image/png" });
      const quizUrl = `https://guilda.app.br/quiz-empreendedor?utm_source=share&utm_medium=native&utm_campaign=quiz-empreendedor`;

      await navigator.share({
        title: `Sou ${archetype.name}!`,
        text: `Fiz o quiz da Guilda e sou: ${archetype.name}! "${archetype.tagline}" — Descubra o seu: ${quizUrl}`,
        files: [file],
      });
    } catch (err) {
      console.log("Share cancelled or not supported");
    }
  };

  const handleSubmit = async () => {
    if (!email) return;
    setSubmitting(true);
    const tipo = deriveTipo(archetypeKey, scoreX);
    const params = new URLSearchParams(window.location.search);
    const leadData = {
      email,
      tipo,
      arquetipo: archetypeKey,
      lead_quality: leadQuality,
      score_x: scoreX,
      score_y: scoreY,
      utm_source: params.get("utm_source") || null,
      utm_medium: params.get("utm_medium") || null,
      utm_campaign: params.get("utm_campaign") || null,
    };
    await supabase.from("quiz_leads" as any).insert(leadData as any);

    // Sync to Brevo in background (don't block UX)
    supabase.functions.invoke("sync-lead-to-brevo", {
      body: { ...leadData, source: "quiz_leads" },
    }).catch((err) => console.error("Brevo sync error:", err));

    // Send archetype email via edge function (fire and forget)
    supabase.functions.invoke("send-quiz-email", {
      body: { email, arquetipo: archetypeKey },
    }).catch((err) => console.error("Email send error:", err));

    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="w-full px-4 md:px-6 pb-16 flex flex-col gap-6"
    >
      {/* Block 1 — Reveal */}
      <motion.div variants={fadeUp} className="text-center pt-8">
        <span className="text-[56px] block mb-3">{archetype.emoji}</span>
        <span
          className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
          style={{ backgroundColor: `${archetype.color}22`, color: archetype.color, border: `1px solid ${archetype.color}44` }}
        >
          Seu Arquétipo
        </span>
        <h1 className="text-[28px] md:text-[32px] font-bold text-white mb-2">
          {archetype.name}
        </h1>
        <p className="italic text-base" style={{ color: archetype.color }}>
          {archetype.tagline}
        </p>
      </motion.div>

      {/* Block 2 — Radar */}
      <motion.div variants={fadeUp} className="bg-[#1A1230] rounded-2xl p-5 border border-[#2A1F3D]">
        <RadarChart values={radarDims} color={archetype.color} />
      </motion.div>

      {/* Block 3 — Description */}
      <motion.div variants={fadeUp} className="bg-[#1A1230] rounded-2xl p-5 border border-[#2A1F3D]">
        <p className="text-[#C4B5D9] text-sm leading-relaxed">{archetype.description}</p>
      </motion.div>

      {/* Block 4 — Strengths */}
      <motion.div variants={fadeUp} className="bg-[#1A1230] rounded-2xl p-5 border border-[#2A1F3D]">
        <h3 className="text-white font-bold text-base mb-3">Suas forças</h3>
        <ul className="flex flex-col gap-2">
          {archetype.strengths.map((s, i) => (
            <li key={i} className="text-[#C4B5D9] text-sm flex items-start gap-2">
              <span style={{ color: archetype.color }} className="flex-shrink-0">✦</span>
              {s}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Block 5 — Blind spot */}
      <motion.div variants={fadeUp} className="bg-[#2A1520] rounded-2xl p-5 border-l-4 border-[#F97316]">
        <h3 className="text-[#F97316] font-bold text-base mb-2">⚠️ Seu ponto cego</h3>
        <p className="text-[#C4B5D9] text-sm leading-relaxed">{archetype.blindSpot}</p>
      </motion.div>

      {/* Block 6 — Ideal match */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl p-5 border border-[#7610DC44]"
        style={{ background: "linear-gradient(135deg, #7610DC11, #F9731611)" }}
      >
        <h3 className="text-white font-bold text-base mb-2">Seu cofundador ideal</h3>
        <p className="text-lg font-bold mb-2" style={{ color: archetype.color }}>
          {archetype.idealMatch}
        </p>
        <p className="text-[#C4B5D9] text-sm italic">{archetype.advice}</p>
      </motion.div>

      {/* Block 7 — Share */}
      <motion.div variants={fadeUp} className="flex flex-col gap-3">
        {canNativeShare ? (
          /* Mobile: native share + download */
          <div className="flex gap-3">
            <button
              onClick={handleNativeShare}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm bg-[#7610DC] hover:bg-[#4308B0] transition-transform hover:scale-[1.02]"
            >
              <Share2 size={18} />
              Compartilhar
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm border border-[#3D2E5A] bg-[#1A1230] hover:bg-[#2A1F3D] transition-transform hover:scale-[1.02]"
            >
              <Download size={18} />
              Baixar imagem
            </button>
          </div>
        ) : (
          /* Desktop: LinkedIn + WhatsApp + download */
          <>
            <div className="flex gap-3">
              <button
                onClick={() => handleShare("linkedin")}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm bg-[#0A66C2] hover:bg-[#004182] transition-transform hover:scale-[1.02]"
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M20.47 2H3.53A1.45 1.45 0 002 3.47v17.06A1.45 1.45 0 003.47 22h17.06A1.45 1.45 0 0022 20.53V3.47A1.45 1.45 0 0020.47 2zM8.09 18.74h-3v-9h3v9zM6.59 8.48a1.56 1.56 0 110-3.12 1.56 1.56 0 010 3.12zm12.32 10.26h-3v-4.83c0-1.21-.43-2-1.52-2A1.65 1.65 0 0012.85 13a2 2 0 00-.1.73v5h-3v-9h3v1.2a3 3 0 012.71-1.5c2 0 3.45 1.29 3.45 4.06v5.25z"/></svg>
                LinkedIn
              </button>
              <button
                onClick={() => handleShare("whatsapp")}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm bg-[#25D366] hover:bg-[#1DA851] transition-transform hover:scale-[1.02]"
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.14-.67.15-.2.29-.77.97-.95 1.17-.17.2-.35.22-.65.07a8.2 8.2 0 01-2.41-1.49 9.06 9.06 0 01-1.67-2.08c-.17-.3 0-.46.13-.6.14-.14.3-.35.44-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.52-.07-.15-.66-1.6-.91-2.2-.24-.57-.48-.5-.67-.5h-.57a1.1 1.1 0 00-.8.38A3.37 3.37 0 006.6 8.9a5.84 5.84 0 001.22 3.1 13.4 13.4 0 005.12 4.52c.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.76-.72 2.01-1.41.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.34zm-5.42 7.4a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37A9.87 9.87 0 0112.05 2.1a9.87 9.87 0 019.9 9.87 9.87 9.87 0 01-9.9 9.82zM12.05 0A11.94 11.94 0 001.06 17.9L0 24l6.3-1.65A11.94 11.94 0 0024 12 11.94 11.94 0 0012.05 0z"/></svg>
                WhatsApp
              </button>
            </div>
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm border border-[#3D2E5A] bg-[#1A1230] hover:bg-[#2A1F3D] transition-transform hover:scale-[1.02]"
            >
              <Download size={18} />
              Baixar meu arquétipo
            </button>
          </>
        )}
      </motion.div>

      {/* Block 8 — Lead capture */}
      <motion.div variants={fadeUp} className="bg-[#1A1230] rounded-2xl p-5 border border-[#7610DC33]">
        {submitted ? (
          <div className="text-center py-4">
            <p className="text-white font-bold text-base">✅ Relatório enviado!</p>
            <p className="text-[#8B7BA0] text-sm mt-1">Verifique seu email.</p>
            <button
              onClick={handleDownloadPDF}
              className="inline-block mt-4 bg-[#F97316] hover:bg-[#EA680C] text-white font-bold text-sm rounded-xl px-6 py-3 transition-all cursor-pointer"
            >
              Baixar PDF agora →
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-white font-bold text-[17px] mb-1">Quer o relatório completo?</h3>
            <p className="text-[#8B7BA0] text-sm mb-4">
              Análise detalhada + guia "Como Encontrar o Cofundador Ideal" no seu email.
            </p>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-3 px-4 py-3 rounded-xl bg-[#2A1F3D] border border-[#3D2E5A] text-white placeholder-[#6B5B80] text-sm focus:outline-none focus:border-[#7610DC]"
            />
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3 rounded-xl font-bold text-white text-sm bg-[#F97316] hover:bg-[#EA680C] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? "Enviando..." : "Receber Meu Relatório →"}
            </button>
            <p className="text-[#6B5B80] text-xs text-center mt-3">
              Sem spam. Só conteúdo que te ajuda a lançar.
            </p>
          </>
        )}
      </motion.div>

      {/* Block 9 — CTA Guilda */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl p-6 text-center"
        style={{ background: "linear-gradient(135deg, #7610DC, #4308B0)" }}
      >
        <h3 className="text-white font-bold text-lg mb-2">
          Seu {archetype.idealMatch} pode estar na Guilda
        </h3>
        <p className="text-white/70 text-sm mb-5">
          433 founders. Matching por compatibilidade. 100% grátis para começar.
        </p>
        <a
          href="https://guilda.app.br"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-[#F97316] hover:bg-[#EA680C] text-white font-bold text-sm rounded-xl px-8 py-3 transition-transform hover:scale-[1.02]"
        >
          Encontrar Meu Cofundador →
        </a>
      </motion.div>
    </motion.div>
  );
}
