import { useState, ReactNode } from "react";
import { SocialPaymentContext } from "@/hooks/useSocialPayment";
import { SocialPaymentDialog } from "./SocialPaymentDialog";

interface SocialPaymentProviderProps {
  children: ReactNode;
}

export const SocialPaymentProvider = ({ children }: SocialPaymentProviderProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const openDialog = () => setDialogOpen(true);
  const closeDialog = () => setDialogOpen(false);

  return (
    <SocialPaymentContext.Provider value={{ dialogOpen, openDialog, closeDialog }}>
      {children}
      <SocialPaymentDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </SocialPaymentContext.Provider>
  );
};
