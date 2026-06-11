import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Skeleton } from "@/components/ui/skeleton";
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
  ExternalLink,
  ArrowLeft,
  MapPin,
} from "lucide-react";
import { useJobDetail } from "@/hooks/useJobDetail";
import { JobSeo } from "@/components/jobs/JobSeo";
import { LandingDarkNavbar } from "@/components/landing/LandingDarkNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { buildCoreAppUrl } from "@/lib/url-utils";

const APP_URL = "https://suprema.guilda.app.br";

const archetypeConfig = {
  BUILDER: {
    label: "Builder",
    icon: Code,
    description: "Tech & Produto",
    className:
      "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  },
  SELLER: {
    label: "Seller",
    icon: TrendingUp,
    description: "Negócios & Growth",
    className:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  },
};

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { job, isLoading, isNotFound } = useJobDetail(id);

  const handleApply = () => {
    window.location.href = buildCoreAppUrl(APP_URL, "/auth?view=signup");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <LandingDarkNavbar />
        <main className="max-w-3xl mx-auto px-4 py-12 pt-24 space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </main>
      </div>
    );
  }

  if (isNotFound || !job) {
    return (
      <div className="min-h-screen bg-background">
        <LandingDarkNavbar />
        <Helmet>
          <title>{t("jobs.notFound", "Vaga não encontrada")} | Guilda</title>
        </Helmet>
        <main className="max-w-3xl mx-auto px-4 py-12 pt-24 text-center">
          <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {t("jobs.notFound", "Vaga não encontrada")}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t("jobs.notFoundDescription", "Esta vaga pode ter sido preenchida ou removida.")}
          </p>
          <Button asChild variant="outline">
            <Link to="/vagas">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("jobs.backToJobs", "Ver todas as vagas")}
            </Link>
          </Button>
        </main>
        <LandingFooter />
      </div>
    );
  }

  const archetype = job.required_archetype
    ? archetypeConfig[job.required_archetype]
    : null;
  const ArchetypeIcon = archetype?.icon || Briefcase;

  return (
    <div className="min-h-screen bg-background">
      <LandingDarkNavbar />
      <JobSeo job={job} />

      <main className="max-w-3xl mx-auto px-4 py-12 pt-24">
        {/* Back link */}
        <Link
          to="/vagas"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("jobs.backToJobs", "Ver todas as vagas")}
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {job.role_name}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{t("jobs.remote", "Remoto")}</span>
            </div>
            {archetype && (
              <Badge
                variant="outline"
                className={`${archetype.className} px-3 py-1`}
              >
                <ArchetypeIcon className="w-4 h-4 mr-1.5" />
                {archetype.label} - {archetype.description}
              </Badge>
            )}
          </div>
        </div>

        {/* Company Card */}
        <div className="flex items-center gap-4 p-5 bg-muted/50 rounded-2xl mb-8 border border-border">
          {job.project.cover_image_url ? (
            <img
              src={job.project.cover_image_url}
              alt={job.project.title}
              className="w-16 h-16 rounded-xl object-cover border border-border"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center border border-border">
              <Building2 className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-foreground text-lg">
              {job.project.title}
            </h2>
            {job.project.owner && (
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="w-5 h-5">
                  <AvatarImage
                    src={job.project.owner.avatar_url || undefined}
                  />
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

        <Separator className="mb-8" />

        {/* Description */}
        {job.role_description && (
          <section className="mb-8">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              {t("jobs.description", "Descrição")}
            </Label>
            <div className="mt-3 text-foreground leading-relaxed whitespace-pre-wrap">
              {job.role_description}
            </div>
          </section>
        )}

        {/* Skills */}
        {job.required_skills && job.required_skills.length > 0 && (
          <section className="mb-8">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              {t("jobs.desiredSkills", "Skills Desejadas")}
            </Label>
            <div className="flex flex-wrap gap-2 mt-3">
              {job.required_skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="px-3 py-1">
                  {skill}
                </Badge>
              ))}
            </div>
          </section>
        )}

        <Separator className="mb-8" />

        {/* CTA */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">
            {t("jobs.interestedInRole", "Interessado nesta vaga?")}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t(
              "jobs.loginRequired",
              "Faça login ou crie sua conta para se candidatar"
            )}
          </p>
          <Button onClick={handleApply} size="lg" className="rounded-xl px-8">
            <Send className="w-4 h-4 mr-2" />
            {t("jobs.applyNow", "Candidatar-se")}
          </Button>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
};

export default JobDetail;
