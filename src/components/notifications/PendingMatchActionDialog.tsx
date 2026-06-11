import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SmartAvatar } from "@/components/GuildaAvatar";
import { Check, X, Hammer, TrendingUp, Loader2, ExternalLink, CheckCircle, XCircle, MessageCircle } from "lucide-react";
import { useMatches } from "@/hooks/useMatches";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface PendingMatchActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requesterId: string;
  currentUserId: string;
  currentUserUsername?: string;
  onActionComplete?: () => void;
}

export const PendingMatchActionDialog = ({
  open,
  onOpenChange,
  requesterId,
  currentUserId,
  currentUserUsername,
  onActionComplete,
}: PendingMatchActionDialogProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { matches, acceptMatch, rejectMatch } = useMatches(currentUserId);
  const [processing, setProcessing] = useState<"accept" | "reject" | null>(null);

  // Fetch requester profile
  const { data: requesterProfile, isLoading: loadingProfile } = useQuery({
    queryKey: ["profile", requesterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", requesterId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: open && !!requesterId,
  });

  // Find the match (pending, accepted, or rejected)
  const matchWithRequester = matches.find(
    (m) => 
      (m.requester_id === requesterId && m.target_id === currentUserId) ||
      (m.requester_id === currentUserId && m.target_id === requesterId)
  );

  const pendingMatch = matchWithRequester?.status === "PENDING" && 
    matchWithRequester.requester_id === requesterId ? matchWithRequester : null;
  
  const isAlreadyConnected = matchWithRequester?.status === "ACCEPTED";
  const wasRejected = matchWithRequester?.status === "REJECTED";

  const handleAccept = async () => {
    if (!pendingMatch) return;
    
    setProcessing("accept");
    acceptMatch(
      {
        matchId: pendingMatch.id,
        requesterId,
        currentUserUsername: currentUserUsername || "Usuário",
      },
      {
        onSuccess: () => {
          setProcessing(null);
          onOpenChange(false);
          onActionComplete?.();
          // Navigate to chat
          navigate("/messages", { state: { openChatWithUserId: requesterId } });
        },
        onError: () => {
          setProcessing(null);
        },
      }
    );
  };

  const handleReject = () => {
    if (!pendingMatch) return;
    
    setProcessing("reject");
    rejectMatch(pendingMatch.id, {
      onSettled: () => {
        setProcessing(null);
        onOpenChange(false);
        onActionComplete?.();
      },
    });
  };

  const handleViewProfile = () => {
    navigate(`/u/${requesterId}`);
    onOpenChange(false);
  };

  const isBuilder = requesterProfile?.archetype === "BUILDER";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🤝 {t("pendingMatches.connectionRequest", "Solicitação de Conexão")}
          </DialogTitle>
        <DialogDescription>
            {pendingMatch 
              ? t("pendingMatches.reviewRequest", "Revise o perfil e decida se deseja conectar")
              : isAlreadyConnected
              ? t("pendingMatches.alreadyConnected", "Vocês já estão conectados!")
              : wasRejected
              ? t("pendingMatches.wasRejected", "Esta solicitação foi recusada")
              : t("pendingMatches.notFound", "Solicitação não encontrada")
            }
          </DialogDescription>
        </DialogHeader>

        {loadingProfile ? (
          <div className="py-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : !requesterProfile ? (
          <div className="py-8 text-center text-muted-foreground">
            {t("errors.profileNotFound", "Perfil não encontrado")}
          </div>
        ) : isAlreadyConnected ? (
          // Already connected - show success state with option to message
          <div className="space-y-4">
            <div className="py-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-foreground font-medium">
                {t("pendingMatches.connectedWith", "Você está conectado com")} @{requesterProfile.username}
              </p>
            </div>
            <Button
              onClick={() => {
                navigate("/messages", { state: { openChatWithUserId: requesterId } });
                onOpenChange(false);
              }}
              className="w-full gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              {t("pendingMatches.sendMessage", "Enviar mensagem")}
            </Button>
          </div>
        ) : wasRejected ? (
          // Was rejected - show info
          <div className="space-y-4">
            <div className="py-6 text-center">
              <XCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {t("pendingMatches.rejectedInfo", "Você recusou esta solicitação de conexão")}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleViewProfile}
              className="w-full gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              {t("pendingMatches.viewProfile", "Ver perfil")}
            </Button>
          </div>
        ) : !pendingMatch ? (
          <div className="py-8 text-center text-muted-foreground">
            {t("pendingMatches.alreadyProcessed", "Esta solicitação já foi processada")}
          </div>
        ) : (
          <div className="space-y-4">
            {/* User Info Card */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
              <div className="flex items-center gap-3">
                <SmartAvatar
                  avatarUrl={requesterProfile.avatar_url}
                  name={requesterProfile.username || "?"}
                  oderId={requesterProfile.id}
                  archetype={requesterProfile.archetype as "BUILDER" | "SELLER"}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate">
                    @{requesterProfile.username}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {isBuilder ? (
                      <Hammer className="w-3.5 h-3.5 text-purple-600" />
                    ) : (
                      <TrendingUp className="w-3.5 h-3.5 text-cyan-600" />
                    )}
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        isBuilder
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                          : "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300"
                      }`}
                    >
                      {isBuilder ? "Builder" : "Seller"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {requesterProfile.bio && (
                <p className="text-sm text-muted-foreground line-clamp-3 bg-background p-3 rounded-lg border border-border">
                  {requesterProfile.bio}
                </p>
              )}

              {/* Looking for */}
              {requesterProfile.looking_for && (
                <div className="text-xs">
                  <span className="text-muted-foreground font-medium">
                    {t("profile.lookingFor", "Buscando")}:
                  </span>{" "}
                  <span className="text-foreground">{requesterProfile.looking_for}</span>
                </div>
              )}
            </div>

            {/* View Profile Link */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewProfile}
              className="w-full gap-2 text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="w-4 h-4" />
              {t("pendingMatches.viewFullProfile", "Ver perfil completo")}
            </Button>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleAccept}
                disabled={processing !== null}
                className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700"
              >
                {processing === "accept" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {t("pendingMatches.accept", "Aceitar")}
              </Button>
              <Button
                onClick={handleReject}
                disabled={processing !== null}
                variant="outline"
                className="flex-1 gap-1.5"
              >
                {processing === "reject" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                {t("pendingMatches.decline", "Recusar")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
