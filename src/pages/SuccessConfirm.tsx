import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SmartAvatar } from "@/components/GuildaAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, CheckCircle, XCircle, Rocket, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface StoryInfo {
  valid: boolean;
  already_confirmed: boolean;
  story_id: string;
  current_user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  partner: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  project: {
    id: string;
    title: string;
  } | null;
  status: string;
}

const PARTNERSHIP_TYPES = [
  { value: "cofounder", label: "Encontramos um co-fundador" },
  { value: "contractor", label: "Fechamos uma contratação" },
  { value: "advisor", label: "Parceria como advisor" },
  { value: "investor", label: "Investimento" },
  { value: "other", label: "Outra parceria" },
];

export default function SuccessConfirm() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [storyInfo, setStoryInfo] = useState<StoryInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [fullyConfirmed, setFullyConfirmed] = useState(false);

  // Form state
  const [partnershipType, setPartnershipType] = useState("cofounder");
  const [testimonial, setTestimonial] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Token não fornecido");
      setLoading(false);
      return;
    }

    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("confirm-success-story", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        body: null,
      });

      // Since we can't pass query params to invoke, we need to call the function directly
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/confirm-success-story?token=${token}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.valid) {
        setError(result.error || "Token inválido ou expirado");
        setLoading(false);
        return;
      }

      setStoryInfo(result);
      
      if (result.already_confirmed) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error("Error validating token:", err);
      setError("Erro ao validar token");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/confirm-success-story`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            partnership_type: partnershipType,
            testimonial: testimonial || null,
            is_public: isPublic,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao confirmar");
      }

      setSubmitted(true);
      setFullyConfirmed(result.fully_confirmed);
      toast.success(result.message);
    } catch (err: any) {
      console.error("Error submitting confirmation:", err);
      toast.error(err.message || "Erro ao enviar confirmação");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 space-y-4">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-xl font-bold mb-2">Link inválido</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button asChild>
              <Link to="/">Voltar para a Guilda</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state (after submission or already confirmed)
  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">
              {fullyConfirmed ? "Parabéns! 🎉" : "Confirmação registrada!"}
            </h1>
            <p className="text-muted-foreground mb-6">
              {fullyConfirmed
                ? "Ambos confirmaram a parceria. Sua história pode inspirar outros founders!"
                : "Aguardando a confirmação do seu parceiro para publicar a história."}
            </p>

            {storyInfo && (
              <div className="flex items-center justify-center gap-3 p-4 bg-muted rounded-lg mb-6">
                <SmartAvatar
                  avatarUrl={storyInfo.current_user.avatar_url}
                  name={storyInfo.current_user.username}
                  size="md"
                />
                <CheckCircle className="h-5 w-5 text-primary" />
                <SmartAvatar
                  avatarUrl={storyInfo.partner.avatar_url}
                  name={storyInfo.partner.username}
                  size="md"
                />
              </div>
            )}

            <Button asChild className="w-full">
              <Link to="/tavern">
                Continuar explorando
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Confirmation form
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">A parceria deu certo?</CardTitle>
          <CardDescription>
            Confirme sua conexão com @{storyInfo?.partner.username}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {storyInfo && (
            <div className="flex items-center justify-center gap-4 p-4 bg-muted rounded-lg mb-6">
              <div className="text-center">
                <SmartAvatar
                  avatarUrl={storyInfo.current_user.avatar_url}
                  name={storyInfo.current_user.username}
                  size="lg"
                />
                <p className="text-sm font-medium mt-2">@{storyInfo.current_user.username}</p>
              </div>
              <div className="text-2xl">+</div>
              <div className="text-center">
                <SmartAvatar
                  avatarUrl={storyInfo.partner.avatar_url}
                  name={storyInfo.partner.username}
                  size="lg"
                />
                <p className="text-sm font-medium mt-2">@{storyInfo.partner.username}</p>
              </div>
            </div>
          )}

          {storyInfo?.project && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 justify-center">
              <Rocket className="h-4 w-4" />
              <span>{storyInfo.project.title}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>O que aconteceu?</Label>
              <Select value={partnershipType} onValueChange={setPartnershipType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PARTNERSHIP_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Conte um pouco mais (opcional)</Label>
              <Textarea
                value={testimonial}
                onChange={(e) => setTestimonial(e.target.value)}
                placeholder="Como foi a experiência? O que vocês construíram juntos?"
                rows={3}
                maxLength={280}
              />
              <p className="text-xs text-muted-foreground text-right">
                {testimonial.length}/280
              </p>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Switch
                id="is_public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
              <Label htmlFor="is_public" className="text-sm cursor-pointer">
                Permitir que nossa história seja exibida na Guilda para inspirar outros founders
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Confirmando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar parceria
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
