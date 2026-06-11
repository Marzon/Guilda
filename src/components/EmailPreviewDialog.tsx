import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, X, ZoomIn } from "lucide-react";
import DOMPurify from "dompurify";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface EmailPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EmailPreviewDialog = ({ open, onOpenChange }: EmailPreviewDialogProps) => {
  const [imageZoomed, setImageZoomed] = useState(false);

  // Simulação do HTML do email de confirmação da waitlist
  const emailPreviewHTML = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0B0E14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="text-align: center; padding: 20px;">
        <h1 style="color: #8B5CF6; font-size: 32px; font-weight: bold; margin: 0; letter-spacing: 2px;">GUILDA</h1>
      </div>

      <div style="background-color: #1a1f2e; border-radius: 12px; padding: 32px; border: 2px solid #8B5CF6;">
        <h2 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0 0 16px 0;">Você entrou! 🎉</h2>
        <p style="color: #e0e0e0; font-size: 16px; line-height: 24px; margin: 0 0 16px 0;">Olá João!</p>
        <p style="color: #e0e0e0; font-size: 16px; line-height: 24px; margin: 0 0 16px 0;">Bem-vindo à lista de espera do GUILDA - a plataforma que conecta Desenvolvedores com profissionais de Marketing/Vendas para co-fundar startups.</p>

        <div style="background-color: #8B5CF6; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
          <p style="color: #ffffff; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Sua posição atual na fila:</p>
          <h3 style="color: #ffffff; font-size: 48px; font-weight: bold; margin: 0;">#1</h3>
        </div>

        <div style="background-color: #2a2f3e; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <h3 style="color: #ffffff; font-size: 20px; font-weight: bold; margin: 0 0 12px 0;">🚀 Pule a Fila</h3>
          <p style="color: #a0a0a0; font-size: 14px; line-height: 20px; margin: 0;">Convide amigos e suba 2 posições para cada pessoa que entrar pelo seu link!</p>
        </div>

        <div style="background-color: #2a2f3e; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="color: #a0a0a0; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase;">Seu Link de Convite:</p>
          <a href="https://guilda.app.br/waitlist?ref=TESTE123" style="color: #F59E0B; font-size: 14px; word-break: break-all; display: block;">https://guilda.app.br/waitlist?ref=TESTE123</a>
        </div>

        <div style="margin: 32px 0;">
          <p style="color: #a0a0a0; font-size: 14px; text-align: center; margin: 0 0 16px 0;">Compartilhe nas redes sociais:</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" style="padding: 8px;">
                <a href="#" style="display: inline-block; background-color: #000000; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                  𝕏 Twitter
                </a>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 8px;">
                <a href="#" style="display: inline-block; background-color: #0A66C2; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                  in LinkedIn
                </a>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 8px;">
                <a href="#" style="display: inline-block; background-color: #25D366; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                  📱 WhatsApp
                </a>
              </td>
            </tr>
          </table>
        </div>

        <hr style="border: none; border-top: 1px solid #3a3f4e; margin: 32px 0;">

        <h3 style="color: #ffffff; font-size: 20px; font-weight: bold; margin: 24px 0 12px 0;">O que vem depois?</h3>
        <p style="color: #e0e0e0; font-size: 14px; line-height: 24px; margin: 8px 0;">📧 Enviaremos um email assim que atingirmos 50 inscrições</p>
        <p style="color: #e0e0e0; font-size: 14px; line-height: 24px; margin: 8px 0;">🏆 Posições mais altas na fila obtêm acesso primeiro</p>
        <p style="color: #e0e0e0; font-size: 14px; line-height: 24px; margin: 8px 0;">📣 Compartilhe seu link para subir mais rápido</p>
      </div>

      <div style="text-align: center; padding: 24px;">
        <p style="color: #8B5CF6; font-size: 16px; font-weight: bold; margin: 0 0 8px 0;">GUILDA - Encontre seu co-founder ideal</p>
        <p style="color: #666666; font-size: 12px; margin: 0;">Você recebeu este email porque se cadastrou na lista de espera do GUILDA.</p>
      </div>
    </div>
  `;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview do Email - Confirmação Waitlist
            </DialogTitle>
            <DialogDescription>
              Visualização de como o email será exibido para os usuários
            </DialogDescription>
          </DialogHeader>
          
          <div 
            className="border border-border rounded-lg p-4 bg-[#0B0E14] cursor-zoom-in hover:ring-2 hover:ring-primary/50 transition-all"
            onClick={() => setImageZoomed(true)}
            title="Clique para expandir"
          >
            <div 
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(emailPreviewHTML) }}
              className="email-preview"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ZoomIn className="h-4 w-4" />
            <span>Clique na prévia para expandir em tela cheia</span>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de zoom da imagem */}
      <Dialog open={imageZoomed} onOpenChange={setImageZoomed}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full p-0">
          <VisuallyHidden>
            <DialogTitle>Prévia do email em tela cheia</DialogTitle>
            <DialogDescription>Visualização ampliada do email de confirmação</DialogDescription>
          </VisuallyHidden>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 bg-background/80 hover:bg-background"
            onClick={() => setImageZoomed(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="overflow-auto max-h-[95vh] p-8">
            <div 
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(emailPreviewHTML) }}
              className="email-preview transform scale-110"
            />
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        .email-preview * {
          pointer-events: none;
        }
        .email-preview a {
          cursor: default !important;
        }
      `}</style>
    </>
  );
};
