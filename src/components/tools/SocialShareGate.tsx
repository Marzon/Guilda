import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Linkedin, MessageCircle, Mail, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validateEmail, suggestEmailCorrection } from "@/lib/emailValidation";

const SHARE_UNLOCK_KEY = "guilda_share_unlocked";
const SHARE_USE_COUNT_KEY = "guilda_share_use_count";
const SHARE_URL = "https://www.guilda.app.br/ferramentas-empreendedores/guilda-ia-mvp";
const UNLOCK_DURATION_MS = 24 * 60 * 60 * 1000; // 24h

export const isShareUnlocked = (): boolean => {
  try {
    const stored = localStorage.getItem(SHARE_UNLOCK_KEY);
    if (!stored) return false;
    const expiry = parseInt(stored, 10);
    if (Date.now() < expiry) return true;
    localStorage.removeItem(SHARE_UNLOCK_KEY);
    return false;
  } catch {
    return false;
  }
};

/** Returns how many times the user has used the share/email unlock */
export const getShareUseCount = (): number => {
  try {
    return parseInt(localStorage.getItem(SHARE_USE_COUNT_KEY) || "0", 10);
  } catch {
    return 0;
  }
};

/** Returns true if user has already used their free unlock and needs to sign up */
export const requiresSignup = (): boolean => {
  return getShareUseCount() >= 1;
};

const incrementShareUseCount = () => {
  const current = getShareUseCount();
  localStorage.setItem(SHARE_USE_COUNT_KEY, String(current + 1));
};

const saveUnlock = () => {
  localStorage.setItem(SHARE_UNLOCK_KEY, String(Date.now() + UNLOCK_DURATION_MS));
  incrementShareUseCount();
};

interface SocialShareGateProps {
  onUnlock: () => void;
  toolId?: string;
}

export const SocialShareGate = ({ onUnlock, toolId = "guilda-ia-mvp" }: SocialShareGateProps) => {
  const { t } = useTranslation();
  const [unlocking, setUnlocking] = useState(false);
  const [email, setEmail] = useState("");
  const [submittingEmail, setSubmittingEmail] = useState(false);

  const shareText = t(
    "tools.socialGate.shareText",
    "🚀 Acabei de gerar o prompt do meu MVP com IA usando a Guilda! Crie o seu em 2 minutos, de graça:"
  );

  const shareUrls = {
    linkedin: `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(shareText + " " + SHARE_URL)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText + " " + SHARE_URL)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + " " + SHARE_URL)}`,
  };

  const handleShare = useCallback(
    (platform: keyof typeof shareUrls) => {
      window.open(shareUrls[platform], "_blank", "noopener,noreferrer");
      setUnlocking(true);
      setTimeout(() => {
        saveUnlock();
        onUnlock();
      }, 3000);
    },
    [onUnlock, shareUrls]
  );

  const handleEmailSubmit = async () => {
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      const suggestion = suggestEmailCorrection(email);
      if (suggestion) {
        toast.error(`E-mail inválido. Você quis dizer ${suggestion}?`, {
          duration: 6000,
          action: {
            label: "Sim",
            onClick: () => setEmail(suggestion)
          }
        });
      } else {
        toast.error("Digite um e-mail válido");
      }
      return;
    }
    setSubmittingEmail(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const leadData = {
        email: email.trim().toLowerCase(),
        tool_id: toolId,
        utm_source: params.get("utm_source") || null,
        utm_medium: params.get("utm_medium") || null,
        utm_campaign: params.get("utm_campaign") || null,
      };
      await supabase.from("tool_leads" as any).insert(leadData as any);
      
      // Sync to Brevo in background (don't block UX)
      supabase.functions.invoke("sync-lead-to-brevo", {
        body: { ...leadData, source: "tool_leads" },
      }).catch((err) => console.error("Brevo sync error:", err));
      
      saveUnlock();
      toast.success("Prompt desbloqueado! 🎉");
      onUnlock();
    } catch (err) {
      console.error("Error saving lead:", err);
      toast.error("Erro ao enviar. Tente novamente.");
    } finally {
      setSubmittingEmail(false);
    }
  };

  return (
    <Card className="border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-950/20 to-violet-950/20 overflow-hidden">
      <CardContent className="py-6 space-y-5 text-center">
        <Lock className="h-8 w-8 mx-auto text-fuchsia-400" />
        <h3 className="text-lg font-semibold">
          {t("tools.socialGate.title", "🔒 Desbloqueie o prompt completo")}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {t(
            "tools.socialGate.description",
            "Seu prompt foi gerado! Compartilhe a ferramenta ou deixe seu e-mail para ver o resultado completo."
          )}
        </p>

        {unlocking ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-2 py-2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-6 w-6 border-2 border-fuchsia-400 border-t-transparent rounded-full"
            />
            <span className="text-sm text-muted-foreground">
              {t("tools.socialGate.unlocking", "Desbloqueando...")}
            </span>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {/* Email option */}
            <div className="max-w-sm mx-auto space-y-2">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
                  className="flex-1"
                />
                <Button
                  onClick={handleEmailSubmit}
                  disabled={submittingEmail}
                  className="gap-2 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-700 hover:to-violet-700"
                >
                  {submittingEmail ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  {submittingEmail ? t("tools.socialGate.unlocking", "Desbloqueando...") : t("tools.socialGate.unlockAction", "Desbloquear")}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("tools.socialGate.noSpam", "Receba o prompt completo no seu e-mail. Sem spam.")}
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 max-w-sm mx-auto">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground uppercase">{t("tools.socialGate.orShare", "ou compartilhe")}</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Social share buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => handleShare("linkedin")}
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => handleShare("twitter")}
              >
                <span className="font-bold text-sm">𝕏</span>
                Twitter
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => handleShare("whatsapp")}
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
