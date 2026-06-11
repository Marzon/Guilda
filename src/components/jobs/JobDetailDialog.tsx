import { useTranslation } from "react-i18next";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  Code, 
  TrendingUp, 
  Briefcase,
  Send,
  ExternalLink
} from "lucide-react";
import type { Job } from "@/hooks/usePlatformStats";
import { buildCoreAppUrl } from "@/lib/url-utils";

const APP_URL = 'https://suprema.guilda.app.br';

interface JobDetailDialogProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const archetypeConfig = {
  BUILDER: {
    label: "Builder",
    icon: Code,
    description: "Tech & Produto",
    className: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  },
  SELLER: {
    label: "Seller", 
    icon: TrendingUp,
    description: "Negócios & Growth",
    className: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  },
};

export const JobDetailDialog = ({ job, open, onOpenChange }: JobDetailDialogProps) => {
  const { t } = useTranslation();

  if (!job) return null;

  const archetype = job.required_archetype ? archetypeConfig[job.required_archetype] : null;
  const ArchetypeIcon = archetype?.icon || Briefcase;

  const handleApply = () => {
    window.location.href = buildCoreAppUrl(APP_URL, '/auth?view=signup');
  };

  const handleViewProject = () => {
    window.location.href = buildCoreAppUrl(APP_URL, `/projects/${job.project.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{job.role_name}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("jobs.detailsFor", "Detalhes da vaga")} {job.role_name}
          </DialogDescription>
        </DialogHeader>

        {/* Project Info */}
        <div 
          className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl cursor-pointer hover:bg-muted/70 transition-colors"
          onClick={handleViewProject}
        >
          {job.project.cover_image_url ? (
            <img
              src={job.project.cover_image_url}
              alt={job.project.title}
              className="w-14 h-14 rounded-xl object-cover border border-border"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center border border-border">
              <Building2 className="w-7 h-7 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{job.project.title}</h3>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </div>
            {job.project.owner && (
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={job.project.owner.avatar_url || undefined} />
                  <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                    {job.project.owner.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {job.project.owner.username}
                </span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Role Details */}
        <div className="space-y-4">
          {/* Archetype */}
          {archetype && (
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                {t("jobs.lookingFor", "Buscando")}
              </Label>
              <div className="mt-2">
                <Badge variant="outline" className={`${archetype.className} px-3 py-1.5`}>
                  <ArchetypeIcon className="w-4 h-4 mr-2" />
                  {archetype.label} - {archetype.description}
                </Badge>
              </div>
            </div>
          )}

          {/* Description */}
          {job.role_description && (
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                {t("jobs.description", "Descrição")}
              </Label>
              <p className="mt-2 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {job.role_description}
              </p>
            </div>
          )}

          {/* Skills */}
          {job.required_skills && job.required_skills.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                {t("jobs.desiredSkills", "Skills Desejadas")}
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {job.required_skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* CTA */}
        <div className="space-y-3">
          <Button 
            onClick={handleApply} 
            className="w-full rounded-xl"
            size="lg"
          >
            <Send className="w-4 h-4 mr-2" />
            {t("jobs.applyNow", "Candidatar-se")}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            {t("jobs.loginRequired", "Faça login ou crie sua conta para se candidatar")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
