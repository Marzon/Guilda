import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProjectApplications } from "@/hooks/useProjectApplications";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Send, Briefcase, ExternalLink, User } from "lucide-react";
import { JobSearchResult } from "@/hooks/useGlobalSearch";

interface JobDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobSearchResult | null;
}

export function JobDetailDialog({ open, onOpenChange, job }: JobDetailDialogProps) {
  const [message, setMessage] = useState("");
  const { applyToRole } = useProjectApplications();
  const { data: auth } = useAuth();
  const { t } = useTranslation();
  
  if (!job) return null;
  
  const isLoggedIn = !!auth?.user;

  const handleSubmit = async () => {
    if (!job.projectId) return;
    
    await applyToRole.mutateAsync({
      roleId: job.id,
      projectId: job.projectId,
      message: message.trim() || undefined,
    });
    setMessage("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-primary/20 max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-green-100 text-green-700 gap-1">
              <Briefcase className="w-3 h-3" />
              {t('globalSearch.sections.jobs', 'Vaga')}
            </Badge>
          </div>
          <DialogTitle className="text-foreground text-xl">
            {job.title}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Link 
              to={job.path} 
              className="text-primary hover:underline inline-flex items-center gap-1"
              onClick={() => onOpenChange(false)}
            >
              {job.projectTitle}
              <ExternalLink className="w-3 h-3" />
            </Link>
          </DialogDescription>
          
          {/* Owner Info */}
          {job.ownerUsername && (
            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs text-muted-foreground">
                {t('projects.postedBy', 'Publicado por')}
              </span>
              <Link 
                to={`/u/${job.ownerUsername}`}
                className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                onClick={() => onOpenChange(false)}
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage src={job.ownerAvatar} />
                  <AvatarFallback>
                    <User className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                @{job.ownerUsername}
              </Link>
            </div>
          )}
        </DialogHeader>

        {/* Job Description */}
        {job.roleDescription && (
          <div className="py-3 border-y border-border">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              {t('projects.roleDescription', 'Descrição da Vaga')}
            </Label>
            <p className="text-sm text-foreground mt-2 whitespace-pre-wrap">
              {job.roleDescription}
            </p>
          </div>
        )}

        {/* Application Form */}
        {isLoggedIn ? (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="message">{t('projects.applicationMessage')}</Label>
              <Textarea
                id="message"
                placeholder={t('projects.applicationPlaceholder')}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="glass resize-none"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                💡 {t('projects.applicationTip')}
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={applyToRole.isPending}
                className="gap-2"
              >
                {applyToRole.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {t('projects.sendApplication')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="pt-4 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              {t('projects.loginToApply', 'Faça login para se candidatar a esta vaga')}
            </p>
            <Button asChild>
              <Link to="/auth" onClick={() => onOpenChange(false)}>
                {t('common.login', 'Entrar')}
              </Link>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}