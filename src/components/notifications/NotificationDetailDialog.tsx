import { useNavigate } from "react-router-dom";
import { ExternalLink, MessageCircle, Users, Briefcase, Info, Trophy, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR, enUS, es } from "date-fns/locale";
import { LinkifyText } from "@/components/LinkifyText";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;

const GUILDA_DOMAINS = ['guilda.app.br', 'guilda.lovable.app', 'localhost'];

const isInternalUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return GUILDA_DOMAINS.some(domain => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
};

const getPathFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname + urlObj.search;
  } catch {
    return "/";
  }
};

const getLocale = (lang: string) => {
  switch (lang) {
    case "pt": return ptBR;
    case "es": return es;
    default: return enUS;
  }
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "match_request":
    case "match_accepted":
    case "match_auto_accepted":
    case "match_expiring_warning":
      return <Users className="w-6 h-6 text-primary" />;
    case "new_message":
      return <MessageCircle className="w-6 h-6 text-accent" />;
    case "project_invite":
    case "application_received":
    case "application_accepted":
      return <Briefcase className="w-6 h-6 text-green-500" />;
    case "success_story":
      return <Trophy className="w-6 h-6 text-amber-500" />;
    default:
      return <Info className="w-6 h-6 text-muted-foreground" />;
  }
};

const getNotificationTypeLabel = (type: string, t: (key: string, fallback: string) => string) => {
  switch (type) {
    case "match_request":
      return t("notifications.types.matchRequest", "Solicitação de conexão");
    case "match_accepted":
    case "match_auto_accepted":
      return t("notifications.types.matchAccepted", "Conexão aceita");
    case "match_expiring_warning":
      return t("notifications.types.matchExpiring", "Conexão expirando");
    case "new_message":
      return t("notifications.types.newMessage", "Nova mensagem");
    case "project_invite":
      return t("notifications.types.projectInvite", "Convite de projeto");
    case "application_received":
      return t("notifications.types.applicationReceived", "Candidatura recebida");
    case "application_accepted":
      return t("notifications.types.applicationAccepted", "Candidatura aceita");
    case "success_story":
      return t("notifications.types.successStory", "História de sucesso");
    case "founder_introduction":
      return t("notifications.types.introduction", "Apresentação");
    default:
      return t("notifications.types.general", "Notificação");
  }
};

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  action_url?: string | null;
  created_at: string;
  read: boolean;
  related_user_id?: string | null;
  related_match_id?: string | null;
}

interface NotificationDetailDialogProps {
  notification: Notification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate?: () => void;
}

export const NotificationDetailDialog = ({
  notification,
  open,
  onOpenChange,
  onNavigate,
}: NotificationDetailDialogProps) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();

  if (!notification) return null;

  // Extract all URLs from the message
  const extractedUrls = notification.message?.match(urlRegex) || [];
  const actionUrl = notification.action_url;
  
  // Combine action_url with extracted URLs, removing duplicates
  const allUrls = actionUrl 
    ? [actionUrl, ...extractedUrls.filter(url => url !== actionUrl)]
    : extractedUrls;

  const handleUrlClick = (url: string) => {
    if (isInternalUrl(url)) {
      onOpenChange(false);
      onNavigate?.();
      navigate(getPathFromUrl(url));
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handlePrimaryAction = () => {
    if (allUrls.length > 0) {
      handleUrlClick(allUrls[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] w-[calc(100%-2rem)] p-0 gap-0 flex flex-col">
        <DialogHeader className="p-4 pb-3 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {getNotificationTypeLabel(notification.type, t)}
                </span>
                {!notification.read && (
                  <span className="w-2 h-2 rounded-full bg-primary" />
                )}
              </div>
              <DialogTitle className="text-base sm:text-lg line-clamp-2 pr-6">
                {notification.title}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 space-y-4">
            {/* Full message content */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                <LinkifyText text={notification.message} />
              </p>
            </div>

            {/* Timestamp */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span>
                {format(new Date(notification.created_at), "PPpp", {
                  locale: getLocale(currentLanguage),
                })}
              </span>
              <span className="text-muted-foreground/50">•</span>
              <span>
                {formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                  locale: getLocale(currentLanguage),
                })}
              </span>
            </div>

            {/* URLs section */}
            {allUrls.length > 0 && (
              <div className="pt-2 border-t border-border/50 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {t("notifications.links", "Links")}
                </p>
                <div className="space-y-2">
                  {allUrls.map((url, index) => {
                    const isInternal = isInternalUrl(url);
                    return (
                      <button
                        key={index}
                        onClick={() => handleUrlClick(url)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left",
                          "hover:bg-muted/50 border-border/50 hover:border-border"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                          isInternal ? "bg-primary/10" : "bg-muted"
                        )}>
                          {isInternal ? (
                            <ArrowRight className="w-4 h-4 text-primary" />
                          ) : (
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm font-medium truncate",
                            isInternal ? "text-primary" : "text-foreground"
                          )}>
                            {isInternal 
                              ? t("notifications.openInApp", "Abrir no aplicativo")
                              : t("notifications.openExternal", "Abrir link externo")
                            }
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {url}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-3 sm:p-4 border-t border-border/50 flex gap-2 justify-end shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-sm"
          >
            {t("common.close", "Fechar")}
          </Button>
          {allUrls.length > 0 && (
            <Button onClick={handlePrimaryAction} size="sm" className="gap-1.5 text-sm">
              {isInternalUrl(allUrls[0]) ? (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span className="hidden xs:inline">{t("notifications.goToContent", "Ir para conteúdo")}</span>
                  <span className="xs:hidden">{t("common.go", "Ir")}</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden xs:inline">{t("notifications.openLink", "Abrir link")}</span>
                  <span className="xs:hidden">{t("common.open", "Abrir")}</span>
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
