import { useState, useEffect, createContext, useContext } from "react";

interface SocialPaymentContextType {
  dialogOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
}

export const SocialPaymentContext = createContext<SocialPaymentContextType | null>(null);

export const useSocialPayment = () => {
  const context = useContext(SocialPaymentContext);
  if (!context) {
    throw new Error('useSocialPayment must be used within a SocialPaymentProvider');
  }
  return context;
};

export const useSocialPaymentIntent = () => {
  const [hasIntent, setHasIntent] = useState(false);

  useEffect(() => {
    const intent = sessionStorage.getItem('social_payment_intent');
    if (intent === 'true') {
      setHasIntent(true);
      sessionStorage.removeItem('social_payment_intent');
    }
  }, []);

  return hasIntent;
};
