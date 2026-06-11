import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquareQuote, Send, Sparkles } from "lucide-react";
import { useTestimonialRequests, TESTIMONIAL_QUESTIONS, PendingTestimonialRequest } from "@/hooks/useTestimonialRequests";
import { motion, AnimatePresence } from "framer-motion";

interface TestimonialRequestDialogProps {
  request: PendingTestimonialRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TestimonialRequestDialog({ request, open, onOpenChange }: TestimonialRequestDialogProps) {
  const { t } = useTranslation();
  const { submitResponse, isSubmitting } = useTestimonialRequests();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const questions = request.type === "partnership" 
    ? TESTIMONIAL_QUESTIONS.partnership 
    : TESTIMONIAL_QUESTIONS.individual;
  
  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;
  const canProceed = answers[currentQuestion?.key]?.trim().length > 10;

  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setAnswers({});
    }
  }, [open]);

  const handleNext = () => {
    if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      await submitResponse.mutateAsync({
        request_id: request.id,
        answers,
      });
      onOpenChange(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-primary/10">
              <MessageSquareQuote className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">
              {request.type === "partnership" ? "Conte sua história de parceria!" : "Queremos ouvir você!"}
            </DialogTitle>
          </div>
          <DialogDescription>
            {request.context_message || (
              request.type === "partnership" 
                ? `Sua parceria com ${request.partner_username} pode inspirar outros empreendedores!`
                : "Seu depoimento pode ajudar outros empreendedores a encontrar o caminho."
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Partner info for partnership */}
        {request.type === "partnership" && request.partner_username && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={request.partner_avatar || undefined} />
              <AvatarFallback>{request.partner_username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">Parceria com @{request.partner_username}</p>
              {request.project_title && (
                <p className="text-sm text-muted-foreground">Startup: {request.project_title}</p>
              )}
            </div>
          </div>
        )}

        {/* Progress indicator */}
        <div className="flex gap-1 mb-4">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                idx <= currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-3">
              <Label className="text-base font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                {currentQuestion?.label}
              </Label>
              <Textarea
                value={answers[currentQuestion?.key] || ""}
                onChange={(e) => setAnswers({ ...answers, [currentQuestion.key]: e.target.value })}
                placeholder="Escreva sua resposta aqui..."
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 10 caracteres • {answers[currentQuestion?.key]?.length || 0} caracteres
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        <DialogFooter className="flex gap-2 sm:gap-0">
          {currentStep > 0 && (
            <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
              Voltar
            </Button>
          )}
          <Button 
            onClick={handleNext} 
            disabled={!canProceed || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              "Enviando..."
            ) : isLastStep ? (
              <>
                <Send className="h-4 w-4" />
                Enviar depoimento
              </>
            ) : (
              "Próxima pergunta"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
