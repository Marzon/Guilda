import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, User, Trash2, Calendar, Clock, Rocket } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Deal, DealTag, DealPriority, DEAL_TAGS, DEAL_PRIORITIES } from "@/hooks/useDealFlow";
import { DealTagSelector } from "./DealTagSelector";
import { format } from "date-fns";
import { ptBR, enUS, es } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FounderInfo {
  id: string;
  username: string;
  avatar_url?: string | null;
  archetype?: string;
}

interface DealDetailSheetProps {
  deal: Deal | null;
  founderInfo?: FounderInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTags: (tags: DealTag[]) => void;
  onUpdateNotes: (notes: string) => void;
  onUpdatePriority: (priority: DealPriority) => void;
  onRemove: () => void;
  onStartChat?: (founderId: string) => void;
  onViewProfile?: () => void;
  onViewStartup?: () => void;
  hasStartup?: boolean;
}

export const DealDetailSheet = ({
  deal,
  founderInfo,
  isOpen,
  onClose,
  onUpdateTags,
  onUpdateNotes,
  onUpdatePriority,
  onRemove,
  onStartChat,
  onViewProfile,
  onViewStartup,
  hasStartup = false,
}: DealDetailSheetProps) => {
  const { t, currentLanguage } = useLanguage();
  const [notes, setNotes] = useState(deal?.notes || "");
  const [hasNotesChanged, setHasNotesChanged] = useState(false);

  useEffect(() => {
    setNotes(deal?.notes || "");
    setHasNotesChanged(false);
  }, [deal?.id, deal?.notes]);

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setHasNotesChanged(value !== (deal?.notes || ""));
  };

  const handleSaveNotes = () => {
    onUpdateNotes(notes);
    setHasNotesChanged(false);
  };

  // Single tag selection (radio style)
  const handleTagChange = (tag: DealTag) => {
    onUpdateTags([tag]); // Always single tag
  };

  const getDateLocale = () => {
    switch (currentLanguage) {
      case 'pt': return ptBR;
      case 'es': return es;
      default: return enUS;
    }
  };

  if (!deal) return null;

  const priorityInfo = DEAL_PRIORITIES.find(p => p.value === deal.priority);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto" data-tour="deal-sheet">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            📊 {t('dealFlow.sheet.title', 'Detalhes do Deal')}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6" data-tour="deal-content">
          {/* Founder Info */}
          {founderInfo && (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                {founderInfo.avatar_url ? (
                  <img 
                    src={founderInfo.avatar_url} 
                    alt={founderInfo.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-primary" />
                )}
              </div>
              <div>
                <p className="font-medium">@{founderInfo.username}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {founderInfo.archetype?.toLowerCase()}
                </p>
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              {t('dealFlow.sheet.tags', 'Tags')}
            </Label>
            <DealTagSelector
              selectedTags={deal.tags as DealTag[]}
              onTagChange={handleTagChange}
              size="md"
            />
          </div>

          <Separator />

          {/* Priority */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              {t('dealFlow.sheet.priority', 'Prioridade')}
            </Label>
            <Select
              value={deal.priority}
              onValueChange={(value) => onUpdatePriority(value as DealPriority)}
            >
              <SelectTrigger>
                <SelectValue>
                  {priorityInfo && (
                    <span className="flex items-center gap-2">
                      {priorityInfo.icon} {t(priorityInfo.labelKey, priorityInfo.value)}
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {DEAL_PRIORITIES.map(priority => (
                  <SelectItem key={priority.value} value={priority.value}>
                    <span className="flex items-center gap-2">
                      {priority.icon} {t(priority.labelKey, priority.value)}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Notes */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              📝 {t('dealFlow.sheet.notes', 'Notas')}
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder={t('dealFlow.sheet.notesPlaceholder', 'Adicione suas anotações sobre este deal...')}
              className="min-h-[120px] resize-none"
            />
            {hasNotesChanged && (
              <Button 
                onClick={handleSaveNotes}
                size="sm"
                className="mt-2"
              >
                {t('common.save', 'Salvar')}
              </Button>
            )}
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{t('dealFlow.sheet.addedOn', 'Adicionado em')}:</span>
              <span className="text-foreground">
                {format(new Date(deal.created_at), 'PP', { locale: getDateLocale() })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{t('dealFlow.sheet.lastUpdate', 'Última atualização')}:</span>
              <span className="text-foreground">
                {format(new Date(deal.updated_at), 'PP', { locale: getDateLocale() })}
              </span>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                if (onStartChat && founderInfo) {
                  onStartChat(founderInfo.id);
                  onClose();
                }
              }}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {t('dealFlow.actions.openChat', 'Abrir Chat')}
            </Button>

            <div className="grid grid-cols-2 gap-2" data-tour="deal-actions">
              <Button
                variant="outline"
                className="justify-start"
                onClick={onViewProfile}
                data-tour="view-profile-btn"
              >
                <User className="w-4 h-4 mr-2" />
                {t('dealFlow.actions.viewProfile', 'Perfil')}
              </Button>

              <Button
                variant="outline"
                className="justify-start"
                onClick={onViewStartup}
                disabled={!hasStartup}
                data-tour="view-startup-btn"
              >
                <Rocket className="w-4 h-4 mr-2" />
                {t('dealFlow.actions.viewStartup', 'Startup')}
              </Button>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('dealFlow.actions.remove', 'Remover do Pipeline')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t('dealFlow.confirmRemove.title', 'Remover do Pipeline?')}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('dealFlow.confirmRemove.description', 'Esta ação irá remover este founder do seu pipeline. Você pode adicioná-lo novamente depois.')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    {t('common.cancel', 'Cancelar')}
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={onRemove}>
                    {t('common.remove', 'Remover')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
