import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Check, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { trackPurchaseCompleted } from "@/lib/analytics";
import { useLanguage } from "@/hooks/useLanguage";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";

const Success = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    // Check if this is a test mode purchase OR PayPal return
    const isTest = searchParams.get('test') === 'true';
    const productType = searchParams.get('product');
    const token = searchParams.get('token'); // PayPal order token

    if (isTest && productType) {
      activateTestSubscription(productType);
    } else if (token) {
      capturePayPalPayment(token);
    }

    // Confetti effect
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const colors = ['#8B5CF6', '#06B6D4', '#F59E0B'];

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const confetti = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(confetti);
      }

      const particleCount = 2;
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.width = '10px';
        particle.style.height = '10px';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.top = '-10px';
        particle.style.opacity = '1';
        particle.style.transform = 'rotate(0deg)';
        particle.style.transition = 'all 3s ease-out';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        particle.style.borderRadius = '50%';
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
          particle.style.top = window.innerHeight + 'px';
          particle.style.left = (parseInt(particle.style.left) + randomInRange(-100, 100)) + 'px';
          particle.style.opacity = '0';
          particle.style.transform = `rotate(${randomInRange(0, 360)}deg)`;
        }, 50);
        
        setTimeout(() => {
          particle.remove();
        }, 3000);
      }
    }, 50);

    return () => clearInterval(confetti);
  }, []);

  const activateTestSubscription = async (productType: string) => {
    if (isActivating) return;
    
    setIsActivating(true);
    try {
      const { data, error } = await supabase.functions.invoke('activate-test-subscription', {
        body: { product_type: productType }
      });

      if (error) throw error;

      trackPurchaseCompleted(productType, 97);
      toast.success(t("success.testActivated"));
    } catch {
      toast.error(t("success.testError"));
    } finally {
      setIsActivating(false);
    }
  };

  const capturePayPalPayment = async (orderId: string) => {
    if (isActivating) return;
    
    setIsActivating(true);
    toast.loading(t("success.processing"));
    
    try {
      const { data, error } = await supabase.functions.invoke('capture-paypal-payment', {
        body: { orderId }
      });

      if (error) throw error;
      
      trackPurchaseCompleted("paypal", data?.amount || 97);
      toast.dismiss();
      toast.success(t("success.paymentSuccess"));
    } catch (error: any) {
      toast.dismiss();
      toast.error(t("success.paymentError") + ': ' + error.message);
    } finally {
      setIsActivating(false);
    }
  };

  const benefits = [
    { key: "unlimitedMatches", emoji: "✨" },
    { key: "seeWhoLiked", emoji: "👀" },
    { key: "exclusiveBadge", emoji: "👑" },
    { key: "priorityAccess", emoji: "🚀" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <LandingNavbar />
      
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-xl w-full">
          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-12 text-center">
            {/* Animated Icon */}
            <div className="relative mb-8">
              <div className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center animate-bounce shadow-lg shadow-violet-500/30">
                <Crown className="w-12 h-12 md:w-16 md:h-16 text-white" />
              </div>
              <Sparkles className="absolute top-0 right-1/4 w-6 h-6 md:w-8 md:h-8 text-amber-400 animate-pulse" />
              <Sparkles className="absolute bottom-0 left-1/4 w-5 h-5 md:w-6 md:h-6 text-violet-500 animate-pulse" />
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4">
              {t("success.title")} 👑
            </h1>

            <p className="text-base md:text-lg text-slate-500 mb-8">
              {t("success.subtitle")}
            </p>

            {/* Benefits Box */}
            <div className="bg-gradient-to-br from-violet-50 to-cyan-50 p-6 rounded-xl border border-violet-100 mb-8 text-left">
              <h3 className="font-bold text-lg mb-4 text-slate-900 flex items-center gap-2">
                <Check className="w-5 h-5 text-violet-600" />
                {t("success.benefitsTitle")}
              </h3>
              <ul className="space-y-3">
                {benefits.map((benefit) => (
                  <li key={benefit.key} className="flex items-center gap-3 text-slate-700">
                    <span className="text-lg">{benefit.emoji}</span>
                    <span>{t(`success.benefits.${benefit.key}`)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <Button 
              onClick={() => navigate("/tavern")}
              size="lg"
              className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white font-semibold text-lg px-8 py-6 rounded-xl shadow-lg shadow-violet-500/30 transition-all hover:shadow-xl hover:shadow-violet-500/40"
            >
              {t("success.cta")}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <p className="text-sm text-slate-400 mt-6">
              {t("success.badgeActive")} 🎉
            </p>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
};

export default Success;