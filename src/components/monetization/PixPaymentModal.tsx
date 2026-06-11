import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Copy, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";

interface PixPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productType: "founder_pass" | "founders_pass";
}

interface PixConfig {
  pix_key: string;
  expected_amount: number;
  qr_code_url: string | null;
}

export function PixPaymentModal({ open, onOpenChange, productType }: PixPaymentModalProps) {
  const { t } = useLanguage();
  const [pixConfig, setPixConfig] = useState<PixConfig | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "verifying" | "approved" | "rejected">("idle");
  const [rejectionReasons, setRejectionReasons] = useState<string[]>([]);

  // Carregar configuração do PIX quando o modal abre
  useEffect(() => {
    if (open) {
      loadPixConfig();
      // Reset state when modal opens
      setReceiptFile(null);
      setReceiptPreview(null);
      setVerificationStatus("idle");
      setRejectionReasons([]);
    }
  }, [open, productType]);

  const loadPixConfig = async () => {
    const { data } = await supabase
      .from("pix_config")
      .select("*")
      .eq("product_type", productType)
      .single();

    if (data) {
      setPixConfig(data);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, envie apenas imagens (JPG, PNG)");
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Tamanho máximo: 5MB");
      return;
    }

    setReceiptFile(file);

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitReceipt = async () => {
    if (!receiptFile || !receiptPreview) {
      toast.error("Por favor, selecione um comprovante");
      return;
    }

    setIsUploading(true);
    setVerificationStatus("verifying");

    try {
      const { data, error } = await supabase.functions.invoke("verify-pix-receipt", {
        body: {
          product_type: productType,
          receipt_image: receiptPreview, // Enviar base64
        },
      });

      if (error) throw error;

      if (data.success && data.status === "approved") {
        setVerificationStatus("approved");
        toast.success("Pagamento aprovado! Atualizando sua conta...");
        
        // Aguardar 2 segundos e recarregar
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setVerificationStatus("rejected");
        setRejectionReasons(data.reasons || ["Comprovante inválido"]);
        toast.error("Comprovante rejeitado. Verifique os detalhes.");
      }
    } catch (error: any) {
      console.error("Error verifying receipt:", error);
      setVerificationStatus("rejected");
      toast.error("Erro ao verificar comprovante. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  const copyPixKey = () => {
    if (pixConfig?.pix_key) {
      navigator.clipboard.writeText(pixConfig.pix_key);
      toast.success("Link de pagamento copiado!");
    }
  };

  const getProductTitle = () => {
    switch (productType) {
      case "founder_pass": return t('pricing.founderPass') || 'Founder Semestral';
      case "founders_pass": return t('pricing.foundersPass') || 'Founder Vitalício';
      default: return productType;
    }
  };

  const productTitle = getProductTitle();
  const productAmount = pixConfig?.expected_amount || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pagamento via PIX - {productTitle}</DialogTitle>
          <DialogDescription className="sr-only">
            Complete o pagamento de R$ {productAmount.toFixed(2)} via PIX
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Valor e instruções */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Valor a pagar:</p>
            <p className="text-3xl font-bold text-primary">
              R$ {productAmount.toFixed(2)}
            </p>
            {productType === "founder_pass" && (
              <p className="text-sm text-primary">6 meses de acesso</p>
            )}
            {productType === "founders_pass" && (
              <p className="text-sm text-primary">Acesso vitalício</p>
            )}
          </div>

          {/* QR Code */}
          {pixConfig?.qr_code_url && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-center">Escaneie o QR Code para pagar:</p>
              <div className="flex justify-center">
                <img
                  src={pixConfig.qr_code_url}
                  alt="QR Code PIX"
                  className="w-64 h-64 border-2 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Link de pagamento */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Ou copie o link de pagamento:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={pixConfig?.pix_key || "Carregando..."}
                readOnly
                className="flex-1 px-3 py-2 bg-muted rounded-md text-sm overflow-x-auto"
              />
              <Button onClick={copyPixKey} variant="outline" size="icon">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Upload do comprovante */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Enviar Comprovante:</p>
            
            {!receiptPreview ? (
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Clique para selecionar imagem
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="space-y-2">
                <img
                  src={receiptPreview}
                  alt="Preview do comprovante"
                  className="w-full h-48 object-contain border rounded-lg"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setReceiptFile(null);
                    setReceiptPreview(null);
                    setVerificationStatus("idle");
                    setRejectionReasons([]);
                  }}
                  className="w-full"
                >
                  Trocar imagem
                </Button>
              </div>
            )}
          </div>

          {/* Status da verificação */}
          {verificationStatus === "verifying" && (
            <div className="flex items-center gap-2 p-3 bg-blue-500/10 text-blue-600 rounded-lg">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Verificando comprovante...</span>
            </div>
          )}

          {verificationStatus === "approved" && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-600 rounded-lg">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">Pagamento aprovado!</span>
            </div>
          )}

          {verificationStatus === "rejected" && (
            <div className="space-y-2 p-3 bg-red-500/10 text-red-600 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Comprovante rejeitado</span>
              </div>
              <ul className="text-xs space-y-1 ml-7">
                {rejectionReasons.map((reason, idx) => (
                  <li key={idx}>• {reason}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Botão de envio */}
          <Button
            onClick={handleSubmitReceipt}
            disabled={!receiptFile || isUploading || verificationStatus === "approved"}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : verificationStatus === "approved" ? (
              "Aprovado!"
            ) : (
              "Enviar Comprovante"
            )}
          </Button>

          {/* Aviso */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              Após realizar o pagamento, envie o comprovante. A verificação é
              automática e leva alguns segundos.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}