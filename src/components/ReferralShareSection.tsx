import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy, Check, Share2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface ReferralShareSectionProps {
  referralCode: string | null;
  userName: string;
}

export const ReferralShareSection = ({ referralCode, userName }: ReferralShareSectionProps) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!referralCode) return null;

  const referralLink = `https://guilda.app.br/auth?ref=${referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success(t('profile.linkCopied'));
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const shareText = {
    twitter: `🎮 Acabei de entrar na Guilda - a plataforma que conecta Devs e Marketeiros para criar startups juntos! Entre também: ${referralLink}`,
    linkedin: `Conheci a Guilda, uma plataforma gamificada que conecta desenvolvedores e profissionais de marketing para co-fundar startups. Se você está procurando um co-founder, confira!`,
    whatsapp: `Opa! Entrei na Guilda, uma plataforma estilo "Tinder para Co-Founders" que conecta devs e marketeiros. Tá procurando alguém pra lançar uma startup? Dá uma olhada: ${referralLink}`
  };

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText.twitter)}`,
    linkedin: `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(shareText.linkedin + ' ' + referralLink)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText.whatsapp)}`
  };

  return (
    <div className="pt-2 border-t border-border/30">
      <div className="flex items-center gap-1.5 mb-2">
        <Share2 className="w-3 h-3 text-emerald-500" />
        <span className="text-xs font-medium">{t('profile.shareToEarn')}</span>
      </div>

      {/* Copy Link Section */}
      <div className="flex gap-1.5 mb-2">
        <Input
          value={referralLink}
          readOnly
          className="text-[10px] h-7 bg-background/50"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="shrink-0 h-7 w-7 p-0"
        >
          {copied ? (
            <Check className="w-3 h-3 text-emerald-500" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </Button>
      </div>

      {/* Social Share Buttons */}
      <div className="flex gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-[10px] h-7 px-2"
          onClick={() => window.open(shareUrls.twitter, '_blank')}
        >
          𝕏 Twitter
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-[10px] h-7 px-2"
          onClick={() => window.open(shareUrls.linkedin, '_blank')}
        >
          Linkedin
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-[10px] h-7 px-2"
          onClick={() => window.open(shareUrls.whatsapp, '_blank')}
        >
          WhatsApp
        </Button>
      </div>
    </div>
  );
};
