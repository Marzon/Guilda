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
import { Check, X, Users, Hammer, TrendingUp, Loader2 } from "lucide-react";
import { useMatches } from "@/hooks/useMatches";
import { useLanguage } from "@/hooks/useLanguage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";

interface PendingMatchesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PendingMatchesDialog = ({ open, onOpenChange }: PendingMatchesDialogProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { data: authData } = useAuth();
  const user = authData?.user;
  const profile = authData?.profile;
  const { matches, acceptMatch, rejectMatch } = useMatches(user?.id || null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Pending matches where current user is the TARGET (received invites)
  const pendingMatches = matches.filter(
    match => match.status === "PENDING" && match.target_id === user?.id
  );

  const handleAccept = async (matchId: string, requesterId: string) => {
    setProcessingId(matchId);
    acceptMatch(
      { 
        matchId, 
        requesterId, 
        currentUserUsername: profile?.username || "Usuário" 
      },
      {
        onSuccess: () => {
          setProcessingId(null);
          onOpenChange(false);
          // Auto-redirect to chat with the requester
          navigate("/messages", { state: { openChatWithUserId: requesterId } });
        },
        onError: () => {
          setProcessingId(null);
        }
      }
    );
  };

  const handleReject = (matchId: string) => {
    setProcessingId(matchId);
    rejectMatch(matchId, {
      onSettled: () => {
        setProcessingId(null);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {t('pendingMatches.title', 'Conexões Pendentes')}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Lista de solicitações de conexão pendentes para aceitar ou recusar
          </DialogDescription>
        </DialogHeader>

        {pendingMatches.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t('pendingMatches.empty', 'Nenhuma conexão pendente')}
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3 pr-4">
              {pendingMatches.map((match) => {
                const requester = match.requester;
                if (!requester) return null;
                
                const isProcessing = processingId === match.id;
                const isBuilder = requester.archetype === "BUILDER";
                
                return (
                  <div
                    key={match.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-3">
                      <SmartAvatar
                        avatarUrl={requester.avatar_url}
                        name={requester.username || "?"}
                        oderId={requester.id}
                        archetype={requester.archetype as "BUILDER" | "SELLER"}
                        size="lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 truncate">
                          @{requester.username}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {isBuilder ? (
                            <Hammer className="w-3.5 h-3.5 text-purple-600" />
                          ) : (
                            <TrendingUp className="w-3.5 h-3.5 text-cyan-600" />
                          )}
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${isBuilder ? "bg-purple-100 text-purple-700" : "bg-cyan-100 text-cyan-700"}`}
                          >
                            {isBuilder ? "Builder" : "Seller"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    {requester.bio && (
                      <p className="text-xs text-slate-600 line-clamp-2 bg-white p-2 rounded-lg border border-slate-100">
                        {requester.bio}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAccept(match.id, requester.id)}
                        disabled={isProcessing}
                        size="sm"
                        className="flex-1 gap-1.5 h-9 bg-green-600 hover:bg-green-700"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        {t('pendingMatches.accept', 'Aceitar')}
                      </Button>
                      <Button
                        onClick={() => handleReject(match.id)}
                        disabled={isProcessing}
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 h-9"
                      >
                        <X className="w-3.5 h-3.5" />
                        {t('pendingMatches.decline', 'Recusar')}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};
