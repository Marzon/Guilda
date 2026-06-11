import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { SocialPaymentDialog } from "./SocialPaymentDialog";
import { 
  MessageCircle, Linkedin, Instagram, Video, Send, Facebook, 
  MessageSquare, Hash, Sparkles, X, Crown
} from "lucide-react";

interface SocialPaymentBannerProps {
  variant?: 'full' | 'compact';
  className?: string;
}

export const SocialPaymentBanner = ({ variant = 'full', className = '' }: SocialPaymentBannerProps) => {
  const navigate = useNavigate();
  const { data: authData, isLoading: isAuthLoading } = useAuth();
  const { tier, loading: isSubLoading } = useSubscription(authData?.user?.id || null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isLoggedIn = !!authData?.user;
  
  // Check if user is FOUNDER or higher tier
  const isFounderOrHigher = tier && tier !== 'FREE';

  // Don't show for non-logged users, FOUNDER+ users, or if dismissed
  if (!isLoggedIn || isFounderOrHigher || dismissed) return null;

  const handleClick = () => {
    setDialogOpen(true);
  };

  const platforms = [
    { icon: <MessageCircle className="w-4 h-4" />, color: 'text-green-500' },
    { icon: <Linkedin className="w-4 h-4" />, color: 'text-blue-600' },
    { icon: <Instagram className="w-4 h-4" />, color: 'text-pink-500' },
    { icon: <Video className="w-4 h-4" />, color: 'text-slate-900' },
    { icon: <Send className="w-4 h-4" />, color: 'text-sky-500' },
    { icon: <Facebook className="w-4 h-4" />, color: 'text-blue-700' },
    { icon: <MessageSquare className="w-4 h-4" />, color: 'text-indigo-600' },
    { icon: <Hash className="w-4 h-4" />, color: 'text-purple-600' },
  ];

  if (variant === 'compact') {
    return (
      <div className={`bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-xl ${className}`}>
        <button 
          onClick={handleClick}
          className="flex items-center justify-center gap-2 w-full hover:opacity-90 transition-opacity"
        >
          <Crown className="w-4 h-4 text-yellow-300" />
          <span className="text-sm font-medium">Ganhe 6 meses grátis!</span>
          <Sparkles className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={`relative z-40 mt-[88px] sm:mt-20 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white py-3 px-4 sm:py-4 sm:px-6 ${className}`}>
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Fechar banner"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1 bg-white/10 rounded-full px-3 py-1">
              {platforms.map((p, i) => (
                <span key={i} className="text-white">{p.icon}</span>
              ))}
            </div>
            
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Crown className="w-5 h-5 text-yellow-300" />
                <span className="font-bold text-lg">Ganhe 6 meses de acesso ao Guilda</span>
              </div>
              <p className="text-sm text-purple-100">
                Divulgue a Guilda nas redes sociais e ganhe 6 meses de acesso premium
              </p>
            </div>
          </div>

          <Button 
            onClick={handleClick}
            className="bg-white text-purple-600 hover:bg-purple-50 font-semibold whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Quero Divulgar
          </Button>
        </div>

        {/* Mobile platform icons */}
        <div className="flex sm:hidden items-center justify-center gap-2 mt-3">
          {platforms.map((p, i) => (
            <span key={i} className="text-white/80">{p.icon}</span>
          ))}
        </div>
      </div>

      <SocialPaymentDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
};
