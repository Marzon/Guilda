import { memo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Briefcase, Building2, Code, TrendingUp, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Job } from "@/hooks/usePlatformStats";

interface JobCardProps {
  job: Job;
  onClick?: () => void;
}

export const JobCard = memo(function JobCard({ job, onClick }: JobCardProps) {
  const { t } = useTranslation();

  const archetypeConfig = {
    BUILDER: {
      label: "Builder",
      icon: Code,
      className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    },
    SELLER: {
      label: "Seller",
      icon: TrendingUp,
      className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    },
  };

  const archetype = job.required_archetype 
    ? archetypeConfig[job.required_archetype] 
    : null;

  const ArchetypeIcon = archetype?.icon || Briefcase;

  return (
    <Link to={`/vagas/${job.id}`} className="block">
    <Card 
      className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border bg-card rounded-3xl overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-5">
        {/* Header with project info */}
        <div className="flex items-start gap-4 mb-4">
          {job.project.cover_image_url ? (
            <img
              src={job.project.cover_image_url}
              alt={job.project.title}
              className="w-14 h-14 rounded-2xl object-cover border border-border shadow-sm"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center border border-border shadow-sm">
              <Building2 className="w-7 h-7 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground truncate group-hover:text-primary transition-colors text-base">
                {job.role_name}
              </h3>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground truncate">
                {job.project.title}
              </span>
              {job.project.owner && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <Avatar className="w-5 h-5 ring-2 ring-background">
                    <AvatarImage src={job.project.owner.avatar_url || undefined} />
                    <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                      {job.project.owner.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground truncate font-medium">
                    {job.project.owner.username}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {job.role_description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {job.role_description}
          </p>
        )}

        {/* Archetype Badge */}
        {archetype && (
          <div className="mb-3">
            <Badge 
              variant="outline"
              className={archetype.className + " px-3 py-1"}
            >
              <ArchetypeIcon className="w-3.5 h-3.5 mr-1.5" />
              {archetype.label}
            </Badge>
          </div>
        )}

        {/* Skills */}
        {job.required_skills && job.required_skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {job.required_skills.slice(0, 4).map((skill) => (
              <Badge 
                key={skill} 
                variant="secondary"
                className="text-xs"
              >
                {skill}
              </Badge>
            ))}
            {job.required_skills.length > 4 && (
              <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                +{job.required_skills.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* CTA */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-xl py-5 transition-all group-hover:bg-primary/10 group-hover:text-primary"
        >
          {t("jobs.viewDetails", "Ver Detalhes")}
          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardContent>
    </Card>
    </Link>
  );
});
