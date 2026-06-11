import { useState } from "react";
import { Download, Mail, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface StickyActionBarProps {
  onDownload?: () => void | Promise<void>;
  showDownload?: boolean;
  showEmailResults?: boolean;
  downloadLabel?: string;
  // For email functionality
  toolName?: string;
  calculationData?: {
    inputs: Record<string, unknown>;
    results: Record<string, unknown>;
  };
  hasData?: boolean;
}

export const StickyActionBar = ({
  onDownload,
  showDownload = true,
  showEmailResults = false,
  downloadLabel,
  toolName = "",
  calculationData,
  hasData = true,
}: StickyActionBarProps) => {
  const { t, currentLanguage } = useLanguage();
  const [downloadState, setDownloadState] = useState<"idle" | "loading" | "success">("idle");
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [email, setEmail] = useState("");
  const [emailState, setEmailState] = useState<"idle" | "loading" | "success">("idle");

  const handleDownload = async () => {
    if (!onDownload) return;
    setDownloadState("loading");
    try {
      await onDownload();
      setDownloadState("success");
      toast.success(t("tools.downloadSuccess", "📥 Download concluído!"));
      setTimeout(() => setDownloadState("idle"), 2000);
    } catch (error) {
      setDownloadState("idle");
      toast.error(t("tools.downloadError", "Erro ao baixar"));
    }
  };

  const handleEmailClick = () => {
    if (!hasData) {
      toast.warning(t("tools.noDataToEmail", "Preencha os dados primeiro"));
      return;
    }
    setShowEmailDialog(true);
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendEmail = async () => {
    if (!isValidEmail(email)) {
      toast.error(t("tools.invalidEmail", "Digite um email válido"));
      return;
    }

    setEmailState("loading");
    try {
      const { error } = await supabase.functions.invoke("send-calculation-results", {
        body: {
          email,
          toolName,
          inputs: calculationData?.inputs || {},
          results: calculationData?.results || {},
          locale: currentLanguage,
        },
      });

      if (error) throw error;

      setEmailState("success");
      toast.success(t("tools.emailSent", "📧 Resultados enviados para seu email!"));
      setTimeout(() => {
        setShowEmailDialog(false);
        setEmail("");
        setEmailState("idle");
      }, 1500);
    } catch (error) {
      console.error("Error sending email:", error);
      setEmailState("idle");
      toast.error(t("tools.emailError", "Erro ao enviar email. Tente novamente."));
    }
  };

  const getButtonContent = (
    state: "idle" | "loading" | "success",
    idleIcon: React.ReactNode,
    label: string
  ) => {
    if (state === "loading") {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }
    if (state === "success") {
      return <Check className="w-4 h-4 text-green-500" />;
    }
    return (
      <>
        {idleIcon}
        <span className="hidden sm:inline">{label}</span>
      </>
    );
  };

  // Don't render if no actions available
  if (!showDownload && !showEmailResults) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-lg safe-area-pb">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-center gap-3">
          {showDownload && onDownload && (
            <Button
              onClick={handleDownload}
              disabled={downloadState === "loading"}
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 px-4 sm:px-6"
            >
              {getButtonContent(
                downloadState,
                <Download className="w-4 h-4" />,
                downloadLabel || t("tools.downloadPDF", "Baixar PDF")
              )}
            </Button>
          )}

          {showEmailResults && toolName && (
            <Button
              onClick={handleEmailClick}
              variant="outline"
              className="border-purple-200 text-purple-700 hover:bg-purple-50 flex items-center gap-2 px-4 sm:px-6"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">{t("tools.emailResults", "Receber por Email")}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-600" />
              {t("tools.emailResultsTitle", "Receber resultados por email")}
            </DialogTitle>
            <DialogDescription>
              {t("tools.emailResultsDescription", "Digite seu email para receber os resultados desta simulação")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="email-input">{t("common.email", "Email")}</Label>
              <Input
                id="email-input"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2"
                onKeyDown={(e) => e.key === "Enter" && handleSendEmail()}
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowEmailDialog(false)} className="flex-1">
                {t("common.cancel", "Cancelar")}
              </Button>
              <Button 
                onClick={handleSendEmail} 
                disabled={!email.trim() || emailState === "loading"}
                className="flex-1 gap-2"
              >
                {emailState === "loading" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : emailState === "success" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                {emailState === "loading" 
                  ? t("common.sending", "Enviando...") 
                  : emailState === "success"
                  ? t("common.sent", "Enviado!")
                  : t("common.send", "Enviar")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
